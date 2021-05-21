import { IDateRange } from '../_interfaces/i-date-range';

export class DateRange {
    public Start: Date | null = null;
    public End: Date | null = null;

    public constructor();
    public constructor(NewRange: DateRange);
    public constructor(NewIRange: IDateRange);
    public constructor(Param1?: any) {
        if (typeof Param1 == 'object') {
            if (Param1.Start instanceof Date) {
                this.Start = new Date(Param1.Start)
            }
            else {
                let DateArray1: string[] = Param1.Start.split("/", 3);
                this.Start = new Date(DateArray1[2] + "-" + DateArray1[0] + "-" + DateArray1[1])
            }
            if (Param1.End instanceof Date) {
                this.End = new Date(Param1.End)
            }
            else {
                let DateArray2: string[] = Param1.End.split("/", 3);
                this.End = new Date(DateArray2[2] + "-" + DateArray2[0] + "-" + DateArray2[1])
            }
        }
    }

    public GetFullRange() : string {
        return this.Export().Start + ' - ' + this.Export().End;
    }

    public Erase() : void {
        this.Start = null;
        this.End = null;
    }

    public Export() : IDateRange {
        let StartExport: string = this.Start != null ? (1 + this.Start.getMonth()) + '/' + this.Start.getDate() + '/' + this.Start.getFullYear() : '';
        let EndExport: string = this.End != null ? (1 + this.End.getMonth()) + '/' + this.End.getDate() + '/' + this.End.getFullYear() : '';
        return {
            'Start' : StartExport,
            'End' : EndExport
        }
    }
}
