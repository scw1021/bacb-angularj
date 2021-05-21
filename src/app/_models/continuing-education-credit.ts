import { CertCycle } from 'src/app/_models';
import { IContinuingEducationCredit } from '../_interfaces/i-continuing-education-credit';
import { IListObject } from 'src/app/_interfaces';

export const ContinuingEducationCreditTypes: IListObject[] = [
  {Id: "100000000", Value: "Learning: ACE Event"},
  {Id: "100000001", Value: "Learning: Coursework"},
  {Id: "100000002", Value: "Teaching: Coursework"},
  {Id: "100000003", Value: "Teaching: ACE Event"},
  {Id: "100000004", Value: "Scholarship: Publication"},
  {Id: "100000005", Value: "Scholarship: Review"},
]
const ListObjectConverter: {[key:string]: string} = {
  "100000000": "Learning: ACE Event",
  "100000001": "Learning: Coursework",
  "100000002": "Teaching: Coursework",
  "100000003": "Teaching: ACE Event",
  "100000004": "Scholarship: Publication",
  "100000005": "Scholarship: Review",
}

export class ContinuingEducationCredit {
  Id: string;
  Type: IListObject;
  // Event Title, Course Name, Activity
  Title: string;
  // Instructor Name, University Name, Journal Name
  Provider: string;
  // NS ID of Provider
  ProviderId?: string;
  CourseId?: string;
  Grade?: IListObject;
  CreditHours?: string;
  CourseNumber?: string;
  // Files Associated?
  FileIds?: string[];
  // Dates
  StartDate?: Date;
  // CompletionDate, Date Published, Date Reviewed, End Date
  CompletionDate: Date;
  // Continuing Education Units
  GeneralUnits: number;
  EthicsUnits: number;
  SupervisionUnits: number;
  // Cert Cycle
  CertCycle: CertCycle;

  constructor(param?: IContinuingEducationCredit) {
    if ( param ) {
      // console.log('CE Constructor: ', param);
      this.Id = param.Id;
      this.Type = {Id: param.TypeId, Value: ListObjectConverter[param.TypeId]};
      this.Title = param.Title;
      this.Provider = param.Provider;
      this.GeneralUnits = +param.GeneralUnits;
      this.EthicsUnits = +param.EthicsUnits;
      this.SupervisionUnits = +param.SupervisionUnits;
      this.CertCycle = new CertCycle(param.CertCycle);
      if ( param.ProviderId ) {
        this.ProviderId = param.ProviderId
      }
      if ( param.CourseId ) {
        this.CourseId = param.CourseId;
      }
      if ( param.Grade ) {
        this.Grade = param.Grade;
      }
      if ( param.CourseNumber ) {
        this.CourseNumber = param.CourseNumber;
      }
      if ( param.CreditHours ) {
        this.CreditHours = param.CreditHours;
      }
      if ( param.FileIds ) {
        this.FileIds = param.FileIds;
      }
      if ( param.StartDate ) {
        this.StartDate = new Date(param.StartDate);
      }
      if ( param.CompletionDate ) {
        this.CompletionDate = new Date(param.CompletionDate);
      }
      // console.log('result: ', this)
    }
    else {
      this.Erase();
    }
  }

  public Export(): IContinuingEducationCredit {
    return {
      Id: this.Id,
      Type: this.Type,
      TypeId: this.Type.Id,
      Title: this.Title,
      Provider: this.Provider,
      GeneralUnits: this.GeneralUnits.toString(),
      EthicsUnits: this.EthicsUnits.toString(),
      SupervisionUnits: this.SupervisionUnits.toString(),
      ProviderId: this.ProviderId,
      CourseId: this.CourseId,
      CourseNumber: this.CourseNumber,
      CreditHours: this.CreditHours,
      Grade: this.Grade,
      GradeId: this.Grade?.Id,
      FileIds: this.FileIds,
      StartDate: this.getNetSuiteDate(this.StartDate),
      CompletionDate: this.getNetSuiteDate(this.CompletionDate),
      CertCycle: this.CertCycle.Export(),
      CertCycleId: this.CertCycle.Id
    } as IContinuingEducationCredit;
  }

  public Erase(): void {
    this.Id = '';
    this.Type = null;
    this.Title = '';
    this.Provider = '';
    this.GeneralUnits = 0;
    this.EthicsUnits = 0;
    this.SupervisionUnits = 0;
    this.ProviderId = null;
    this.CourseId = null;
    this.CourseNumber = '';
    this.Grade = null;
    this.FileIds = null;
    this.StartDate = null;
    this.CompletionDate = null;
    this.CertCycle = null;
  }

  private getNetSuiteDate(date: Date): string {
    if ( date ) {
      return '' + (1 + date.getMonth()) + '/' + date.getDate() + '/' + date.getFullYear();
    }
    return '';
  }
}
