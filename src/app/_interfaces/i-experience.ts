import { IExperienceType } from './i-experience-type';
import { IListObject } from './i-list-object';
import { IExperienceSupervision } from './i-experience-supervision';

export interface IExperience {
    Id: string;
    RepresentationType: IListObject;
    Type: IExperienceType;
    PracticumName: string;
    PracticumId: string;
    StartDate: string;
    EndDate: string;
    Supervisions: IExperienceSupervision [];
    SupervisedHours: number;
    IndependentHours: number;
    TotalHours: number;
    CalculatedHours: number;
    VFDocument?: string;
}
