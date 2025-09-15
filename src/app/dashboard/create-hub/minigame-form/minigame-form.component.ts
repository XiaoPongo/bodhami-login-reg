import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ClassService } from '../../../services/class.service';
import { Classroom } from '../../../services/api.service';

interface WordPair {
  mainWord: string;
  correctAnswers: { [word: string]: boolean };
}
interface Minigame {
  title: string;
  description: string;
  xp: number;
  wordPairs: WordPair[];
  wordBank: string[];
  assignedClasses: { [classId: string]: boolean };
}

@Component({
  selector: 'app-minigame-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './minigame-form.component.html',
  styleUrls: ['./minigame-form.component.css']
})
export class MinigameFormComponent implements OnInit {
  minigame: Minigame = this.getNewMinigame();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;

  constructor(
    private apiService: ApiService,
    private classService: ClassService
  ) {
    this.availableClasses$ = this.classService.classes$;
  }

  ngOnInit(): void { }

  getNewMinigame(): Minigame {
    return {
      title: '', description: '', xp: 50,
      wordPairs: [{ mainWord: '', correctAnswers: {} }],
      wordBank: [''], assignedClasses: {}
    };
  }

  addWordPair() { this.minigame.wordPairs.push({ mainWord: '', correctAnswers: {} }); }
  removeWordPair(index: number) { this.minigame.wordPairs.splice(index, 1); }
  addWordToBank() { this.minigame.wordBank.push(''); }
  removeWordFromBank(index: number) { this.minigame.wordBank.splice(index, 1); }
  trackByFn(index: any, item: any) { return index; }

  async submitForm(): Promise<void> {
    const selectedClassIds = Object.keys(this.minigame.assignedClasses)
      .filter(id => this.minigame.assignedClasses[id]);

    if (selectedClassIds.length === 0) {
      alert('Please select at least one class.');
      return;
    }

    this.isSubmitting = true;
    const csvContent = this.generateCsvContent();
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `minigame-${this.minigame.title.replace(/\s+/g, '-')}-${Date.now()}.csv`;

    const uploadPromises = selectedClassIds.map(classId => 
      this.apiService.uploadFile(csvBlob, 'minigame', fileName, Number(classId)).toPromise()
    );

    try {
      await Promise.all(uploadPromises);
      this.submissionSuccess = true;
    } catch (error) {
      console.error('File upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      this.isSubmitting = false;
    }
  }

  generateCsvContent(): string {
    let content = `Title,${this.minigame.title}\nXP,${this.minigame.xp}\n`;
    this.minigame.wordBank.forEach((w, i) => content += `Word Bank ${i + 1},"${w.replace(/"/g, '""')}"\n`);
    this.minigame.wordPairs.forEach((p, i) => {
      content += `List A Word ${i + 1},"${p.mainWord.replace(/"/g, '""')}"\n`;
      const correct = Object.keys(p.correctAnswers).filter(key => p.correctAnswers[key]);
      content += `List A Answers ${i + 1},"${correct.join('|')}"\n`;
    });
    return content;
  }
  
  resetForm(): void {
    this.minigame = this.getNewMinigame();
    this.submissionSuccess = false;
  }
}