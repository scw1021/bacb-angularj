import { IListRange, IListObject } from '../_interfaces';
import { ListObject } from './list-object';

export class ListRange {
    public Start : ListObject = new ListObject();
    public End : ListObject = new ListObject();
    public Range: ListObject[] = [];

    public constructor(Param1?: IListRange) {
        if(Param1){
          this.Start = new ListObject(Param1.Start);
          this.End = new ListObject(Param1.End);
        }
    }

    public Erase() : void {
        this.Start.Erase();
        this.End.Erase();
        this.Range.splice(0, this.Range.length);
    }

    public Export() : IListRange {
        let ExportRange: IListObject[] = [];
        for (let stIndex in this.Range) {
            ExportRange.push(this.Range[stIndex].Export());
        }
        return {'Start' : this.Start.Export(),
                'End' : this.End.Export(),
                'Range' : ExportRange}
    }

}
