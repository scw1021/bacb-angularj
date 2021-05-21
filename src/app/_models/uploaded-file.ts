import { DocumentType } from '../_models/document-type';
import { IUploadedFile } from '../_interfaces/i-uploaded-file';
import { __NSDateToJSDate, __GetNetSuiteDate } from '../_helpers/utility-functions';

export class UploadedFile {
    public Id: string = '';
    public Name: string = '';
    public Date: Date | null = null;
    public Type:  DocumentType = new DocumentType();

    public constructor(Param1?: IUploadedFile) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.Name = Param1.Name;
            this.Date = __NSDateToJSDate(Param1.Date)
            this.Type = new DocumentType(Param1.Type);
        }
    }

    public get DateString(): string {
      if ( this.Date ){
        return __GetNetSuiteDate(this.Date)
      }
      else {
        return 'NOT SUBMITTED';
      }
    }

    public Erase() : void {
      this.Id = '';
      this.Name = '';
      this.Date = null;
      this.Type.Erase();
    }

    public Export() : IUploadedFile {
      return {
        'Id': this.Id,
        'Name': this.Name,
        'Date': __GetNetSuiteDate(this.Date),
        'Type': this.Type.Export(),
      }
    }
}
