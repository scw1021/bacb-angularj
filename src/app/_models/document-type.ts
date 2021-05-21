import { IDocumentType } from '../_interfaces/i-document-type';

export class DocumentType {
    public Id: string; // numeric ID for netsuite interpretation
    public Code: string = ''; // Four digit code
    public Description: string = ''; // text description for client output

    public constructor(Param1?: IDocumentType) {
        if (Param1) {
            this.Code = Param1.Code;
            this.Description = Param1.Description;
            this.Id = Param1.Id;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Code = '';
        this.Description = '';
    }

    public Export() : IDocumentType {
        return {
          'Id': this.Id,
          'Code': this.Code,
          'Description': this.Description,
        }
    }
}
