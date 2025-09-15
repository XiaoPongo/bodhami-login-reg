import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { ApiService, Material, Classroom } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  // A private BehaviorSubject to hold the current list of materials
  private readonly _materials = new BehaviorSubject<Material[]>([]);
  // A public Observable that components can subscribe to for live updates
  public readonly materials$: Observable<Material[]> = this._materials.asObservable();

  // MOCKED DATA: This simulates what the API would return.
  private mockMaterials: Material[] = [
    { id: 1, displayName: 'Introduction-to-Physics.docx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mentorId: 'mentor1', uploadedAt: new Date('2025-09-10'), classroom: { id: 2 } as Classroom },
    { id: 2, displayName: 'Chemistry-Lab-Results.xlsx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', mentorId: 'mentor1', uploadedAt: new Date('2025-09-11'), classroom: { id: 4 } as Classroom },
    { id: 3, displayName: 'Important-Student-Data.csv', s3Url: '#', fileType: 'text/csv', mentorId: 'mentor1', uploadedAt: new Date('2025-09-12'), classroom: null },
  ];

  constructor(private apiService: ApiService) {
    this.loadMaterials(); // Load initial mock data
  }

  /** Fetches the latest materials and updates the stream */
  loadMaterials(): void {
    // In the future, this will call this.apiService.getMaterials()
    this._materials.next(this.mockMaterials);
  }

  /** Adds a new material to our local mock list */
  addMockMaterial(material: Material) {
    this.mockMaterials.unshift(material);
    this.loadMaterials();
  }

  /** Deletes one or more materials from our local mock list */
  deleteMaterials(ids: number[]): Observable<any> {
    this.mockMaterials = this.mockMaterials.filter(m => !ids.includes(m.id));
    this.loadMaterials();
    return of({ success: true }); // Return a successful observable
  }

  /** Assigns one or more materials to a class in our local mock list */
  assignMaterials(ids: number[], classroom: Classroom | null): Observable<any> {
    this.mockMaterials.forEach(material => {
      if (ids.includes(material.id)) {
        material.classroom = classroom;
      }
    });
    this.loadMaterials();
    return of({ success: true });
  }
}

