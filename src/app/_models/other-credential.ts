import { Country } from './country';
import { ListObject } from './list-object';
import { State } from './state';
import { IOtherCredential } from '../_interfaces/i-other-credential';

export class OtherCredential {
    public Id: string = '';
    public Type: ListObject = new ListObject();
    public Title: string = '';
    public Country: Country = new Country();
    public State: State = new State();
    public Number: string = '';
    public Year: string = '';

    public constructor(Param1?: IOtherCredential) {
      if( Param1 ){
        this.Id = Param1.Id;
        this.Country = new Country(Param1.Country);
        this.State = new State(Param1.State);
        this.Title = Param1.Title;
        this.Type = new ListObject(Param1.Type);
        this.Number = Param1.Number;
        this.Year = Param1.Year;
      }
    }

    public Erase() : void {
      this.Id = '';
      this.Type.Erase;
      this.Title = '';
      this.Country.Erase();
      this.State.Erase();
      this.Number = '';
      this.Year = '';
    }

    public Export() : IOtherCredential {
      return {
        'Id' : this.Id,
        'Type' : this.Type.Export(),
        'Title' : this.Title,
        'Country' : this.Country.Export(),
        'State' : this.State.Export(),
        'Number' : this.Number,
        'Year' : this.Year
      }
    }
}
