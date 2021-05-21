import { Customer } from './customer';
import { ContactLink } from './contact-link';
import { IContact } from '../_interfaces/i-contact';
import { IContactLink } from '../_interfaces/i-contact-link';

export class Contact {
    public Id: string = '';
    public Contact: Customer = new Customer();
    public Links: ContactLink[] = [];
    public Accepted: boolean = false;

    public constructor(Param1?: IContact) {
        if (Param1) {
            this.Id = Param1.Id;
            this.Contact = new Customer(Param1.Contact);
            for (let Index in Param1.Links) {
                this.Links.push(new ContactLink(Param1.Links[Index]));
            }
            this.Accepted = Param1.Accepted == 'T';
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Contact.Erase();
        this.Links.splice(0,this.Links.length);
        this.Accepted = false;
    }

    public Export() : IContact {
        let ExportLinks: IContactLink[] = [];
        for (let ExportIndex in this.Links) {
            ExportLinks.push(this.Links[ExportIndex].Export());
        }
        return {'Id' : this.Id,
                'Contact' : this.Contact.Export(),
                'Links' : ExportLinks,
                'Accepted' : this.Accepted ? 'T' : 'F'}
    }
}
