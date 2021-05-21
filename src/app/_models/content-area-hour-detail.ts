import { IContentAreaHourDetail } from '../_interfaces/i-content-area-hour-detail';

export class ContentAreaHourDetail {
    public Id: string = '';
    public Abbrev: string = '';
    public Name: string = '';
    public Display: string = '';

    public constructor(Param1?: IContentAreaHourDetail) {
        if (Param1) {
            this.Id = Param1.Id;
            this.Abbrev = Param1.Abbrev;
            this.Name = Param1.Name;
            this.Display = Param1.Display;
        }
    }

    public Erase() : void {
        this.Id = '';
        this.Abbrev = '';
        this.Name = '';
        this.Display = '';
    }

    public Export() : IContentAreaHourDetail {
        return {'Id' : this.Id,
                'Abbrev' : this.Abbrev,
                'Name' : this.Name,
                'Display' : this.Display}
    }
}
