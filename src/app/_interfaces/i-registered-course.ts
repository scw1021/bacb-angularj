import { IListObject } from './i-list-object';
import { ICourse } from './i-course';

export interface IRegisteredCourse {
    Id: string;
    DepartmentId: string;
    Name: string;
    ApprovalLevel: string;
    AcademicStructure: IListObject;
    Type: string;
    Courses: ICourse[];
}
