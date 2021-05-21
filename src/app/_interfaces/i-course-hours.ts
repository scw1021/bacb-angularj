import { IContentAreaHours } from './i-content-area-hours';
import { IDateRange } from './i-date-range';
import { IListObject } from './i-list-object';
import { IListRange } from './i-list-range';
import { IYearRange } from './i-year-range';

/**
 * @description This is RC Content Hours in the ERD
 */
export interface ICourseHours {
    Id: string;
    CourseId: string;
    Edition: IListObject;
    Date: IDateRange;
    Semester: IListRange;
    Quarter: IListRange;
    Year: IYearRange;
    Hours: IContentAreaHours [];
}
