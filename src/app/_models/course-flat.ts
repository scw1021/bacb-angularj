import { ListObject } from './list-object';
import { ListRange } from './list-range';
import { YearRange } from './year-range';
import { ContentAreaHours } from './content-area-hours';
import { ICourseFlat } from '../_interfaces/i-course-flat';
import { DateRange } from './date-range';

export class CourseFlat {
    public Id: string = '';
    public RegisteredCourseId: string = '';
    public Title: string = '';
    public Number: string = '';
    public CreditLevel: ListObject = new ListObject();
    public CreditHours: number = 0;
    public SyllabiName: string = '';
    public ModeOfInstruction: ListObject = new ListObject();
    public ContentHourId: string = '';
    public Edition: ListObject = new ListObject();
    public Date: DateRange = new DateRange();
    public Semester : ListRange = new ListRange();
    public Quarter : ListRange = new ListRange();
    public Year: YearRange = new YearRange();
    public Hours: ContentAreaHours[] = [];
    public InstitutionName?: string = '';
    public DepartmentName?: string = '';

    public constructor(Param1?: ICourseFlat) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.RegisteredCourseId = Param1.RegisteredCourseId;
            this.Title = Param1.Title;
            this.Number = Param1.Number;
            this.CreditLevel = new ListObject(Param1.CreditLevel);
            this.CreditHours = Param1.CreditHours;
            this.SyllabiName = Param1.SyllabiName;
            this.ModeOfInstruction = new ListObject(Param1.ModeOfInstruction);
            this.ContentHourId = Param1.ContentHourId;
            this.Edition = new ListObject(Param1.Edition);
            this.Date = new DateRange(Param1.Date);
            this.Semester = new ListRange(Param1.Semester);
            this.Quarter = new ListRange(Param1.Quarter);
            this.Year = new YearRange(Param1.Year);
            if (this.Hours != null && this.Hours.length) {
                for (let stIndex in Param1.Hours) {
                    this.Hours[stIndex] = new ContentAreaHours(Param1.Hours[stIndex]);
                }
            }
            this.InstitutionName = Param1.InstitutionName;
            this.DepartmentName = Param1.DepartmentName;
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
        this.ContentHourId = '';
        this.Edition.Erase();
        this.Semester.Erase();
        this.Quarter.Erase();
        this.Year.Erase();
        this.Hours.splice(0,this.Hours.length);
        this.InstitutionName = '';
        this.DepartmentName = '';
    }

    public Export() : ICourseFlat {
        let ExportHours: ContentAreaHours[] = [];
        for (const stExportIndex in this.Hours) {
            ExportHours.push(this.Hours[stExportIndex])
        }
        return {'Id' : this.Id,
                'RegisteredCourseId' : this.RegisteredCourseId,
                'Title' : this.Title,
                'Number' : this.Number,
                'CreditLevel' : this.CreditLevel.Export(),
                'CreditHours' : this.CreditHours,
                'SyllabiName' : this.SyllabiName,
                'ModeOfInstruction' : this.ModeOfInstruction.Export(),
                'ContentHourId' : this.ContentHourId,
                'Edition' : this.Edition.Export(),
                'Date' : this.Date.Export(),
                'Semester' : this.Semester.Export(),
                'Quarter' : this.Quarter.Export(),
                'Year' : this.Year.Export(),
                'Hours' : ExportHours,
                'InstitutionName' : this.InstitutionName,
                'DepartmentName' : this.DepartmentName}
    }
}
