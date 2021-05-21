import { ICourseHours, IListObject } from './';

/**
 * @description This is RC Course in the ERD
 *
 */
export interface ICourse {
    Id: string;
    RegisteredCourseId: string;
    Title: string;
    Number: string;
    CreditLevel: IListObject;
    CreditHours: number;
    SyllabiName: string;
    ModeOfInstruction: IListObject;
    CourseHours: ICourseHours[];
    NameOnTranscript?: string;
    InstitutionName?: string;
    DepartmentName?: string;
}
