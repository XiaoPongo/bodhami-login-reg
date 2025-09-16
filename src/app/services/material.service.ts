import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, firstValueFrom } from 'rxjs';
import { ApiService, Material } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private readonly _materials = new BehaviorSubject<Material[]>([]);
  public readonly materials$: Observable<Material[]> = this._materials.asObservable();

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  /** Fetches the latest materials from the API and updates the stream */
  loadMaterials(): void {
    this.isLoading$.next(true);
    this.apiService.getMaterials().subscribe({
      next: (materials: Material[]) => {
        this._materials.next(materials);
        this.isLoading$.next(false);
      },
      error: (err: any) => {
        console.error("Failed to load materials", err);
        this.isLoading$.next(false);
      }
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

  // --- THIS IS THE FIX: The missing method is now implemented ---
  /** Gets a secure, temporary download URL for a given material */
  getDownloadUrl(materialId: number): Promise<{url: string}> {
    return firstValueFrom(this.apiService.getMaterialDownloadUrl(materialId));
  }
}
