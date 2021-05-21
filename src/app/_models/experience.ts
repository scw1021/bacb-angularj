import { __GetNetSuiteDate, __NSDateToJSDate } from '../_helpers/utility-functions';

import { ExperienceSupervision } from './experience-supervision';
import { ExperienceType } from './experience-type';
import { IExperience } from '../_interfaces/i-experience';
import { IExperienceSupervision } from '../_interfaces/i-experience-supervision';
import { ListObject } from './list-object';

export class Experience {
    public Id: string = '';
    public RepresentationType: ListObject = new ListObject();
    public Type: ExperienceType = new ExperienceType();
    public PracticumName: string = '';
    public PracticumId: string = '';
    public StartDate: Date | null = null;
    public EndDate: Date | null = null;
    public Supervisions: ExperienceSupervision[] = [];
    public SupervisedHours: number = 0;
    public IndependentHours: number = 0;
    public TotalHours: number = 0;
    public CalculatedHours: number = 0;
    public VFDocument: string = '';

    public constructor(Param1?: IExperience) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.RepresentationType = new ListObject(Param1.RepresentationType);
            this.Type = new ExperienceType(Param1.Type);
            this.PracticumName = Param1.PracticumName;
            this.PracticumId = Param1.PracticumId;
            this.StartDate = __NSDateToJSDate(Param1.StartDate);
            this.EndDate = __NSDateToJSDate(Param1.EndDate);
            for (let objSupervisor of Param1.Supervisions) {
                this.Supervisions.push(new ExperienceSupervision(objSupervisor));
            }
            this.SupervisedHours = Param1.SupervisedHours;
            this.IndependentHours = Param1.IndependentHours;
            this.TotalHours = Param1.TotalHours;
            this.CalculatedHours = Param1.CalculatedHours;
        }
    }

    // Accessors
    public get ModTotal() : number {
        return this.SupervisedHours * this.Type.HourModifier + this.IndependentHours * this.Type.HourModifier;
    }

    public get Total() : number {
        return this.SupervisedHours + this.IndependentHours;
    }

    public get NumberOfPrimary() : number {
        return this.Supervisions.filter((SupervisionFilter : ExperienceSupervision) => SupervisionFilter.IsPrimary == true).length;
    }

    // Methods
    public SetSupervisors(CurrentSupervisors : ExperienceSupervision []) {
        if (CurrentSupervisors != null && CurrentSupervisors.length) {
            for (let ObjSupervisor of CurrentSupervisors) {
                this.Supervisions.push(new ExperienceSupervision(ObjSupervisor.Export()));
            }
        }
    }

    public Erase() : void {
        this.Id = '';
        this.RepresentationType.Erase();
        this.Type.Erase();
        this.PracticumName = '';
        this.PracticumId = '';
        this.StartDate = null;
        this.EndDate = null;
        this.Supervisions.splice(0,this.Supervisions.length);
        this.SupervisedHours = 0;
        this.IndependentHours = 0;
        this.TotalHours = 0;
        this.CalculatedHours = 0;
    }

    public Export() : IExperience {
        let ExportSupervisions : IExperienceSupervision [] = [];
        for (let objExpSupervisor of this.Supervisions) {
            ExportSupervisions.push(objExpSupervisor.Export());
        }
        return {'Id' : this.Id,
                'RepresentationType' : this.RepresentationType.Export(),
                'Type' : this.Type.Export(),
                'PracticumName' : this.PracticumName,
                'PracticumId' : this.PracticumId,
                'StartDate' : __GetNetSuiteDate(this.StartDate),
                'EndDate' : __GetNetSuiteDate(this.EndDate),
                'Supervisions' : ExportSupervisions,
                'SupervisedHours' : this.SupervisedHours,
                'IndependentHours' : this.IndependentHours,
                'TotalHours' : this.Total,
                'CalculatedHours' : this.ModTotal,
                'VFDocument': this.VFDocument
        }
    }
}
