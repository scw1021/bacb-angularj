import { IContentAreaHours } from '../_interfaces';
import { ContentAreaHourDetail } from './content-area-hour-detail';

export class ContentAreaHours {
    public Id: string = '';
    public CourseHourId: string;
    public Abbrev: string = '';
    public Type: ContentAreaHourDetail = new ContentAreaHourDetail();
    public Value: number = 0;

    public constructor(Param1?: IContentAreaHours) {
        if (Param1) {
            this.Id = Param1.Id;
            this.CourseHourId = Param1.CourseHourId;
            this.Abbrev = Param1.Abbrev;
            this.Type = new ContentAreaHourDetail(Param1.Type);
            this.Value = Param1.Value;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.CourseHourId = '';
        this.Abbrev = '';
        this.Type.Erase();
        this.Value = 0;
    }

    public Export() : IContentAreaHours {
        return {'Id' : this.Id,
                'CourseHourId': this.CourseHourId,
                'Abbrev' : this.Abbrev,
                'Type' : this.Type.Export(),
                'Value' : this.Value}
    }
}
