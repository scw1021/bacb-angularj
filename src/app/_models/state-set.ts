import { Country } from './country';
import { State } from './state';
import { IStateSet } from '../_interfaces/i-state-set';

export class StateSet {
    public Country : Country;
    public States : State[] = [];

    public constructor(Param1 ?: IStateSet) {
        if ( Param1 ) {
            this.Country = new Country(Param1.Country);
            this.States = [];
            for (let objState of Param1.States) {
                this.States.push(new State(objState));
            }
        }
        else {
            this.Country = new Country();
            this.States = [];
        }
    }

    public Erase() : void {
        this.Country.Erase();
        this.States.splice(0,this.States.length);
    }

    public Export() : IStateSet {
        let IStateArray = [];
        for (let objState of this.States) {
            IStateArray.push(objState.Export());
        }
        return {"Country" : this.Country.Export(),
                "States" : IStateArray}
    }
}
