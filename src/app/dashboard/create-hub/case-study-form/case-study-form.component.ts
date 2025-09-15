import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ClassService } from '../../../services/class.service';
import { Classroom } from '../../../services/api.service';

// Interfaces specific to Case Study
interface Problem {
  type: 'qa' | 'mcq' | 'fill';
  question: string;
  options: { text: string }[];
  correctAnswer: string;
  timerInSeconds: number;
}
interface CaseStudy {
  title: string;
  passage: string;
  xp: number;
  problems: Problem[];
  tags: string[];
  assignedClasses: { [classId: string]: boolean };
}

@Component({
  selector: 'app-case-study-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-study-form.component.html',
  styleUrls: ['./case-study-form.component.css']
})
export class CaseStudyFormComponent implements OnInit {
  @ViewChild('successOverlay') successOverlay?: ElementRef<HTMLDivElement>;
  @ViewChild('previewOverlay') previewOverlay?: ElementRef<HTMLDivElement>;

  caseStudy: CaseStudy = this.getNewCaseStudy();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;
  isPreviewing = false;
  
  timerOptions = [
    { value: 0, label: 'No Timer' }, { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' }, { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' }
  ];

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private classService: ClassService
  ) {
    this.availableClasses$ = this.classService.classes$;
  }

  ngOnInit(): void {}

  getNewCaseStudy(): CaseStudy {
    return {
      title: '', passage: '', xp: 150,
      problems: [this.getNewProblem()], tags: [], assignedClasses: {}
    };
  }

  getNewProblem(): Problem {
    return { type: 'qa', question: '', options: [{ text: '' }], correctAnswer: '', timerInSeconds: 0 };
  }

  addProblem() { this.caseStudy.problems.push(this.getNewProblem()); }
  removeProblem(index: number) { this.caseStudy.problems.splice(index, 1); }
  addOption(problem: Problem) { problem.options.push({ text: '' }); }
  removeOption(problem: Problem, index: number) { problem.options.splice(index, 1); }
  trackByFn(index: any, item: any) { return index; }

  async submitForm(): Promise<void> {
    const selectedClassIds = Object.keys(this.caseStudy.assignedClasses).filter(id => this.caseStudy.assignedClasses[id]);
    if (selectedClassIds.length === 0) {
      alert('Please select at least one class.');
      return;
    }

    this.isSubmitting = true;
    const csvContent = this.generateCsvContent();
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `case-study-${this.caseStudy.title.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    const uploadPromises = selectedClassIds.map(classId => 
      this.apiService.uploadFile(csvBlob, 'case-study', fileName, Number(classId)).toPromise()
    );

    try {
      await Promise.all(uploadPromises);
      this.submissionSuccess = true;
      setTimeout(() => {
        this.successOverlay?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } catch (error) {
      console.error('Upload Error:', error);
      alert('An error occurred during upload.');
    } finally {
      this.isSubmitting = false;
    }
  }

  generateCsvContent(): string {
    let content = `Title,${this.caseStudy.title}\nXP,${this.caseStudy.xp}\n`;
    content += `Passage,"${this.caseStudy.passage.replace(/"/g, '""')}"\n`;
    this.caseStudy.problems.forEach((p, i) => {
      content += `Problem ${i + 1} Type,${p.type}\n`;
      content += `Problem ${i + 1} Question,"${p.question.replace(/"/g, '""')}"\n`;
      content += `Problem ${i + 1} Timer,${p.timerInSeconds}\n`;
      p.options.forEach((o, j) => content += `Problem ${i + 1} Option ${j + 1},"${o.text.replace(/"/g, '""')}"\n`);
      content += `Problem ${i + 1} Answer,"${p.correctAnswer.replace(/"/g, '""')}"\n`;
    });
    return content;
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
     alert('CSV parsing for Case Studies is not yet implemented.');
  }
  
  togglePreview(): void {
    this.isPreviewing = !this.isPreviewing;
    if (this.isPreviewing) {
      setTimeout(() => {
        this.previewOverlay?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }
  exportToCsv(): void {
    const csvContent = this.generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `case-study-template-${this.caseStudy.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  navigateToDashboard(): void { this.router.navigate(['/mentor/dashboard']); }
  resetForm(): void {
    this.caseStudy = this.getNewCaseStudy();
    this.submissionSuccess = false;
    this.isPreviewing = false;
  }
}

