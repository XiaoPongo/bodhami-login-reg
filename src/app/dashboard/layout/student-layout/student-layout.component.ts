import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// ✅ FIXED: Corrected the import paths
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.css'],
})
export class StudentLayoutComponent {}
