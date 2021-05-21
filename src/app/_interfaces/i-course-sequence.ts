import { IInstitution } from './i-institution';
import { ICourse } from './i-course';

export interface ICourseSequence {
    Id: string;
    Name: string;
    Institution: IInstitution;
    Courses: ICourse [];
}
