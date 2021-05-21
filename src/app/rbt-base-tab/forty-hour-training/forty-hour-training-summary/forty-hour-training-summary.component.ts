import { AppData, ComponentData } from 'src/app/_models';
import { Component, Input, OnInit } from '@angular/core';

import { IRequiredType } from 'src/app/_interfaces';
import { IResponsibleRelationship } from '../../../_interfaces/i-responsible-relationship';
import { Observable } from 'rxjs';
import { RbtApplicationService } from 'src/app/_services/rbt-application.service';
import { ResponsibleRelationship } from 'src/app/_models/responsible-relationship';
import { map } from 'rxjs/operators';

@Component({
  selector: 'forty-hour-training-summary',
  templateUrl: './forty-hour-training-summary.component.html',
  styleUrls: ['./forty-hour-training-summary.component.css']
})
export class FortyHourTrainingSummaryComponent implements OnInit {

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
  public Relationship$: Observable<IResponsibleRelationship>;

  constructor(
    private rbtService: RbtApplicationService,
  ) {
    this.FileTypes = [{
      Type: {Code: '40HR',Description:'Forty Hour Training', Id:'6'},
      RequirementMet: 'F'
    }];
   }

  ngOnInit() {
    this._AppId = this.InstAppData ? this.InstAppData.AppId$.value : null;
    this.Relationship$ = this.rbtService.Trainings$.pipe(
      map( (_relationship: ResponsibleRelationship) => {
        if ( _relationship ) {
          return _relationship.Export();
        }
        return null;
      })
    )
  }

}
