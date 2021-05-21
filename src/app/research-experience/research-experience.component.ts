import { AppData, ComponentData, Confirm } from '../_models';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { IConfirm, IConfirmDefault, IRequiredType } from '../_interfaces';
import { shareReplay, tap } from 'rxjs/operators';

import { AlertService } from '../_services';
import { ApplicationCompletionService } from '../_services/application-completion.service';
import { IDocumentType } from '../_interfaces/i-document-type';

@Component({
  selector: "app-research-experience",
  templateUrl: "./research-experience.component.html",
  styleUrls: ["./research-experience.component.css"]
})
export class ResearchExperienceComponent implements OnInit {
  // @Input() public InstComponentData: ComponentData;
  // @Input() public InstAppData: AppData;

  public FileTypes: IRequiredType[] = new Array<IRequiredType>();
  public FileCheck: BehaviorSubject<IConfirm> = new BehaviorSubject<IConfirm>(IConfirmDefault);

  public constructor(
    private completionService: ApplicationCompletionService,
    private alertService: AlertService,
  ) {
    console.log('init');
    this.FileCheck.asObservable().subscribe(x => console.log('FileCheck', x))
    this.completionService.Check$[6] = this.FileCheck.asObservable().pipe(tap(x=>console.log('RE', x), shareReplay(1)));
  }

  public ngOnInit() {
    // This feels like poor mgmt, but it won't be hard to rework. Possibly, we could just send a list of ID's, but IDK if it's critical. This would at least allow for modificaton of the descriptions, though, as it isn't sent back to the server.
    this.FileTypes = [{
      Type:{Id: '6ed022e4-ff03-eb11-a813-00224808102a', Code:'LOA2',Description:'Letter of Attestation (BCBA Option 2)'},
      RequirementMet: 'F'
    },{
      Type:{Id: 'ab519b08-0004-eb11-a813-00224808102a', Code:'SYL2',Description:'Teaching/Research Syllabus (BCBA Option 2)'},
      RequirementMet: 'F'
    },{
      Type:{Id: '098320fc-ff03-eb11-a813-00224808102a', Code:'CVR2',Description:'Curriculum Vitae or Resume (BCBA Option 2)'},
      RequirementMet: 'F'
    },{
      Type:{Id: 'f2c72bea-ff03-eb11-a813-00224808102a', Code:'RAR2',Description:'Research Article (BCBA Option 2)'},
      RequirementMet: 'F'
    }];
  }
  public FileEvent(event: IConfirm): void {
    this.FileCheck.next(event);
  }
}
