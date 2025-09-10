import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    return { title: '', description: '', xp: 100, passages: [''], scenarios: [{ description: '', answers: [''] }], classIds: [] };
  }

  addPassage() { this.mission.passages.push(''); }
  removePassage(index: number) { this.mission.passages.splice(index, 1); }

  addScenario() { this.mission.scenarios.push({ description: '', answers: [''] }); }
  removeScenario(scenarioIndex: number) { this.mission.scenarios.splice(scenarioIndex, 1); }

  addAnswer(scenarioIndex: number) { this.mission.scenarios[scenarioIndex].answers.push(''); }
  removeAnswer(scenarioIndex: number, answerIndex: number) { this.mission.scenarios[scenarioIndex].answers.splice(answerIndex, 1); }

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
      reader.onload = (e) => {
        const text = reader.result as string;
        this.parseMissionCsv(text);
      };
      reader.readAsText(file);
    }
  }

  private parseMissionCsv(csvText: string): void {
    const newMission = this.getInitialMissionState();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');

    newMission.passages = [];
    newMission.scenarios = [];
    newMission.classIds = [];

    let currentScenarioIndex = -1;

    for (const line of lines.slice(1)) { 
      const [key, value] = line.split(/,(.+)/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

      switch (key) {
        case 'title': newMission.title = value; break;
        case 'description': newMission.description = value; break;
        case 'xp': newMission.xp = parseInt(value, 10) || 100; break;
        case 'passage': newMission.passages.push(value); break;
        case 'scenario':
          newMission.scenarios.push({ description: value, answers: [] });
          currentScenarioIndex++;
          break;
        case 'answer':
          if (currentScenarioIndex !== -1) newMission.scenarios[currentScenarioIndex].answers.push(value);
          break;
        case 'classId': newMission.classIds.push(value); break;
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
    mission.passages.forEach(p => rows.push(['passage', escape(p)]));
    mission.scenarios.forEach(s => {
      rows.push(['scenario', escape(s.description)]);
      s.answers.forEach(a => rows.push(['answer', escape(a)]));
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

