import { AppData, ComponentData } from 'src/app/_models';
import { Component, Input, OnInit } from '@angular/core';

import { IRequiredType } from '../../../_interfaces';
import { IResponsibleRelationship } from '../../../_interfaces/i-responsible-relationship';
import { Observable } from 'rxjs';
import { RbtApplicationService } from '../../../_services/rbt-application.service';
import { ResponsibleRelationship } from '../../../_models/responsible-relationship';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-background-check-summary',
  templateUrl: './background-check-summary.component.html',
  styleUrls: ['./background-check-summary.component.css']
})
export class BackgroundCheckSummaryComponent implements OnInit {

  @Input() public InstAppData : AppData;
  public get BaseAppData(): AppData {
    return this.InstAppData;
  }
  @Input() public InstComponentData : ComponentData;
  public get ComponentData(): ComponentData {
    return this.InstComponentData;
  }
  @Input() public InstSectionId: string;
  @Input() public CanEdit: boolean = true;

  public FileTypes: IRequiredType[];
  public _AppId: string;
  public Relationship$: Observable<IResponsibleRelationship> | null = null;

  constructor(
    private rbtService: RbtApplicationService,
  ) {
    this.FileTypes = [{
      Type: {Code: 'RBTB',Description:'RBT Background Check', Id:'19'},
      RequirementMet: 'F'
    }];

  }

  ngOnInit() {
    this._AppId = this.InstAppData ? this.InstAppData.AppId$.value : null;
    this.Relationship$ = this.rbtService.BackgroundCheck$.pipe(
      map( (_relationship: ResponsibleRelationship) => {
        if ( _relationship ) {
          return _relationship.Export();
        }
        return null;
      })
    )
  }

}
