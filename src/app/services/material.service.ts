// material.service.ts (New/Fixed File)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, Material } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  // Holds the list of all materials for the mentor
  private readonly _materials = new BehaviorSubject<Material[]>([]);
  public readonly materials$: Observable<Material[]> = this._materials.asObservable();

  constructor(private apiService: ApiService) {
    this.loadMaterials();
  }

  // --- Public Methods for Components ---

  loadMaterials(): void {
    this.apiService.getMaterials().subscribe({
      next: (materials) => this._materials.next(materials),
      error: (err) => console.error("Failed to load materials", err)
    });
  }

  deleteMaterials(ids: number[]): Observable<any> {
    return this.apiService.deleteMaterials(ids).pipe(
      tap(() => this.loadMaterials())
    );
  }

  assignMaterials(materialIds: number[], classroomId: number | null): Observable<any> {
    return this.apiService.assignMaterials(materialIds, classroomId).pipe(
      tap(() => this.loadMaterials())
    );
  }
}