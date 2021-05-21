import { ListObject } from './list-object';
import { ICourseTableData } from '../_interfaces/i-course-table-data';
import { YearRange } from './year-range';

export class CourseTableData {
    public Id: string = '';
    public Choose: boolean = false;
    public CourseNumber: string = '';
    public CourseName: string = '';
    public Level: string = '';
    public Edition: string = '';
    public QuarterStart: string = '';
    public SemesterStart: string = '';
    public Year: string = '';
    public YearRange: number[] = [];
    public QuarterSelect: ListObject = new ListObject();
    public SemesterSelect: ListObject = new ListObject();
    public YearSelect: number = 0;


    public constructor(Param1?: ICourseTableData) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.Choose = Param1.Choose == 'T';
            this.CourseNumber = Param1.CourseNumber;
            this.CourseName = Param1.CourseName;
            this.Level = Param1.Level;
            this.Edition = Param1.Edition;
            this.Year = Param1.Year;
            for (const stIndex in Param1.YearRange) {
                this.YearRange.push(Param1.YearRange[stIndex]);
            }
            this.QuarterSelect = new ListObject(Param1.QuarterSelect);
            this.SemesterSelect = new ListObject(Param1.SemesterSelect);
            this.YearSelect = Param1.YearSelect;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Choose = false;
        this.CourseNumber = '';
        this.CourseName = '';
        this.Level = '';
        this.Edition = '';
        this.Year = '';
        this.YearRange.splice(0,this.YearRange.length);
        this.QuarterSelect.Erase();
        this.SemesterSelect.Erase();
        this.YearSelect = 0;
    }

    public Export() : ICourseTableData {
        let YearRangeExport: number[] = [];
        for (const stExportIndex in this.YearRange) {
            YearRangeExport.push(this.YearRange[stExportIndex]);
        }
        return {'Id' : this.Id,
                'Choose' : this.Choose ? 'T' : 'F',
                'CourseNumber' : this.CourseNumber,
                'CourseName': this.CourseName,
                'Level' : this.Level,
                'Edition' : this.Edition,
                'QuarterStart' : this.QuarterStart,
                'SemesterStart' : this.SemesterStart,
                'Year' : this.Year,
                'YearRange' : YearRangeExport,
                'QuarterSelect' : this.QuarterSelect.Export(),
                'SemesterSelect' : this.SemesterSelect.Export(),
                'YearSelect' : this.YearSelect}
    }
}
