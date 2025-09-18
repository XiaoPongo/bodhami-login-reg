import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  @ViewChild('successBox') successBox?: ElementRef<HTMLDivElement>;
  @ViewChild('previewBox') previewBox?: ElementRef<HTMLDivElement>;

  minigame: Minigame = this.getNewMinigame();
  availableClasses$: Observable<Classroom[]>;
  isSubmitting = false;
  submissionSuccess = false;
  isPreviewing = false;

  constructor(
    private router: Router,
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
    const selectedClassIds = Object.keys(this.minigame.assignedClasses).filter(id => this.minigame.assignedClasses[id]);
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
      setTimeout(() => {
        this.successBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    } catch (error) {
      console.error('File upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // --- CSV Export ---
  generateCsvContent(): string {
    let csv = `Title,${this.minigame.title}\nXP,${this.minigame.xp}\nDescription,"${this.minigame.description}"\n`;
    this.minigame.wordBank.forEach((w, i) => csv += `Word Bank ${i + 1},"${w}"\n`);
    this.minigame.wordPairs.forEach((p, i) => {
      csv += `List A Word ${i + 1},"${p.mainWord}"\n`;
      const correct = Object.keys(p.correctAnswers).filter(k => p.correctAnswers[k]);
      csv += `List A Answers ${i + 1},"${correct.join('|')}"\n`;
    });
    return csv;
  }

  // --- CSV Import ---
  parseCsvContent(csv: string): void {
    const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const mg = this.getNewMinigame();
    mg.wordPairs = [];
    mg.wordBank = [];

    let currentPair: WordPair | null = null;

    for (const line of lines) {
      const [rawKey, ...rest] = line.split(',');
      const key = rawKey.trim();
      const value = rest.join(',').replace(/^"|"$/g, '');

      if (key === 'Title') mg.title = value;
      else if (key === 'XP') mg.xp = +value;
      else if (key === 'Description') mg.description = value;
      else if (key.startsWith('Word Bank')) mg.wordBank.push(value);
      else if (key.startsWith('List A Word')) {
        if (currentPair) mg.wordPairs.push(currentPair);
        currentPair = { mainWord: value, correctAnswers: {} };
      }
      else if (key.startsWith('List A Answers') && currentPair) {
        value.split('|').forEach(v => currentPair!.correctAnswers[v.trim()] = true);
      }
    }
    if (currentPair) mg.wordPairs.push(currentPair);
    this.minigame = mg;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.parseCsvContent(e.target?.result as string);
    reader.readAsText(file);
  }

  togglePreview(): void {
    this.isPreviewing = !this.isPreviewing;
    if (this.isPreviewing) {
      setTimeout(() => {
        this.previewBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }

  exportToCsv(): void {
    const blob = new Blob([this.generateCsvContent()], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `minigame-${this.minigame.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  navigateToDashboard(): void { this.router.navigate(['/mentor/dashboard']); }
  resetForm(): void {
    this.minigame = this.getNewMinigame();
    this.submissionSuccess = false;
    this.isPreviewing = false;
  }
}
