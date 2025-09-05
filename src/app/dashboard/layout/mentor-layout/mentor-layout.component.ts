// src/app/dashboard/layout/mentor-layout/mentor-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-mentor-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './mentor-layout.component.html',
  styleUrls: ['./mentor-layout.component.css'],
})
export class MentorLayoutComponent {}
