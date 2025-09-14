import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type QuestionType = 'qa' | 'mcq' | 'fib';

interface MCQOption {
  text: string;
}

interface Scenario {
  type: QuestionType;
  question: string;
  options: MCQOption[];
  answers: string[];
  correctMcqIndex?: number;
}

interface Mission {
  title: string;
  description: string;
  xp: number;
  passages: string[];
  scenarios: Scenario[];
  classIds: string[];
}

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-form.component.html',
  styleUrls: [
    './mission-form.component.css',
    '../shared-form-styles.css'
  ]
})
export class MissionFormComponent implements OnInit {
  isSubmitted = false;
  isPreviewing = false;
  mission: Mission = this.getInitialMissionState();

  availableClasses = [
    { id: 'c1', name: 'Grade 5 Math - 2025' },
    { id: 'c2', name: 'Grade 6 Science - 2025' },
    { id: 'c3', name: 'History 101' },
    { id: 'c4', name: 'Introduction to Physics' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {}

  getInitialMissionState(): Mission {
    return {
      title: '',
      description: '',
      xp: 100,
      passages: [''],
      scenarios: [{ type: 'qa', question: '', options: [], answers: [''], correctMcqIndex: undefined }],
      classIds: []
    };
  }

  addPassage() { this.mission.passages.push(''); }
  removePassage(index: number) { this.mission.passages.splice(index, 1); }

  addScenario() {
    this.mission.scenarios.push({ type: 'qa', question: '', options: [], answers: [''], correctMcqIndex: undefined });
  }
  removeScenario(scenarioIndex: number) {
    this.mission.scenarios.splice(scenarioIndex, 1);
  }

  onQuestionTypeChange(scenarioIndex: number, newType: QuestionType) {
    const scenario = this.mission.scenarios[scenarioIndex];
    scenario.options = [];
    scenario.answers = [''];
    scenario.correctMcqIndex = undefined;
    if (newType === 'mcq') {
      scenario.options = [{ text: '' }, { text: '' }];
      scenario.answers = []; // MCQ answer is stored in correctMcqIndex
    }
  }

  addMcqOption(scenarioIndex: number) { this.mission.scenarios[scenarioIndex].options.push({ text: '' }); }
  removeMcqOption(scenarioIndex: number, optionIndex: number) {
    this.mission.scenarios[scenarioIndex].options.splice(optionIndex, 1);
  }

  addAnswer(scenarioIndex: number) { this.mission.scenarios[scenarioIndex].answers.push(''); }
  removeAnswer(scenarioIndex: number, answerIndex: number) {
    this.mission.scenarios[scenarioIndex].answers.splice(answerIndex, 1);
  }

  trackByFn(index: number, item: any): number { return index; }

  onClassChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const classId = input.value;
    if (input.checked) {
      if (!this.mission.classIds.includes(classId)) this.mission.classIds.push(classId);
    } else {
      this.mission.classIds = this.mission.classIds.filter(id => id !== classId);
    }
  }

  togglePreview() { this.isPreviewing = !this.isPreviewing; }

  onSubmit() {
    this.isSubmitted = true;
    this.isPreviewing = false;
  }

  resetForm() {
    this.mission = this.getInitialMissionState();
    this.isSubmitted = false;
  }
  
  navigateToDashboard() { this.router.navigate(['/mentor/dashboard']); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.parseMissionCsv(reader.result as string);
      reader.readAsText(file);
    }
  }

  private parseMissionCsv(csvText: string): void {
    const newMission = this.getInitialMissionState();
    newMission.passages = []; newMission.scenarios = []; newMission.classIds = [];
    const lines = csvText.split('\n').filter(line => line.trim() !== '');

    for (const line of lines.slice(1)) {
      const [key, value] = line.split(/,(.+)/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      const keyParts = key.split('_');
      
      const index = parseInt(keyParts[1], 10) - 1;
      
      switch (keyParts[0]) {
        case 'title': newMission.title = value; break;
        case 'description': newMission.description = value; break;
        case 'xp': newMission.xp = parseInt(value, 10) || 100; break;
        case 'passage':
          // Ensure array is large enough
          while(newMission.passages.length <= index) newMission.passages.push('');
          newMission.passages[index] = value; 
          break;
        case 'classId': newMission.classIds.push(value); break;
        case 'scenario':
          const scenarioField = keyParts[2];
          const answerOrOptionIndex = parseInt(keyParts[3], 10) - 1;

          while(newMission.scenarios.length <= index) newMission.scenarios.push({ type: 'qa', question: '', options: [], answers: [] });
          const scenario = newMission.scenarios[index];

          if (scenarioField === 'type') scenario.type = value as QuestionType;
          if (scenarioField === 'question') scenario.question = value;
          if (scenarioField === 'answer') scenario.answers[answerOrOptionIndex] = value;
          if (scenarioField === 'option') scenario.options[answerOrOptionIndex] = { text: value };
          if (scenarioField === 'correctOptionIndex') scenario.correctMcqIndex = parseInt(value, 10);
          break;
      }
    }
    this.mission = newMission;
  }

  exportToCsv() {
    const mission = this.mission;
    const rows = [['Key', 'Value']];
    const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

    rows.push(['title', escape(mission.title)]);
    rows.push(['description', escape(mission.description)]);
    rows.push(['xp', mission.xp.toString()]);
    mission.passages.forEach((p, i) => rows.push([`passage_${i + 1}`, escape(p)]));
    mission.scenarios.forEach((s, i) => {
      rows.push([`scenario_${i + 1}_type`, s.type]);
      rows.push([`scenario_${i + 1}_question`, escape(s.question)]);
      if (s.type === 'qa' || s.type === 'fib') {
        s.answers.forEach((a, j) => rows.push([`scenario_${i + 1}_answer_${j + 1}`, escape(a)]));
      }
      if (s.type === 'mcq') {
        s.options.forEach((o, j) => rows.push([`scenario_${i + 1}_option_${j + 1}`, escape(o.text)]));
        if (s.correctMcqIndex !== undefined) {
          rows.push([`scenario_${i + 1}_correctOptionIndex`, s.correctMcqIndex.toString()]);
        }
      }
    });
    mission.classIds.forEach(id => rows.push(['classId', escape(id)]));

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.download = `mission_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}


