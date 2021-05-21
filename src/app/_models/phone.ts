import { Country } from './country';
import { IPhone } from '../_interfaces/i-phone';

export class Phone {
    public Country: Country = new Country();
    public Number: string = '';
    public Ext: string = '';
    public IsMobile: boolean = false;

    public constructor(Param1?: IPhone) {
        if ( Param1 ){
            this.Country = new Country(Param1.Country);
            this.Number = Param1.Number;
            this.Ext = Param1.Ext;
            this.IsMobile = Param1.IsMobile;
        }
    }
    public get Display(): string {
      let RetVal: string = '';
      if (typeof this.Country.DialCode !== 'undefined' || this.Country.DialCode !== '') {
          RetVal += this.Country.DialCode + " - ";
      }
      RetVal += this.Number;
      if (this.Ext) {
          RetVal += " Ext: " + this.Ext;
      }
      return RetVal;
  }

    public Erase(): void {
        this.Country.Erase();
        this.Number = '';
        this.Ext = '';
        this.IsMobile = false;
    }

    public Export() : IPhone {
        return {
          'Country' : this.Country.Export(),
          'Number' : this.Number,
          'Ext' : this.Ext,
          'IsMobile' : this.IsMobile
        }
    }
}
