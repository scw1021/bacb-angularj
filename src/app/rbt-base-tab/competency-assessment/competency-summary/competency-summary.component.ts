import { AppData, ComponentData } from 'src/app/_models';
import { Component, Input, OnInit } from '@angular/core';
import { IListObject, IRequiredType } from '../../../_interfaces';

import { Observable } from 'rxjs';
import { RbtApplicationService } from '../../../_services/rbt-application.service';
import { ResponsibleRelationship } from 'src/app/_models/responsible-relationship';
import { map } from 'rxjs/operators';

@Component({
  selector: 'competency-summary',
  templateUrl: './competency-summary.component.html',
  styleUrls: ['./competency-summary.component.css']
})
export class CompetencySummaryComponent implements OnInit {

  @Input() public InstAppData : AppData;
  public get BaseAppData(): AppData {
    return this.InstAppData;
  }
  @Input() public InstComponentData : ComponentData;
  public get ComponentData(): ComponentData {
    return this.InstComponentData;
  }
  @Input() public InstSectionId: string;

  public FileTypes: IRequiredType[] = new Array<IRequiredType>();
  public _AppId: string = '';
  public Relationship$: Observable<ResponsibleRelationship> = new Observable<ResponsibleRelationship>();
  public SkillsAssessed: Observable<IListObject[]> = new Observable<IListObject[]>();

  constructor(
    private rbtService: RbtApplicationService
  ) {
    this.FileTypes = [{
      Type: {Code:'RBTA', Description:'RBT Supervisor Attestation', Id:'8'},
      RequirementMet: 'F'
    }];
    this.SkillsAssessed = this.rbtService.SkillsAssessedSubject$.asObservable();
  }

  ngOnInit() {
    this._AppId = this.InstAppData ? this.InstAppData.AppId$.value : null;
    this.Relationship$ = this.rbtService.Competency$.pipe(
      map( (_relationship ) => {
        if ( _relationship ) {
          return _relationship;
        }
        return null;
      })
    )
  }

}
