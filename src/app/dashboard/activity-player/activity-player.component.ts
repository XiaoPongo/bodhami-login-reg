import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Activity } from '../../services/api.service';
import { LEVEL_THRESHOLDS } from '../../config/xp-config'; // ✅ correct path

interface Question {
  type: 'qa' | 'mcq' | 'fill';
  question: string;
  options?: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-activity-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-player.component.html',
  styleUrls: ['./activity-player.component.css'],
})
export class ActivityPlayerComponent {
  @Input() activity!: Activity;
  @Output() closed = new EventEmitter<void>();

  // --- State ---
  questions: Question[] = [];
  currentIndex = 0;
  userAnswer: string = '';
  finished = false;
  feedback: string | null = null;
  showCongrats = false;

  // XP tracking
  earnedXp = 0;
  progressLevel = 1;

  ngOnInit(): void {
    // fallback: ensure activity.questions exists
    this.questions = (this.activity as any).questions || [];
  }

  submitAnswer(): void {
    if (!this.questions.length) return;
    const current = this.questions[this.currentIndex];

    if (this.userAnswer.trim() === '') return;

    if (this.userAnswer === current.correctAnswer) {
      this.feedback = '✅ Correct!';
      this.showCongrats = true;
      this.earnedXp += this.activity.xp || 0;
      this.updateLevel();

      setTimeout(() => {
        this.showCongrats = false;
        this.nextQuestion();
      }, 2000);
    } else {
      this.feedback = '❌ Incorrect. Try again!';
    }
  }

  nextQuestion(): void {
    this.userAnswer = '';
    this.feedback = null;

    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.finished = true;
    }
  }

  updateLevel(): void {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.earnedXp >= LEVEL_THRESHOLDS[i].xp) {
        this.progressLevel = LEVEL_THRESHOLDS[i].level;
        break;
      }
    }
  }

  close(): void {
    this.closed.emit();
  }
}
