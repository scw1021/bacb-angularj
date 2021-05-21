import { IYearRange } from '../_interfaces/i-year-range';

export class YearRange {
    public Start: number = 2000;
    public End: number;

    public constructor(Param1?: IYearRange) {
        if ( Param1 ) {
            this.Start = Param1.Start;
            this.End = Param1.End;
        }
        else {
            this.Start = 2000;
            this.End = new Date().getFullYear();
        }
    }

    public GetFullRange() : number[] {
        let RangeArray: number[] = [];
        RangeArray.push(this.Start);
        while (RangeArray[RangeArray.length - 1] < this.End) {
            RangeArray.push(RangeArray[RangeArray.length - 1] + 1);
        }
        return RangeArray;
    }

    public Erase() : void {
        this.Start = 2000;
        this.End = new Date().getFullYear();
    }

    public Export() : IYearRange {
        return {'Start' : this.Start,
                'End' : this.End}
    }

}
