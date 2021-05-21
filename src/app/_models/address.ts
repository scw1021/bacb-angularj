import { Country } from './country';
import { IAddress } from '../_interfaces';
import { State } from './state';

export class Address {
    public Index: string = '';
    public Address1: string = '';
    public Address2: string = '';
    public City: string = '';
    public State: State = new State();
    public Country: Country = new Country();
    public PostalCode: string = '';
    public isShipping: boolean = false;
    public isBilling: boolean = false;


  public constructor(Param1?: IAddress) {
    if (typeof Param1 == 'object') {
      this.Index = Param1.Index;
      this.Address1 = Param1.Address1;
      this.Address2 = Param1.Address2;
      this.City = Param1.City;
      this.State = new State(Param1.State);
      this.Country = new Country(Param1.Country);
      this.PostalCode = Param1.PostalCode;
      this.isShipping = Param1.isShipping == 'T';
      this.isBilling = Param1.isBilling == 'T';
    }
  }

  public Erase() {
    this.Index = '';
    this.Address1 = '';
    this.Address2 = '';
    this.City = '';
    this.State.Erase();
    this.Country.Erase();
    this.PostalCode = '';
    this.isShipping = false;
    this.isBilling = false;
  }

    public Export(): IAddress {
      // console.log('AddressExport: ', this.Export());
        return {
            Index: this.Index,
            Address1: this.Address1,
            Address2: this.Address2,
            City: this.City,
            State: this.State.Export(),
            Country: this.Country.Export(),
            PostalCode: this.PostalCode,
            isShipping: this.isShipping ? 'T' : 'F',
            isBilling: this.isBilling ? 'T' : 'F'
        };
    }
}
