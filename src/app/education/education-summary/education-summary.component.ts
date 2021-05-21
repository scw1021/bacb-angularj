import { AlertService, ApplicationService, EducationService, ModelToolsService } from 'src/app/_services';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { EducationComponent } from '../education.component';
import { FormBuilder } from '@angular/forms';
import { Service } from 'src/app/_services/deployable.service';

@Component({
  selector: 'education-summary',
  templateUrl: './education-summary.component.html',
  styleUrls: ['./education-summary.component.css']
})
export class EducationSummaryComponent extends EducationComponent implements OnInit {

  @Input() public PageChangeEmission: number;
  @Input() public CanEdit: boolean = true;
  @Output() public PageChange: EventEmitter<number> = new EventEmitter<number>();

  public constructor(
    AppService: ApplicationService,
    EducationSumAlertServ: AlertService,
    EducationSumFormBuilder: FormBuilder,
    EducationSumModelServ: ModelToolsService,
    EducationSumServ: EducationService
  ) {
    super(AppService, EducationSumAlertServ, EducationSumFormBuilder, EducationSumModelServ, EducationSumServ);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public OnClickEdit() {
    this.PageChange.emit(this.PageChangeEmission);
  }
}
