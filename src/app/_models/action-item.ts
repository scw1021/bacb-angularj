import { __GetNetSuiteDate, __NSDateToJSDate } from 'src/app/_helpers/utility-functions';

import { IActionItem } from '../_interfaces/i-action-item';
import { ListObject } from 'src/app/_models';

export class ActionItem {
  public Id: string = '';
  public Abstract: string = '';
  public CustomText: string = '';
  public DocumentRequired: boolean = false;
  public Status: ListObject = new ListObject();
  public CertificationCycleId: string = '';
  public Type: ListObject = new ListObject();
  public Source: ListObject = new ListObject();
  public DueDate: Date | null = null;
  public DateSubmitted: Date | null = null;
  constructor(Param1?: IActionItem){
    if(Param1){
      this.Id = Param1.Id;
      this.Abstract = Param1.Abstract;
      this.CustomText = Param1.CustomText;
      this.DocumentRequired = Param1.DocumentRequired == 'T'? true: false;
      this.Status = new ListObject(Param1.Status);
      this.CertificationCycleId = Param1.CertificationCycleId;
      this.DueDate = Param1.DueDate? __NSDateToJSDate(Param1.DueDate) : null;
      this.DateSubmitted = Param1.DateSubmitted? __NSDateToJSDate(Param1.DateSubmitted) : null;
      this.Source = new ListObject(Param1.Source);
      this.Type = new ListObject(Param1.Type)
    }
  }


  public Erase(): void {
    this.Abstract = '';
    this.CustomText = '';
    this.DocumentRequired = false;
    this.Id = '';
    this.Abstract = '';
    this.CustomText = '';
    this.DocumentRequired = true;
    this.CertificationCycleId = '';
    this.DueDate = null;
    this.DateSubmitted = null;
    this.Source.Erase();
    this.Status.Erase();
    this.Type.Erase();
  }

  public Export(){
    return {
      'Id': this.Id,
      'Abstract': this.Abstract,
      'CustomText': this.CustomText,
      'DueDate': this.DueDate ? __GetNetSuiteDate(this.DueDate) : '',
      'DocumentRequired': this.DocumentRequired == true? 'T': 'F',
      'DateSubmitted': this.DateSubmitted ? __GetNetSuiteDate(this.DateSubmitted) : '',
      'Status': this.Status,
      'CertificationCycleId': this.CertificationCycleId,
      'Source': this.Source,
      'Type': this.Type
    }
  }

}

// Interface for reference
/*
export interface IActionItem {
  Id: string,
  Abstract: string,
  CustomText: string,
  DueDate: string;
  DateSubmitted: string,
  DocumentRequired: boolean,
  Status: IListObject,
  CertificationCycleId: string,
  Source: IListObject,
  Type: IListObject,
  CertificationCycle?: IListObject,
}
*/
