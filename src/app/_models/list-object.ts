import { IListObject } from '../_interfaces/i-list-object';

export class ListObject implements IListObject {
    public Id: string;
    public Value: string;

    public constructor(Param1?: IListObject) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.Value = Param1.Value;
        }
        else {
          this.Erase();
        }
    }

    public Erase() {
        this.Id = '';
        this.Value = '';
    }

    public Export() : IListObject {
        return {'Id' : this.Id,
                'Value' : this.Value}
    }
}

