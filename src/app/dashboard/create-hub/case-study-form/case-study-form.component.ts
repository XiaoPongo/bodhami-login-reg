import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface CaseStudy {
  title: string;
  passage: string;
  scenario: string;
  question: string;
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
  // --- State Management ---
  isSubmitted = false;
  isPreviewing = false;
  caseStudy: CaseStudy = this.getInitialCaseStudyState();
  tagInput: string = ''; // For the tag input field

  // MOCK DATA
  availableClasses = [
    { id: 'c1', name: 'Grade 5 Math - 2025' },
    { id: 'c2', name: 'Grade 6 Science - 2025' },
    { id: 'c3', name: 'History 101' },
    { id: 'c4', name: 'Introduction to Physics' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  getInitialCaseStudyState(): CaseStudy {
    return { title: '', passage: '', scenario: '', question: '', summaryFeedback: '', tags: [], classIds: [] };
  }

  // --- Tag Management ---
  addTag(event: Event) {
    event.preventDefault(); // Prevent form submission on enter
    if (this.tagInput.trim() && !this.caseStudy.tags.includes(this.tagInput.trim())) {
      this.caseStudy.tags.push(this.tagInput.trim());
    }
    this.tagInput = ''; // Clear the input
  }

  removeTag(index: number) {
    this.caseStudy.tags.splice(index, 1);
  }

  // --- Class Assignment ---
  onClassChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const classId = input.value;
    if (input.checked) {
      if (!this.caseStudy.classIds.includes(classId)) this.caseStudy.classIds.push(classId);
    } else {
      const index = this.caseStudy.classIds.indexOf(classId);
      if (index > -1) this.caseStudy.classIds.splice(index, 1);
    }
  }

  // --- Form Actions ---
  togglePreview() { this.isPreviewing = !this.isPreviewing; }
  
  onSubmit() {
    console.log('Case Study Submitted!', this.caseStudy);
    this.isSubmitted = true;
    this.isPreviewing = false;
  }

  resetForm() {
    this.caseStudy = this.getInitialCaseStudyState();
    this.isSubmitted = false;
  }

  navigateToDashboard() {
    this.router.navigate(['/mentor/dashboard']);
  }

  exportToCsv() {
    const cs = this.caseStudy;
    const headers = ['key', 'value'];
    let rows = [
      ['title', `"${cs.title.replace(/"/g, '""')}"`],
      ['passage', `"${cs.passage.replace(/"/g, '""')}"`],
      ['scenario', `"${cs.scenario.replace(/"/g, '""')}"`],
      ['question', `"${cs.question.replace(/"/g, '""')}"`],
      ['summaryFeedback', `"${cs.summaryFeedback.replace(/"/g, '""')}"`],
      ['tags', `"${cs.tags.join(', ')}"`],
      ['classIds', `"${cs.classIds.join(', ')}"`],
    ];

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.setAttribute("download", `case-study_${timestamp}.csv`);
    link.click();
  }
}
