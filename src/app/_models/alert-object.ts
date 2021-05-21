import { IAlertObject } from '../_interfaces/i-alert-object';

export class AlertObject implements IAlertObject {
    public Type : string = '';
    public Text : string = '';

    public constructor();
    public constructor(NewAlert : AlertObject);
    public constructor(NewType : string, NewText : string);
    public constructor(Param1?: any, Param2?: string) {
        if (typeof Param1 == 'object') {
            this.Type = Param1.Type;
            this.Text = Param1.Text;
        }
        else if (typeof Param1 == 'string') {
            this.Type = Param1;
            this.Text = Param2;
        }
        else {
          this.Erase();
        }
    }

    public Erase() : void {
        this.Type = '';
        this.Text = '';
    }
    public Export() : IAlertObject {
      return {
        Type: this.Type,
        Text: this.Text
      }
    }
}
