import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Data Interfaces ---
interface Scenario {
  description: string;
  answers: string[];
}
interface Mission {
  title: string;
  description: string;
  xp: number | null;
  passages: string[];
  phrases: string[];
  scenarios: Scenario[];
  timerPerQuestion: number | null;
  chapter: string | null;
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
  mission: Mission = this.createDefaultMission();
  isSubmitted = false;
  showPreview = false;

  // Mock data for class selection
  availableClasses = [
    { id: 'class_101', name: 'Grade 5 Math - 2025' },
    { id: 'class_102', name: 'Grade 6 Science - 2025' },
    { id: 'class_103', name: 'History 101' }
  ];
  availableChapters = ['Algebra', 'Biology', 'Ancient Civilizations'];

  ngOnInit(): void {
    // Load draft from local storage on component initialization
    const draft = localStorage.getItem('missionDraft');
    if (draft) {
      this.mission = JSON.parse(draft);
    }
  }

  createDefaultMission(): Mission {
    return {
      title: '',
      description: '',
      xp: null,
      passages: [''],
      phrases: [''],
      scenarios: [{ description: '', answers: [''] }],
      timerPerQuestion: null,
      chapter: null,
      classIds: []
    };
  }

  // --- Dynamic Array Methods ---
  addPassage() { this.mission.passages.push(''); this.saveDraft(); }
  removePassage(index: number) { this.mission.passages.splice(index, 1); this.saveDraft(); }

  addPhrase() { this.mission.phrases.push(''); this.saveDraft(); }
  removePhrase(index: number) { this.mission.phrases.splice(index, 1); this.saveDraft(); }

  addScenario() { this.mission.scenarios.push({ description: '', answers: [''] }); this.saveDraft(); }
  removeScenario(index: number) { this.mission.scenarios.splice(index, 1); this.saveDraft(); }

  addAnswer(scenarioIndex: number) { this.mission.scenarios[scenarioIndex].answers.push(''); this.saveDraft(); }
  removeAnswer(scenarioIndex: number, answerIndex: number) { this.mission.scenarios[scenarioIndex].answers.splice(answerIndex, 1); this.saveDraft(); }

  // --- Checkbox Helper ---
  toggleClassSelection(classId: string) {
    const index = this.mission.classIds.indexOf(classId);
    if (index > -1) {
      this.mission.classIds.splice(index, 1);
    } else {
      this.mission.classIds.push(classId);
    }
    this.saveDraft();
  }

  // --- Form Actions ---
  saveDraft() {
    localStorage.setItem('missionDraft', JSON.stringify(this.mission));
  }

  onSubmit() {
    console.log('Form Submitted!', this.mission);
    // Here you would typically send the data to a backend service.
    // For now, we'll just show the success screen.
    this.isSubmitted = true;
    localStorage.removeItem('missionDraft'); // Clear draft on successful submission
  }

  createNew() {
    this.mission = this.createDefaultMission();
    this.isSubmitted = false;
  }

  // --- Export Functionality ---
  exportData(format: 'json' | 'csv') {
    const dataStr = format === 'json'
      ? JSON.stringify(this.mission, null, 2)
      : this.convertToCSV(this.mission);

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mission-${Date.now()}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: Mission): string {
    let csv = `Title,Description,XP,Chapter\n`;
    csv += `"${data.title}","${data.description}",${data.xp},"${data.chapter}"\n\n`;
    csv += `Passages\n"${data.passages.join('","')}"\n\n`;
    csv += `Phrases\n"${data.phrases.join('","')}"\n\n`;
    csv += `Scenarios\n`;
    data.scenarios.forEach(s => {
      csv += `"${s.description}","${s.answers.join('|')}"\n`;
    });
    return csv;
  }

  // Helper for ngFor with primitives
  trackByIndex(index: number, obj: any): any {
    return index;
  }
}

