import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { ApiService, Material } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private readonly _materials = new BehaviorSubject<Material[]>([]);
  public readonly materials$: Observable<Material[]> = this._materials.asObservable();

  private readonly _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();

  constructor(private apiService: ApiService) {}

  /** Fetches the latest materials from the API and updates the stream */
  loadMaterials(): void {
    this._isLoading.next(true);
    this.apiService.getMaterials().pipe(
      finalize(() => this._isLoading.next(false))
    ).subscribe({
      next: (materials: Material[]) => this._materials.next(materials),
      error: (err: any) => console.error("Failed to load materials", err)
    });
  }

  /** Deletes one or more materials via the API and refreshes the list */
  deleteMaterials(ids: number[]): Observable<any> {
    if (ids.length === 0) return throwError(() => new Error('No material IDs provided for deletion.'));
    return this.apiService.deleteMaterials(ids).pipe(
      tap(() => this.loadMaterials()) // Auto-refresh on success
    );
  }

  /** Assigns one or more materials to a class and refreshes the list */
  assignMaterials(ids: number[], classroomId: number | null): Observable<any> {
    if (ids.length === 0) return throwError(() => new Error('No material IDs provided for assignment.'));
    return this.apiService.assignMaterials(ids, classroomId).pipe(
      tap(() => this.loadMaterials()) // Auto-refresh on success
    );
  }
}
