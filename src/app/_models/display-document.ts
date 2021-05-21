import { IDisplayDocument } from '../_interfaces/i-display-document';
import { UploadedFile } from './uploaded-file';

export class DisplayDocument {
    public Id: string = '';
    public Document: UploadedFile = new UploadedFile();

    public constructor(Param1?: IDisplayDocument) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.Document = new UploadedFile(Param1.Document);
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Document.Erase();
    }

    public Export() : IDisplayDocument {
        return {
            'Id': this.Id,
            'Document': this.Document.Export()
        }
    }
}
