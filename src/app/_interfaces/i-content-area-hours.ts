import { IContentAreaHourDetail } from './i-content-area-hour-detail';

export interface IContentAreaHours {
    Id: string;
    CourseHourId: string;
    Abbrev: string;
    Type: IContentAreaHourDetail;
    Value: number;
}
