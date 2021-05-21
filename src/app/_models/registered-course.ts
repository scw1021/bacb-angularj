import { ListObject } from './list-object';
import { IRegisteredCourse, ICourse } from 'src/app/_interfaces';
import { Course } from './course';

export class RegisteredCourse {
    public Id: string = '';
    public DepartmentId: string = '';
    public Name: string = '';
    public ApprovalLevel: string = '';
    public AcademicStructure: ListObject = new ListObject();
    public Type: string = '';
    public Courses: Course[] = [];

    public constructor();
    public constructor(RegCourse: RegisteredCourse);
    public constructor(IRegCourse: IRegisteredCourse);
    public constructor(Param1?: any) {
        if (typeof Param1 == 'object') {
            this.Id = Param1.Id;
            this.DepartmentId = Param1.DepartmentId;
            this.Name = Param1.Name;
            this.ApprovalLevel = Param1.ApprovalLevel;
            this.AcademicStructure = new ListObject(Param1.AcademicStructure);
            this.Type = Param1.Type;
            for (let stIndex in Param1.Courses) {
                this.Courses.push(Param1.Courses[stIndex]);
            }
        }
    }

    public Erase() : void {
        this.Id = '';
        this.DepartmentId = '';
        this.Name = '';
        this.ApprovalLevel = '';
        this.AcademicStructure.Erase();
        this.Type = '';
    }

    public Export() : IRegisteredCourse {
        let ExportCourses: ICourse[] = [];
        for (let stExportIndex in this.Courses) {
            ExportCourses.push(this.Courses[stExportIndex].Export());
        }
        return {'Id' : this.Id,
                'DepartmentId' : this.DepartmentId,
                'Name' : this.Name,
                'ApprovalLevel' : this.ApprovalLevel,
                'AcademicStructure' : this.AcademicStructure.Export(),
                'Type' : this.Type,
                'Courses' : ExportCourses}
    }
}
