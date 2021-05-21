import { ContentAreaHours } from './content-area-hours';
import { ListRange } from './list-range';
import { YearRange } from './year-range';
import { ICourseHours } from '../_interfaces/i-course-hours';
import { IContentAreaHours } from '../_interfaces/i-content-area-hours'
import { DateRange } from './date-range';
import { ListObject } from './list-object';


export class CourseHours {
    public Id: string = '';
    public CourseId: string = '';
    public Edition: ListObject = new ListObject();
    public Date: DateRange = new DateRange();
    public Semester : ListRange = new ListRange();
    public Quarter : ListRange = new ListRange();
    public Year: YearRange = new YearRange();
    public Hours: ContentAreaHours [];

    public constructor(Param1?: ICourseHours) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.CourseId = Param1.CourseId;
            this.Edition = new ListObject(Param1.Edition);
            this.Date = new DateRange(Param1.Date);
            this.Year = new YearRange(Param1.Year);
            this.Semester = new ListRange(Param1.Semester);
            this.Quarter = new ListRange(Param1.Quarter);
            if (this.Hours.length) {
                for (let objHour of Param1.Hours) {
                    this.Hours.push(new ContentAreaHours(objHour));
                }
            }
        }
    }

    public Erase(): void {
        this.Id = '';
        this.CourseId = '';
        this.Edition.Erase();
        this.Date.Erase();
        this.Semester.Erase();
        this.Quarter.Erase();
        this.Year.Erase();
        this.Hours.splice(0,this.Hours.length);
    }

    public Export() : ICourseHours {
        let ExportedHours : IContentAreaHours [];
        for(let stHour of this.Hours) {
            ExportedHours.push(stHour.Export());
        }
        return {'Id' : this.Id,
                'CourseId' : this.CourseId,
                'Edition' : this.Edition.Export(),
                'Date' : this.Date.Export(),
                'Semester' : this.Semester.Export(),
                'Quarter' : this.Quarter.Export(),
                'Year' : this.Year.Export(),
                'Hours' : ExportedHours
        }
    }
}
