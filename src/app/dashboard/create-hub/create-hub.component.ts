import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionFormComponent } from './mission-form/mission-form.component';
import { CaseStudyFormComponent } from './case-study-form/case-study-form.component';
import { MinigameFormComponent } from './minigame-form/minigame-form.component'; // <-- IMPORT

@Component({
  selector: 'app-create-hub',
  standalone: true,
  imports: [CommonModule, MissionFormComponent, CaseStudyFormComponent, MinigameFormComponent], // <-- ADD
  templateUrl: './create-hub.component.html',
  styleUrls: ['./create-hub.component.css'],
})
export class CreateHubComponent {
  activeTab: 'mission' | 'case-study' | 'minigame' = 'mission';

  setActiveTab(tab: 'mission' | 'case-study' | 'minigame'): void {
    this.activeTab = tab;
  }
}