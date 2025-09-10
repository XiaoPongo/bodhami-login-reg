import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionFormComponent } from './mission-form/mission-form.component';
import { CaseStudyFormComponent } from './case-study-form/case-study-form.component';

@Component({
  selector: 'app-create-hub',
  standalone: true,
  imports: [CommonModule, MissionFormComponent, CaseStudyFormComponent],
  templateUrl: './create-hub.component.html',
  styleUrls: ['./create-hub.component.css']
})
export class CreateHubComponent {
  activeTab: 'mission' | 'case-study' | 'minigame' | 'coming-soon' = 'mission';

  selectTab(tab: 'mission' | 'case-study' | 'minigame' | 'coming-soon') {
    this.activeTab = tab;
  }
}

