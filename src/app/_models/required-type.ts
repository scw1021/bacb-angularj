import { DocumentType } from './document-type';
import { IRequiredType } from '../_interfaces/i-required-type';

export class RequiredType {
    public Type: DocumentType;
    public RequirementMet: boolean;

    public constructor(Param1?: IRequiredType) {
        if ( Param1 ) {
            this.Type = new DocumentType(Param1.Type);
            this.RequirementMet = Param1.RequirementMet == "T" ? true : false;
        }
    }

    public Erase() : void {
        this.Type.Erase();
        this.RequirementMet = false;
    }

    public Export() : IRequiredType {
        return {
            'Type': this.Type,
            'RequirementMet': this.RequirementMet ? 'T' : 'F'
        }
    }
}
