import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ClassService } from '../../../services/class.service';
import { Classroom } from '../../../services/api.service';

interface Answer { text: string; }
interface Scenario {
  type: 'qa' | 'mcq' | 'fill';
  question: string;
  options: Answer[];
  correctAnswer: number | string;
  timerInSeconds: number;
}
interface Mission {
  title: string;
  description: string;
  xp: number;
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
  @ViewChild('successBox') successBox?: ElementRef<HTMLDivElement>;
  @ViewChild('previewBox') previewBox?: ElementRef<HTMLDivElement>;

  mission: Mission = this.getNewMission();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;
  isPreviewing = false;
  
  timerOptions = [
    { value: 0, label: 'No Timer' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' }
  ];

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private classService: ClassService
  ) {
    this.availableClasses$ = this.classService.classes$;
  }

  ngOnInit(): void {}

  // Factory
  getNewMission(): Mission {
    return {
      title: '', description: '', xp: 100,
      scenarios: [this.getNewScenario()], assignedClasses: {}
    };
  }

  getNewScenario(): Scenario {
    return { type: 'qa', question: '', options: [{ text: '' }], correctAnswer: '', timerInSeconds: 0 };
  }

  // Helpers
  addScenario() { this.mission.scenarios.push(this.getNewScenario()); }
  removeScenario(index: number) { this.mission.scenarios.splice(index, 1); }
  addOption(s: Scenario) { s.options.push({ text: '' }); }
  removeOption(s: Scenario, index: number) { s.options.splice(index, 1); }
  trackByFn(index: any, item: any) { return index; }

  // Submit
  async submitForm(): Promise<void> {
    const selectedClassIds = Object.keys(this.mission.assignedClasses).filter(id => this.mission.assignedClasses[id]);
    if (selectedClassIds.length === 0) {
      alert('Please select at least one class.');
      return;
    }

    this.isSubmitting = true;
    const csvContent = this.generateCsvContent();
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `mission-${this.mission.title.replace(/\s+/g, '-')}-${Date.now()}.csv`;

    try {
      const uploadPromises = selectedClassIds.map(classId => 
        this.apiService.uploadFile(csvBlob, 'mission', fileName, Number(classId)).toPromise()
      );
      await Promise.all(uploadPromises);
      this.submissionSuccess = true;
      setTimeout(() => this.successBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('An error occurred. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // CSV Export
  generateCsvContent(): string {
    let csv = `Title,${this.mission.title}\nXP,${this.mission.xp}\nDescription,"${this.mission.description}"\n`;
    this.mission.scenarios.forEach((s, i) => {
      csv += `Scenario ${i + 1} Type,${s.type}\n`;
      csv += `Scenario ${i + 1} Question,"${s.question}"\n`;
      csv += `Scenario ${i + 1} Timer,${s.timerInSeconds}\n`;
      s.options.forEach((o, j) => csv += `Scenario ${i + 1} Option ${j + 1},"${o.text}"\n`);
      if (s.type === 'mcq' && typeof s.correctAnswer === 'number') {
        csv += `Scenario ${i + 1} Answer,"${s.options[s.correctAnswer]?.text || ''}"\n`;
      } else {
        csv += `Scenario ${i + 1} Answer,"${s.correctAnswer}"\n`;
      }
    });
    return csv;
  }

  // CSV Import
  parseCsvContent(csvText: string): void {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const mission = this.getNewMission();
    mission.scenarios = [];

    let current: Scenario | null = null;

    for (const line of lines) {
      const [rawKey, ...rest] = line.split(',');
      const key = rawKey.trim();
      const value = rest.join(',').replace(/^"|"$/g, '');

      if (key === 'Title') mission.title = value;
      else if (key === 'XP') mission.xp = +value;
      else if (key === 'Description') mission.description = value;
      else if (key.includes('Type')) {
        if (current) mission.scenarios.push(current);
        current = this.getNewScenario();
        current.type = value as any;
      }
      else if (key.includes('Question')) current!.question = value;
      else if (key.includes('Timer')) current!.timerInSeconds = +value;
      else if (key.includes('Option')) current!.options.push({ text: value });
      else if (key.includes('Answer')) current!.correctAnswer = value;
    }
    if (current) mission.scenarios.push(current);

    mission.scenarios.forEach(s => {
      if (s.type === 'mcq' && typeof s.correctAnswer === 'string') {
        const idx = s.options.findIndex(o => o.text === s.correctAnswer);
        s.correctAnswer = idx >= 0 ? idx : '';
      }
    });

    this.mission = mission;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.parseCsvContent(e.target?.result as string);
    reader.readAsText(file);
  }

  togglePreview(): void {
    this.isPreviewing = !this.isPreviewing;
    if (this.isPreviewing) {
      setTimeout(() => this.previewBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }

  exportToCsv(): void {
    const blob = new Blob([this.generateCsvContent()], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mission-${this.mission.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  navigateToDashboard(): void { this.router.navigate(['/mentor/dashboard']); }
  resetForm(): void { this.mission = this.getNewMission(); this.submissionSuccess = false; this.isPreviewing = false; }
}
