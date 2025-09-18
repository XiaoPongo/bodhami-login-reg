import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, Student } from './api.service';
import { LEVEL_THRESHOLDS } from '../config/xp-config';

// --- Interfaces ---
export interface StudentProgress {
  xp: number;
  level: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

export interface StreakStage {
  name: string;
  icon: string;
  description: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentProgressService {
  // Loading state
  public isLoading$ = new BehaviorSubject<boolean>(true);

  // Progress state
  private readonly _progress = new BehaviorSubject<StudentProgress | null>(null);
  public readonly progress$: Observable<StudentProgress | null> =
    this._progress.asObservable();

  // Streak state
  private readonly _streakStage = new BehaviorSubject<StreakStage>(
    this.calculateStreakStage(0)
  );
  public readonly streakStage$: Observable<StreakStage> =
    this._streakStage.asObservable();

  // Student profile cache
  private currentStudent: Student | null = null;

  constructor(private apiService: ApiService) {
    this.loadInitialProfile();
  }

  // --- Initial profile load ---
  private async loadInitialProfile() {
    this.isLoading$.next(true);
    try {
      const student = await this.apiService.getStudentProfile();
      this.currentStudent = student;
      this.updateProgress(student.xp);
    } catch (error) {
      console.error('Failed to load student profile', error);
      // Default state on failure
      this.updateProgress(0);
    } finally {
      this.isLoading$.next(false);
    }
  }

  // --- XP update ---
  public addXp(amount: number): void {
    if (!this.currentStudent) return;

    const newXp = this.currentStudent.xp + amount;

    // TODO: integrate API call to persist XP (e.g. this.apiService.updateXp(newXp))
    this.currentStudent.xp = newXp;

    this.updateProgress(newXp);
  }

  // --- Push new progress to stream ---
  private updateProgress(xp: number): void {
    const newProgress = this.calculateProgress(xp);
    this._progress.next(newProgress);
  }

  // --- Calculate level progress ---
  private calculateProgress(xp: number): StudentProgress {
    let currentLevel = 1;
    let xpForNextLevel = Infinity;
    let progressPercentage = 0;

    const sortedThresholds = [...LEVEL_THRESHOLDS].sort((a, b) => a.xp - b.xp);

    // Find current level
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (xp >= sortedThresholds[i].xp) {
        currentLevel = sortedThresholds[i].level;
        break;
      }
    }

    // Find next level
    const currentLevelData = sortedThresholds.find(t => t.level === currentLevel);
    const nextLevelData = sortedThresholds.find(t => t.level === currentLevel + 1);

    if (currentLevelData && nextLevelData) {
      const xpInCurrentLevel = xp - currentLevelData.xp;
      const xpNeededForLevel = nextLevelData.xp - currentLevelData.xp;
      xpForNextLevel = nextLevelData.xp;
      progressPercentage =
        xpNeededForLevel > 0
          ? (xpInCurrentLevel / xpNeededForLevel) * 100
          : 100;
    } else {
      // Max level reached
      xpForNextLevel = xp;
      progressPercentage = 100;
    }

    return {
      xp,
      level: currentLevel,
      xpForNextLevel,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  }

  // --- Calculate streak stage (placeholder for now) ---
  private calculateStreakStage(streakDays: number): StreakStage {
    if (streakDays >= 12)
      return {
        name: 'Full Plant',
        icon: 'fa-solid fa-tree',
        description: 'Your learning habit is flourishing!',
        progress: 100,
      };
    if (streakDays >= 8)
      return {
        name: 'Young Plant',
        icon: 'fa-solid fa-seedling',
        description: 'Growing strong! Consistency is key.',
        progress: 75,
      };
    if (streakDays >= 4)
      return {
        name: 'Sapling',
        icon: 'fa-solid fa-leaf',
        description: 'Your streak has sprouted!',
        progress: 50,
      };
    if (streakDays >= 1)
      return {
        name: 'Seed',
        icon: 'fa-solid fa-circle-dot',
        description: 'A new streak has been planted.',
        progress: 25,
      };
    return {
      name: 'No Streak',
      icon: 'fa-solid fa-circle',
      description: 'Start a new streak!',
      progress: 0,
    };
  }
}
