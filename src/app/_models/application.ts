import { AppType, } from './app-type';
import { CertType } from './cert-type';
import { IApplication } from '../_interfaces/i-application';
import { __NSDateToJSDate } from '../_helpers/utility-functions';

export class Application {
    public Id: string = '';
    public Status: string = '';
    public AppType: AppType = new AppType();
    public CertType: CertType = new CertType();
    public DateSubmitted: Date | null = null;
    public DateCreated: Date | null = null;
    public FirstCourseStartDate: Date | null = null;
    public LastCourseEndDate: Date | null = null;
    public Invoice: string = '';

    public constructor(Param1?: IApplication) {
      if (Param1){
        this.Id = Param1.Id;
        this.Status = Param1.Status;
        this.AppType = new AppType(Param1.AppType);
        this.CertType = new CertType(Param1.CertType);
        this.DateSubmitted = __NSDateToJSDate( Param1.DateSubmitted );
        this.DateCreated = __NSDateToJSDate( Param1.DateCreated );
        this.Invoice = Param1.Invoice;
        if (Param1.FirstCourseStartDate && Param1.FirstCourseStartDate != '') {
            let DateArray1: string[] = Param1.FirstCourseStartDate.split("/", 3);
            this.FirstCourseStartDate = new Date(DateArray1[2] + "-" + DateArray1[0] + "-" + DateArray1[1]);
        }
        if (Param1.LastCourseEndDate && Param1.FirstCourseStartDate != '') {
            let DateArray2: string[] = Param1.LastCourseEndDate.split("/", 3);
            this.LastCourseEndDate = new Date(DateArray2[2] + "-" + DateArray2[0] + "-" + DateArray2[1])
        }
      }
    }

    public Erase() : void {
        this.Id = '';
        this.Status = '';
        this.AppType.Erase();
        this.CertType.Erase();
        this.DateSubmitted = null;
        this.DateCreated = null;
        this.FirstCourseStartDate = null;
        this.LastCourseEndDate = null;
        this.Invoice = '';
    }

    public Export() : IApplication {
        let DateSubmittedExport: string = this.DateSubmitted != null ? (1 + this.DateSubmitted.getMonth()) + '/' + this.DateSubmitted.getDate() + '/' + this.DateSubmitted.getFullYear() : '';
        let DateCreatedExport: string = this.DateCreated != null ? (1 + this.DateCreated.getMonth()) + '/' + this.DateCreated.getDate() + '/' + this.DateCreated.getFullYear() : '';
        let DateFirstCourseExport: string = this.FirstCourseStartDate != null ? (1 + this.FirstCourseStartDate.getMonth()) + '/' + this.FirstCourseStartDate.getDate() + '/' + this.FirstCourseStartDate.getFullYear() : '';
        let DateLastCourseExport: string =  this.LastCourseEndDate != null ? (1 + this.LastCourseEndDate.getMonth()) + '/' + this.LastCourseEndDate.getDate() + '/' + this.LastCourseEndDate.getFullYear() : '';

        return {'Id' : this.Id,
                'Status' : this.Status,
                'AppType' : this.AppType.Export(),
                'CertType' : this.CertType.Export(),
                'DateSubmitted' : DateSubmittedExport,
                'DateCreated' : DateCreatedExport,
                'FirstCourseStartDate' : DateFirstCourseExport,
                'LastCourseEndDate' : DateLastCourseExport,
                'Invoice': this.Invoice,
        }
    }
}
