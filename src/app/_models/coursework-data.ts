import { ICourseworkData } from '../_interfaces/i-coursework-data';
import { ListObject } from './list-object';

export class CourseworkData {
    public Id: string = '';
    public ContentHourId: string = '';
    public Semester: ListObject;
    public Quarter: ListObject;
    public Year: string = '';
    public AppId: string = '';

    public constructor(Param1?: ICourseworkData) {
        if (Param1) {
            this.Id = Param1.Id;
            this.ContentHourId = Param1.ContentHourId;
            this.Semester = new ListObject(Param1.Semester);
            this.Quarter = new ListObject(Param1.Quarter);
            this.Year = Param1.Year;
            this.AppId = Param1.AppId;
        }
    }

    public Erase() {
        this.Id = '';
        this.ContentHourId = '';
        this.Semester.Erase();
        this.Quarter.Erase();
        this.Year = '';
        this.AppId = '';
    }

    public Export() : ICourseworkData {
        return {'Id' : this.Id,
                'ContentHourId' : this.ContentHourId,
                'Semester' : this.Semester.Export(),
                'Quarter' : this.Quarter.Export(),
                'Year' : this.Year,
                'AppId' : this.AppId
        }
    }
}
