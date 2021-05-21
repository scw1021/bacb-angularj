
import { IComponentData } from '../_interfaces/i-component-data';

export class ComponentData {

    public Page: number = 0;
    public SummaryPage: number = 0;
    public constructor(Param1?: IComponentData) {
        if ( Param1 ) {
            this.Page = Param1.Page;
            this.SummaryPage = Param1.SummaryPage;
        }

    }

    public Erase() : void {
        this.Page = 0;
        this.SummaryPage = 0;
    }

    public Export() : IComponentData {
        return {'Page' : this.Page,
                'SummaryPage' : this.SummaryPage}
    }

}
