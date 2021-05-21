import { CourseHours } from './course-hours';
import { ListObject } from './list-object';
import { ICourse } from '../_interfaces/i-course';
import { ICourseHours } from '../_interfaces/i-course-hours';


export class Course {
    public Id: string = '';
    public RegisteredCourseId: string = '';
    public Title: string = '';
    public Number: string = '';
    public CreditLevel: ListObject = new ListObject();
    public CreditHours: number = 0;
    public SyllabiName: string = '';
    public ModeOfInstruction: ListObject = new ListObject();
    public CourseHours: CourseHours[] = [];
    public InstitutionName?: string = '';
    public DepartmentName?: string = '';

    public constructor(Param1?: ICourse) {
        if (Param1) {
            this.Id = Param1.Id;
            this.RegisteredCourseId = Param1.RegisteredCourseId;
            this.Title = Param1.Title;
            this.Number = Param1.Number;
            this.CreditLevel = new ListObject(Param1.CreditLevel);
            this.CreditHours = Param1.CreditHours;
            this.SyllabiName = Param1.SyllabiName;
            this.ModeOfInstruction = new ListObject(Param1.ModeOfInstruction);
            for (let stIndex in Param1.CourseHours) {
                this.CourseHours.push(new CourseHours(Param1.CourseHours[stIndex]));
            }
            if (Param1.InstitutionName) {
                this.InstitutionName = Param1.InstitutionName;
            }
            if (Param1.DepartmentName) {
                this.DepartmentName = Param1.DepartmentName;
            }
        }
    }

    public Erase() : void {
        this.Id = '';
        this.RegisteredCourseId = '';
        this.Title = '';
        this.Number = '';
        this.CreditLevel.Erase();
        this.CreditHours = 0;
        this.SyllabiName = '';
        this.ModeOfInstruction.Erase();
        this.CourseHours.splice(0,this.CourseHours.length);
        this.InstitutionName = '';
        this.DepartmentName = '';
    }

    public Export() : ICourse {
        let ExportHours: ICourseHours[] = [];
        for (let stHoursIndex in this.CourseHours) {
            ExportHours.push(this.CourseHours[stHoursIndex].Export());
        }

        return {'Id' : this.Id,
                'RegisteredCourseId': this.RegisteredCourseId,
                'Title' : this.Title,
                'Number' : this.Number,
                'CreditLevel' : this.CreditLevel.Export(),
                'CreditHours' : this.CreditHours,
                'SyllabiName' : this.SyllabiName,
                'ModeOfInstruction' : this.ModeOfInstruction.Export(),
                'CourseHours' : ExportHours,
                'InstitutionName' : this.InstitutionName,
                'DepartmentName' : this.DepartmentName}
    }
}
