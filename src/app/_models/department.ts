import { IDepartment, IRegisteredCourse } from '../_interfaces';
import { RegisteredCourse } from './registered-course';
import { ContactLink } from './contact-link';
import { IContactLink } from '../_interfaces/i-contact-link';

export class Department{
    public Id: string = '';
    public InstitutionId: string = '';
    public Name: string = '';
    public Website: string = '';
    public RegisteredCourses: RegisteredCourse[] = [];
    public ContactLinks: ContactLink[] = [];

    public constructor(Param1?: IDepartment) {
        if (Param1) {
            this.Id = Param1.Id;
            this.InstitutionId = Param1.InstitutionId;
            this.Name = Param1.Name;
            this.Website = Param1.Website;
            for (let stIndex in Param1.RegisteredCourses) {
                this.RegisteredCourses.push(new RegisteredCourse(Param1.RegisteredCourses[stIndex]));
            }
            for (let stContactLinkIndex in Param1.ContactLinks) {
                this.ContactLinks.push(new ContactLink(Param1.ContactLinks[stContactLinkIndex]));
            }
        }
    }

    public Erase() : void {
        this.Id = '';
        this.InstitutionId = '';
        this.Name = '';
        this.Website = '';
        this.RegisteredCourses.splice(0,this.RegisteredCourses.length);
        this.ContactLinks.splice(0, this.ContactLinks.length);
    }

    public Export() : IDepartment {
        let ExportRegisteredCourses: IRegisteredCourse[] = [];
        for (let stExportIndex in this.RegisteredCourses) {
            ExportRegisteredCourses.push(new RegisteredCourse(this.RegisteredCourses[stExportIndex]).Export());
        }
        let ExportContactLinks: IContactLink[] = [];
        for (let stExportContactLinks in this.ContactLinks) {
            ExportContactLinks.push(this.ContactLinks[stExportContactLinks].Export());
        }
        return {'Id' : this.Id,
                'InstitutionId' : this.InstitutionId,
                'Name' : this.Name,
                'Website' : this.Website,
                'RegisteredCourses' : ExportRegisteredCourses,
                'ContactLinks' : ExportContactLinks}
    }
}

