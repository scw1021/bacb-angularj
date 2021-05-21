import { AppData, ComponentData } from '../_models';
import { Component, Input, OnInit } from '@angular/core';
import { IConfirm, IRequiredType } from '../_interfaces';

import { AlertService } from '../_services';
import { ApplicationCompletionService } from '../_services/application-completion.service';
import { BehaviorSubject } from 'rxjs';
import { IDocumentType } from '../_interfaces/i-document-type';

@Component({
  selector: 'app-post-doctoral-experience',
  templateUrl: './post-doctoral-experience.component.html',
  styleUrls: ['./post-doctoral-experience.component.css']
})
export class PostDoctoralExperienceComponent implements OnInit {

  @Input() public InstComponentData: ComponentData;
  @Input() public InstAppData: AppData;

  public FileTypes: IRequiredType[];
  public FileCheck: BehaviorSubject<IConfirm>;

  public constructor(
    private alertService: AlertService,
    private appCompletionService: ApplicationCompletionService
  ) {
    this.FileCheck = new BehaviorSubject<IConfirm>({
      Response: 'F',
      Message: ''
    })
   }

  public ngOnInit() {
    this.appCompletionService.Check$[11] = this.FileCheck.asObservable();
    this.FileTypes = [
    {
      Type: {Id: '3eadad76-b011-eb11-a813-000d3a5a7103', Code:'LOA3',Description:'Letter of Attestation (BCBA Option 3)'},
      RequirementMet: 'F'
    },{
      Type: {Id: '56d1ba82-b011-eb11-a813-000d3a5a7103', Code:'PCE3',Description:'Professional Credential of Employee (BCBA Option 3)'},
      RequirementMet: 'F'
    }, {
      Type: {Id: '57baad8e-b011-eb11-a813-000d3a5a7103', Code:'CVR3',Description:'Curriculum Vitae or Resume (BCBA Option 3)'},
      RequirementMet: 'F'
    }];
  }
  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }
  public get BaseAppData() {
    return this.InstAppData;
  }
  public get ComponentData() {
    return this.InstComponentData;
  }

}
