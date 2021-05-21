import { IContactLink } from '../_interfaces/i-contact-link';

export class ContactLink {
    public Id: string = '';
    public DepartmentId: string = '';
    public ContactId: string = '';

    public constructor(Param1?: IContactLink) {
        if (Param1) {
            this.Id = Param1.Id;
            this.DepartmentId = Param1.DepartmentId;
            this.ContactId = Param1.ContactId;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.DepartmentId = '';
        this.ContactId = '';
    }

    public Export() : IContactLink {
        return {'Id' : this.Id,
                'DepartmentId' : this.DepartmentId,
                'ContactId' : this.ContactId}
    }
}
