import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LEVEL_THRESHOLDS } from '../config/xp-config';

export interface StudentProgress {
  xp: number;
  level: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentProgressService {
  // Use a BehaviorSubject to hold and stream the student's progress
  private progressSubject = new BehaviorSubject<StudentProgress>(this.calculateProgress(0));
  public progress$: Observable<StudentProgress> = this.progressSubject.asObservable();

  constructor() {
    // In a real app, you'd fetch the initial XP from the API here
    // For now, we start with a mock value, e.g. 650xp
    this.setXp(650);
  }

  // This is the main method to update XP
  addXp(amount: number): void {
    const currentXp = this.progressSubject.value.xp + amount;
    this.setXp(currentXp);
  }
  
  setXp(totalXp: number): void {
    const newProgress = this.calculateProgress(totalXp);
    this.progressSubject.next(newProgress);
  }

  // The core logic for calculating level based on XP
  private calculateProgress(xp: number): StudentProgress {
    let currentLevel = 1;
    let xpForNextLevel = LEVEL_THRESHOLDS[1]?.xp || Infinity;
    let progressPercentage = 0;

    // Find the current level
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i].xp) {
        currentLevel = LEVEL_THRESHOLDS[i].level;
        break;
      }
    }

    const currentLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1);

    if (currentLevelThreshold && nextLevelThreshold) {
      const xpInCurrentLevel = xp - currentLevelThreshold.xp;
      const xpNeededForLevel = nextLevelThreshold.xp - currentLevelThreshold.xp;
      xpForNextLevel = nextLevelThreshold.xp;
      progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;
    } else {
      // Max level reached
      xpForNextLevel = xp;
      progressPercentage = 100;
    }

    return {
      xp: xp,
      level: currentLevel,
      xpForNextLevel: xpForNextLevel,
      progressPercentage: Math.min(progressPercentage, 100) // Cap at 100%
    };
  }
}