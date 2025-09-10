import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Define the structure of your Mission object
interface Mission {
  title: string;
  description: string;
  xp: number;
  passages: string[];
  scenarios: { description: string; answers: string[] }[];
  chapter: string;
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
  mission: Mission = {
    title: '',
    description: '',
    xp: 100,
    passages: [''],
    scenarios: [{ description: '', answers: [''] }],
    chapter: '',
    classIds: []
  };

  // MOCK DATA: In a real app, this would come from a service
  availableClasses = [
    { id: 'c1', name: 'Grade 5 Math - 2025' },
    { id: 'c2', name: 'Grade 6 Science - 2025' },
    { id: 'c3', name: 'History 101' }
  ];

  // ====== THIS IS THE FIX ======
  // Add the 'chapters' property that the template needs
  chapters: string[] = [
    'Chapter 1: Introduction to Algebra',
    'Chapter 2: The Solar System',
    'Chapter 3: Ancient Civilizations',
    'Chapter 4: The Scientific Method'
  ];

  constructor() { }

  ngOnInit(): void {
    // Auto-save logic can go here
  }

  // --- Passage Methods ---
  addPassage() {
    this.mission.passages.push('');
  }
  removePassage(index: number) {
    this.mission.passages.splice(index, 1);
  }

  // --- Scenario & Answer Methods ---
  addScenario() {
    this.mission.scenarios.push({ description: '', answers: [''] });
  }
  removeScenario(scenarioIndex: number) {
    this.mission.scenarios.splice(scenarioIndex, 1);
  }
  addAnswer(scenarioIndex: number) {
    this.mission.scenarios[scenarioIndex].answers.push('');
  }
  removeAnswer(scenarioIndex: number, answerIndex: number) {
    this.mission.scenarios[scenarioIndex].answers.splice(answerIndex, 1);
  }

  // --- Class Assignment ---
  onClassChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const classId = input.value;
    if (input.checked) {
      this.mission.classIds.push(classId);
    } else {
      const index = this.mission.classIds.indexOf(classId);
      if (index > -1) {
        this.mission.classIds.splice(index, 1);
      }
    }
  }


  // --- Form Submission ---
  onSubmit() {
    console.log('Form Submitted!', this.mission);
    // Logic to save data to Supabase or generate a file will go here
  }
}

