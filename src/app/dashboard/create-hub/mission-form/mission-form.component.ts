import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ClassService } from '../../../services/class.service';
import { Classroom } from '../../../services/api.service';

// Interfaces for the Mission data structure
interface Answer { text: string; }
interface Scenario {
  type: 'qa' | 'mcq' | 'fill';
  question: string;
  options: Answer[];
  correctAnswer: string;
  timerInSeconds: number;
}
interface Mission {
  title: string;
  description: string;
  xp: number;
  passages: string[];
  scenarios: Scenario[];
  assignedClasses: { [classId: string]: boolean };
}

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.css']
})
export class MissionFormComponent implements OnInit {
  // --- THIS IS THE FIX (Part 1) ---
  // Get references to the VISIBLE content boxes, not the overlays
  @ViewChild('successBox') successBox?: ElementRef<HTMLDivElement>;
  @ViewChild('previewBox') previewBox?: ElementRef<HTMLDivElement>;

  mission: Mission = this.getNewMission();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;
  isPreviewing = false;
  
  timerOptions = [
    { value: 0, label: 'No Timer' }, { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' }, { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' }, { value: 60, label: '1 minute' },
  ];

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private classService: ClassService
  ) {
    this.availableClasses$ = this.classService.classes$;
  }

  ngOnInit(): void {}

  getNewMission(): Mission {
    return {
      title: '', description: '', xp: 100,
      passages: [''], scenarios: [this.getNewScenario()], assignedClasses: {}
    };
  }

  getNewScenario(): Scenario {
    return { type: 'qa', question: '', options: [{ text: '' }], correctAnswer: '', timerInSeconds: 0 };
  }

  addPassage() { this.mission.passages.push(''); }
  removePassage(index: number) { this.mission.passages.splice(index, 1); }
  addScenario() { this.mission.scenarios.push(this.getNewScenario()); }
  removeScenario(index: number) { this.mission.scenarios.splice(index, 1); }
  addOption(scenario: Scenario) { scenario.options.push({ text: '' }); }
  removeOption(scenario: Scenario, index: number) { scenario.options.splice(index, 1); }
  trackByFn(index: any, item: any) { return index; }

  async submitForm(): Promise<void> {
    const selectedClassIds = Object.keys(this.mission.assignedClasses).filter(id => this.mission.assignedClasses[id]);
    if (selectedClassIds.length === 0) {
      alert('Please select at least one class to assign this mission to.');
      return;
    }

    this.isSubmitting = true;
    const csvContent = this.generateCsvContent();
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `mission-${this.mission.title.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    const uploadPromises = selectedClassIds.map(classId => 
      this.apiService.uploadFile(csvBlob, 'mission', fileName, Number(classId)).toPromise()
    );

    try {
      await Promise.all(uploadPromises);
      this.submissionSuccess = true;
      // --- THIS IS THE FIX (Part 2) ---
      // Wait for Angular to render the success box, then scroll it into the center of the view.
      setTimeout(() => {
        this.successBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    } catch (error) {
      console.error('An error occurred during file upload:', error);
      alert('An error occurred. Please check the console and try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.parseCsvContent(e.target?.result as string);
      reader.readAsText(file);
    }
  }

  parseCsvContent(csvText: string): void {
    alert('CSV parsing for Missions is not yet implemented.');
  }

  generateCsvContent(): string {
    let content = `Title,${this.mission.title}\nXP,${this.mission.xp}\n`;
    this.mission.passages.forEach((p, i) => content += `Passage ${i + 1},"${p.replace(/"/g, '""')}"\n`);
    this.mission.scenarios.forEach((s, i) => {
      content += `Problem ${i + 1} Type,${s.type}\n`;
      content += `Problem ${i + 1} Question,"${s.question.replace(/"/g, '""')}"\n`;
      content += `Problem ${i + 1} Timer,${s.timerInSeconds}\n`;
      s.options.forEach((o, j) => content += `Problem ${i + 1} Option ${j + 1},"${o.text.replace(/"/g, '""')}"\n`);
      content += `Problem ${i + 1} Answer,"${s.correctAnswer.replace(/"/g, '""')}"\n`;
    });
    return content;
  }
  
  togglePreview(): void {
    this.isPreviewing = !this.isPreviewing;
    if (this.isPreviewing) {
      // --- THIS IS THE FIX (Part 2) ---
      // Wait for Angular to render the preview box, then scroll it into the center of the view.
      setTimeout(() => {
        this.previewBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }

  exportToCsv(): void {
    const csvContent = this.generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mission-template-${this.mission.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/mentor/dashboard']);
  }

  resetForm(): void {
    this.mission = this.getNewMission();
    this.submissionSuccess = false;
    this.isPreviewing = false;
  }
}