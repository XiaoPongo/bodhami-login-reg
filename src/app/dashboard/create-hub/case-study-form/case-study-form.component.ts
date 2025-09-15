import { Component, OnInit } from '@angular/core';
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
  caseStudy: CaseStudy = this.getNewCaseStudy();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;
  
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
    const selectedClassIds = Object.keys(this.caseStudy.assignedClasses)
      .filter(id => this.caseStudy.assignedClasses[id]);

    if (selectedClassIds.length === 0) {
      alert('Please select at least one class to assign this case study to.');
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
    } catch (error) {
      console.error('An error occurred during file upload:', error);
      alert('An error occurred. Please check the console and try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  generateCsvContent(): string {
    let content = `Title,${this.caseStudy.title}\n`;
    content += `XP,${this.caseStudy.xp}\n`;
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
  
  resetForm(): void {
    this.caseStudy = this.getNewCaseStudy();
    this.submissionSuccess = false;
  }
}