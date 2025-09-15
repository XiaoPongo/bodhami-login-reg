import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute
import { Subscription, Observable } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { Classroom, Student, Activity, Material } from '../../services/api.service';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css'],
})
export class ManageClassesComponent implements OnInit, OnDestroy {
  // Use public services for direct async pipe access in the template
  public classes$: Observable<Classroom[]>;
  public selectedClass$: Observable<Classroom | null>;

  isCreateModalOpen = false;
  newClassName = '';
  newClassDescription = '';

  activeContentTab: 'students' | 'materials' | 'activities' = 'students';

  private routeSub: Subscription | undefined;

  constructor(
    public classService: ClassService, // Make public for template access
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.classes$ = this.classService.classes$;
    this.selectedClass$ = this.classService.selectedClass$;
  }

  ngOnInit(): void {
    // Check for a classId in the URL query parameters
    this.routeSub = this.route.queryParams.subscribe(params => {
      const classId = params['classId'];
      if (classId) {
        this.classService.selectClass(Number(classId));
      } else {
        this.classService.selectClass(null); // Clear selection if no ID
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  handleSelectClass(classId: number): void {
    this.router.navigate([], { queryParams: { classId: classId } });
  }

  handleDeleteClass(classId: number, className: string): void {
    if (confirm(`Are you sure you want to permanently delete the class "${className}"?\nThis action cannot be undone.`)) {
      this.classService.deleteClass(classId).subscribe(() => {
        // Clear the query params if the selected class was deleted
        this.router.navigate([], { queryParams: {} });
      });
    }
  }

  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe(() => this.closeCreateModal());
    }
  }
  
  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }
  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newClassName = '';
    this.newClassDescription = '';
  }
  
  setActiveTab(tab: 'students' | 'materials' | 'activities'): void {
    this.activeContentTab = tab;
  }

  copyCode(code: string | undefined): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      alert(`Code "${code}" copied to clipboard!`);
    });
  }
}

