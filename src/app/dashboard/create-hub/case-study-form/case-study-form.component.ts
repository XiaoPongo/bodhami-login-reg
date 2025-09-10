import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Problem {
  scenario: string;
  question: string;
}

interface CaseStudy {
  title: string;
  passage: string;
  problems: Problem[];
  summaryFeedback: string;
  tags: string[];
  classIds: string[];
}

@Component({
  selector: 'app-case-study-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-study-form.component.html',
  styleUrls: ['./case-study-form.component.css']
})
export class CaseStudyFormComponent implements OnInit {
  isSubmitted = false;
  isPreviewing = false;
  caseStudy: CaseStudy = this.getInitialCaseStudyState();
  tagInput: string = '';

  availableClasses = [
    { id: 'c1', name: 'Grade 5 Math - 2025' },
    { id: 'c2', name: 'Grade 6 Science - 2025' },
    { id: 'c3', name: 'History 101' },
    { id: 'c4', name: 'Introduction to Physics' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  getInitialCaseStudyState(): CaseStudy {
    return { title: '', passage: '', problems: [{ scenario: '', question: '' }], summaryFeedback: '', tags: [], classIds: [] };
  }
  
  trackByFn(index: number, item: any): number { return index; }

  addProblem() { this.caseStudy.problems.push({ scenario: '', question: '' }); }
  removeProblem(index: number) { this.caseStudy.problems.splice(index, 1); }

  addTag(event: Event) {
    event.preventDefault();
    if (this.tagInput.trim() && !this.caseStudy.tags.includes(this.tagInput.trim())) {
      this.caseStudy.tags.push(this.tagInput.trim());
    }
    this.tagInput = '';
  }
  removeTag(index: number) { this.caseStudy.tags.splice(index, 1); }
  
  onClassChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const classId = input.value;
    if (input.checked) {
      if (!this.caseStudy.classIds.includes(classId)) this.caseStudy.classIds.push(classId);
    } else {
      this.caseStudy.classIds = this.caseStudy.classIds.filter(id => id !== classId);
    }
  }

  togglePreview() { this.isPreviewing = !this.isPreviewing; }
  
  onSubmit() {
    this.isSubmitted = true;
    this.isPreviewing = false;
  }

  resetForm() {
    this.caseStudy = this.getInitialCaseStudyState();
    this.isSubmitted = false;
  }
  
  navigateToDashboard() { this.router.navigate(['/mentor/dashboard']); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.parseCaseStudyCsv(reader.result as string);
      reader.readAsText(file);
    }
  }

  private parseCaseStudyCsv(csvText: string): void {
    const newCs = this.getInitialCaseStudyState();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    newCs.problems = []; newCs.tags = []; newCs.classIds = [];

    for (const line of lines.slice(1)) {
      const [key, value] = line.split(/,(.+)/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      const keyParts = key.split('_'); 
      
      switch (keyParts[0]) {
        case 'title': newCs.title = value; break;
        case 'passage': newCs.passage = value; break;
        case 'summaryFeedback': newCs.summaryFeedback = value; break;
        case 'tag': newCs.tags.push(value); break;
        case 'classId': newCs.classIds.push(value); break;
        case 'problem':
          const index = parseInt(keyParts[2], 10) - 1;
          if (!newCs.problems[index]) newCs.problems[index] = { scenario: '', question: '' };
          if (keyParts[1] === 'scenario') newCs.problems[index].scenario = value;
          if (keyParts[1] === 'question') newCs.problems[index].question = value;
          break;
      }
    }
    this.caseStudy = newCs;
  }

  exportToCsv() {
    const cs = this.caseStudy;
    const rows = [['Key', 'Value']];
    const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;
    
    rows.push(['title', escape(cs.title)]);
    rows.push(['passage', escape(cs.passage)]);
    cs.problems.forEach((p, i) => {
      rows.push([`problem_scenario_${i + 1}`, escape(p.scenario)]);
      rows.push([`problem_question_${i + 1}`, escape(p.question)]);
    });
    rows.push(['summaryFeedback', escape(cs.summaryFeedback)]);
    cs.tags.forEach(t => rows.push(['tag', escape(t)]));
    cs.classIds.forEach(id => rows.push(['classId', escape(id)]));

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `case-study_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

