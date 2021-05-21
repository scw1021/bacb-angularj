import { IListObject } from './i-list-object';
import { IYearRange } from './i-year-range';

export interface ICourseTableData {
    Id: string;
    Choose: string;
    CourseNumber: string;
    CourseName: string;
    Level: string;
    Edition: string;
    QuarterStart: string;
    SemesterStart: string;
    Year: string;
    YearRange: number[];
    QuarterSelect: IListObject;
    SemesterSelect: IListObject;
    YearSelect: number;
}
