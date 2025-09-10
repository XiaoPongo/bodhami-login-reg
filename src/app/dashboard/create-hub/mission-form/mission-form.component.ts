import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import the Router

interface Mission {
  title: string;
  description: string;
  xp: number;
  passages: string[];
  scenarios: { description: string; answers: string[] }[];
  classIds: string[];
}

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.css']
})
export class MissionFormComponent implements OnInit {
  // --- State Management ---
  isSubmitted = false;
  isPreviewing = false;

  mission: Mission = this.getInitialMissionState();

  // MOCK DATA
  availableClasses = [
    { id: 'c1', name: 'Grade 5 Math - 2025' },
    { id: 'c2', name: 'Grade 6 Science - 2025' },
    { id: 'c3', name: 'History 101' },
    { id: 'c4', name: 'Introduction to Physics' }
  ];

  constructor(private router: Router) { } // Inject the Router

  ngOnInit(): void {
    // Future: Load draft from localStorage
  }

  // --- Initial State Helper ---
  getInitialMissionState(): Mission {
    return {
      title: '',
      description: '',
      xp: 100,
      passages: [''],
      scenarios: [{ description: '', answers: [''] }],
      classIds: []
    };
  }

  // --- Dynamic List Methods ---
  addPassage() { this.mission.passages.push(''); }
  removePassage(index: number) { this.mission.passages.splice(index, 1); }

  addScenario() { this.mission.scenarios.push({ description: '', answers: [''] }); }
  removeScenario(scenarioIndex: number) { this.mission.scenarios.splice(scenarioIndex, 1); }

  addAnswer(scenarioIndex: number) { this.mission.scenarios[scenarioIndex].answers.push(''); }
  removeAnswer(scenarioIndex: number, answerIndex: number) { this.mission.scenarios[scenarioIndex].answers.splice(answerIndex, 1); }

  // --- trackBy Functions ---
  trackByFn(index: number, item: any): number {
    return index;
  }

  // --- Class Assignment ---
  onClassChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const classId = input.value;
    if (input.checked) {
      if (!this.mission.classIds.includes(classId)) {
        this.mission.classIds.push(classId);
      }
    } else {
      const index = this.mission.classIds.indexOf(classId);
      if (index > -1) {
        this.mission.classIds.splice(index, 1);
      }
    }
  }

  // --- Form Actions ---
  togglePreview() {
    this.isPreviewing = !this.isPreviewing;
  }

  onSubmit() {
    console.log('Form Submitted!', this.mission);
    this.isSubmitted = true;
    this.isPreviewing = false;
    // Future: Save data to Supabase here
  }

  resetForm() {
    this.mission = this.getInitialMissionState();
    this.isSubmitted = false;
  }
  
  // ====== ADDED: Navigation Method ======
  navigateToDashboard() {
    this.router.navigate(['/mentor/dashboard']);
  }

  // ====== ADDED: CSV Export Method ======
  exportToCsv() {
    const mission = this.mission;
    const headers = ['type', 'key', 'value'];
    const rows = [];

    const escapeCsv = (val: any) => {
      if (typeof val === 'string') {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    // Add mission metadata
    rows.push(['metadata', 'title', escapeCsv(mission.title)]);
    rows.push(['metadata', 'description', escapeCsv(mission.description)]);
    rows.push(['metadata', 'xp', mission.xp]);

    // Add passages
    mission.passages.forEach((passage, index) => {
      rows.push(['passage', index + 1, escapeCsv(passage)]);
    });

    // Add scenarios and their answers
    mission.scenarios.forEach((scenario, sIndex) => {
      rows.push(['scenario', sIndex + 1, escapeCsv(scenario.description)]);
      scenario.answers.forEach((answer, aIndex) => {
        rows.push(['answer', `${sIndex + 1}.${aIndex + 1}`, escapeCsv(answer)]);
      });
    });

    // Add assigned class IDs
    mission.classIds.forEach(classId => {
      rows.push(['class', 'id', escapeCsv(classId)]);
    });

    // Combine headers and rows into CSV string
    let csvContent = headers.join(',') + '\n';
    rows.forEach(rowArray => {
      csvContent += rowArray.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.setAttribute("download", `mission_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}