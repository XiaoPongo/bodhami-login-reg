import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-case-study-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-study-form.component.html',
  styleUrls: ['./case-study-form.component.css']
})
export class CaseStudyFormComponent {
  // Logic for case study form will go here
  // It will be very similar to the mission form but with additional fields.
}

