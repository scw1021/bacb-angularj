import { IState } from '../_interfaces';

export class State {
    public Id: string = '';
    public Abbrev: string = '';
    public Name: string = '';

    public constructor(Param1?: IState) {
      if (Param1) {
        // is blank for default, catch Azure gets
        if ( Param1.Id == null  ) {
          if ( Param1.Name != "" )
          {
            var result = StaticUnitedStatesList.filter( _state => Param1.Name == _state.Name );
            if (result?.length) this.load(result[0]);
          }
        }
        else {
          this.load(Param1);
        }
      }
    }

    private load(Param1){
      if ( Param1 ) {
        this.Id = Param1.Id;
        this.Abbrev = Param1.Abbrev;
        this.Name = Param1.Name;
      }
    }

    public Erase() {
        this.Id = '';
        this.Abbrev = '';
        this.Name = '';
    }

    public Export() : IState {
        return {'Id' : this.Id,
                'Abbrev' : this.Abbrev,
                'Name' : this.Name
        }
    }
  }
  export const StaticUnitedStatesList: IState[] = [{"Id":"13927369-00dc-ea11-a813-000d3a5a1477","Name":"Alabama","Abbrev":"AL"},{"Id":"14927369-00dc-ea11-a813-000d3a5a1477","Name":"Arizona","Abbrev":"AZ"},{"Id":"15927369-00dc-ea11-a813-000d3a5a1477","Name":"Arkansas","Abbrev":"AR"},{"Id":"16927369-00dc-ea11-a813-000d3a5a1477","Name":"California","Abbrev":"CA"},{"Id":"17927369-00dc-ea11-a813-000d3a5a1477","Name":"Colorado","Abbrev":"CO"},{"Id":"18927369-00dc-ea11-a813-000d3a5a1477","Name":"Connecticut","Abbrev":"CT"},{"Id":"19927369-00dc-ea11-a813-000d3a5a1477","Name":"District of Columbia","Abbrev":"DC"},{"Id":"1a927369-00dc-ea11-a813-000d3a5a1477","Name":"Delaware","Abbrev":"DE"},{"Id":"1b927369-00dc-ea11-a813-000d3a5a1477","Name":"Florida","Abbrev":"FL"},{"Id":"b4ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Idaho","Abbrev":"ID"},{"Id":"b5ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Illinois","Abbrev":"IL"},{"Id":"b8ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Maine","Abbrev":"ME"},{"Id":"beff726f-00dc-ea11-a813-000d3a5a1477","Name":"Minnesota","Abbrev":"MN"},{"Id":"c2ff726f-00dc-ea11-a813-000d3a5a1477","Name":"New Jersey","Abbrev":"NJ"},{"Id":"c3ff726f-00dc-ea11-a813-000d3a5a1477","Name":"New Hampshire","Abbrev":"NH"},{"Id":"c4ff726f-00dc-ea11-a813-000d3a5a1477","Name":"New York","Abbrev":"NY"},{"Id":"c7ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Ohio","Abbrev":"OH"},{"Id":"ceff726f-00dc-ea11-a813-000d3a5a1477","Name":"Pennsylvania","Abbrev":"PA"},{"Id":"cfff726f-00dc-ea11-a813-000d3a5a1477","Name":"Rhode Island","Abbrev":"RI"},{"Id":"d0ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Tennessee","Abbrev":"TN"},{"Id":"d1ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Texas","Abbrev":"TX"},{"Id":"d2ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Vermont","Abbrev":"VT"},{"Id":"d3ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Washington","Abbrev":"WA"},{"Id":"d4ff726f-00dc-ea11-a813-000d3a5a1477","Name":"Northern Mariana Islands","Abbrev":"MP"},{"Id":"2e38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Alaska","Abbrev":"AK"},{"Id":"3e38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Georgia","Abbrev":"GA"},{"Id":"3f38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Hawaii","Abbrev":"HI"},{"Id":"4838f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Indiana","Abbrev":"IN"},{"Id":"4938f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Kansas","Abbrev":"KS"},{"Id":"4d38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Iowa","Abbrev":"IA"},{"Id":"4f38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Louisiana","Abbrev":"LA"},{"Id":"5338f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Kentucky","Abbrev":"KY"},{"Id":"5538f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Maryland","Abbrev":"MD"},{"Id":"5738f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Michigan","Abbrev":"MI"},{"Id":"5a38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Massachusetts","Abbrev":"MA"},{"Id":"5b38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Mississippi","Abbrev":"MS"},{"Id":"5e38f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Montana","Abbrev":"MT"},{"Id":"6138f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Missouri","Abbrev":"MO"},{"Id":"6338f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Nevada","Abbrev":"NV"},{"Id":"6538f269-00dc-ea11-a813-000d3a5a1cf8","Name":"Nebraska","Abbrev":"NE"},{"Id":"8477ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"New Mexico","Abbrev":"NM"},{"Id":"8777ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"North Dakota","Abbrev":"ND"},{"Id":"8877ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"North Carolina","Abbrev":"NC"},{"Id":"8b77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Oklahoma","Abbrev":"OK"},{"Id":"8d77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Oregon","Abbrev":"OR"},{"Id":"8f77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"South Carolina","Abbrev":"SC"},{"Id":"9277ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"South Dakota","Abbrev":"SD"},{"Id":"9477ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Utah","Abbrev":"UT"},{"Id":"9877ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Virginia","Abbrev":"VA"},{"Id":"9a77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"West Virginia","Abbrev":"WV"},{"Id":"9d77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Wisconsin","Abbrev":"WI"},{"Id":"9f77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Wyoming","Abbrev":"WY"},{"Id":"a277ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"American Samoa","Abbrev":"AS"},{"Id":"a377ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Guam","Abbrev":"GU"},{"Id":"a777ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"United States Minor Outlying Islands","Abbrev":"UM"},{"Id":"aa77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"PuertoRico","Abbrev":"PR"},{"Id":"ad77ea6f-00dc-ea11-a813-000d3a5a1cf8","Name":"Virgin Islands","Abbrev":"VI"}];

