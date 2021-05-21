import { AlertService, ModelToolsService, ProfessionalInfoService } from 'src/app/_services';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IListObject, IProfessionalData } from 'src/app/_interfaces';

import { FormBuilder } from '@angular/forms';
import { ProfessionalInfoComponent } from '../professional-info.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'professional-info-summary',
  templateUrl: './professional-info-summary.component.html',
  styleUrls: ['./professional-info-summary.component.css']
})
export class ProfessionalInfoSummaryComponent extends ProfessionalInfoComponent implements OnInit {

  @Input() public PageChangeEmission: number;
  @Input() public CanEdit: boolean = true;
  @Output() public PageChange: EventEmitter<number> = new EventEmitter<number>();

  private primaryRole = 'primary role';
  private primaryArea = 'primary area';
  private clientAges = 'client ages';
  private secondaryArea = 'secondary area';

  public constructor(protected ProfessionSumAlertServ: AlertService,
                     protected ProfessionSumFormBuilder: FormBuilder,
                     protected ProfessionSumServ: ProfessionalInfoService,
                     protected ProfessionSumModelToolsServ: ModelToolsService) {
      super(ProfessionSumAlertServ, ProfessionSumFormBuilder, ProfessionSumServ, ProfessionSumModelToolsServ);
      this.loadInformation();
    }

  public ngOnInit() {
    super.ngOnInit();

  }
  private appendAges( value: string ){
    this.clientAges += value + ' ';
  }
  public loadInformation(){
    this.ProfessionSumServ.ProfessionalData$.subscribe( (ProfessionalDataFromService: IProfessionalData) => {
      // console.log(`PISC loadInfo: ${JSON.stringify(x)}`);
      this.primaryRole = ProfessionalDataFromService.PrimaryRole?.Value;
      this.primaryArea = ProfessionalDataFromService.PrimaryArea?.Value;
      this.clientAges = '';
      ProfessionalDataFromService.ClientAges?.forEach((elem : IListObject) => this.appendAges(elem.Value));
      this.secondaryArea = ProfessionalDataFromService.SecondaryArea.Value;}
    );
  }
  public get PrimaryRoleInBA(): string {
    return this.primaryRole;
  }
  public get PrimaryAreaOfProfessionalEmphasis(): string {
    return this.primaryArea;
  }
  public get DisplayAgesOfClientele(): string {
    return this.clientAges;
  }
  public get SecondaryAreaOfProfessionalEmphasis(): string {
    return this.secondaryArea;
  }
  public OnClickEdit(){
    this.PageChange.emit(this.PageChangeEmission);
  }

}
