import { ICourse } from '../_interfaces';
import { Course } from './course';
import { ICourseworkFull } from '../_interfaces/i-coursework-full';

export class CourseworkFull {
    public Id: string = '';
    public ContentHour: Course = new Course();

    public constructor(Param1?: ICourseworkFull) {
        if (Param1) {
          this.Id = Param1.Id;
          this.ContentHour = new Course(Param1.ContentHour);
        }
    }

    public Erase() : void {
        this.Id = '';
        this.ContentHour.Erase();
    }

    public Export() : ICourseworkFull {
        return {'Id' : this.Id,
                'ContentHour' : this.ContentHour.Export()}
    }
}
