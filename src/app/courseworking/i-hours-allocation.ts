import { IHoursAllocationType } from './i-hours-allocation-type';

export interface IHoursAllocation {
    Id: string | number;
    CourseDurationId: string;
    Type: IHoursAllocationType;
    Value: number;
}
