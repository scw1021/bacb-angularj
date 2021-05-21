import { IRegisteredCourse } from './i-registered-course';
import { IContactLink } from './i-contact-link';

export interface IDepartment {
    InstitutionName?: string;
    Id: string;
    InstitutionId: string;
    Name: string;
    NetSuiteId?:any;
    Website?: string;
    RegisteredCourses?: IRegisteredCourse[];
    ContactLinks?: IContactLink[];
}
