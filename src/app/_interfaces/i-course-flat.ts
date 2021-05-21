import { IContentAreaHours } from './i-content-area-hours';
import { IDateRange } from './i-date-range';
import { IListObject } from './i-list-object';
import { IListRange } from './i-list-range';
import { IYearRange } from './i-year-range';

export interface ICourseFlat {
    Id: string;
    RegisteredCourseId: string;
    Title: string;
    Number: string;
    CreditLevel: IListObject;
    CreditHours: number;
    SyllabiName: string;
    ModeOfInstruction: IListObject;
    ContentHourId: string;
    Edition: IListObject;
    Date: IDateRange;
    Semester : IListRange;
    Quarter : IListRange;
    Year: IYearRange;
    Hours: IContentAreaHours[];
    InstitutionName?: string;
    DepartmentName?: string;
    Selected?: boolean;
}
