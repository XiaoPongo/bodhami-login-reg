import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, Material, Classroom } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  // A private BehaviorSubject to hold the current list of materials
  private readonly _materials = new BehaviorSubject<Material[]>([]);
  // A public Observable that components can subscribe to for live updates
  public readonly materials$: Observable<Material[]> = this._materials.asObservable();

  constructor(private apiService: ApiService) {
    this.loadMaterials(); // Load materials when the app starts
  }

  /** Fetches the latest materials from the API and updates the stream */
  loadMaterials(): void {
    this.apiService.getMaterials().subscribe({
      next: (materials: Material[]) => this._materials.next(materials),
      error: (err: any) => console.error("Failed to load materials", err)
    });
  }

  /** Deletes one or more materials via the API and refreshes the list */
  deleteMaterials(ids: number[]): Observable<any> {
    return this.apiService.deleteMaterials(ids).pipe(
      tap(() => this.loadMaterials()) // Reload the list on success
    );
  }

  /** Assigns one or more materials to a class and refreshes the list */
  assignMaterials(ids: number[], classroomId: number | null): Observable<any> {
    return this.apiService.assignMaterials(ids, classroomId).pipe(
      tap(() => this.loadMaterials())
    );
  }
}

