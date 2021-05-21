import { AppType } from './app-type';
import { CertType } from './cert-type';
import { IAttestQuestion } from '../_interfaces';

export class AttestQuestion {
    public Id: string = '';
    public AQAppType: AppType = new AppType();
    public AQCertType: CertType = new CertType();
    public ReadOnly: boolean = false;
    public Type: string = '';
    public Number: string = '';
    public Section: string = '';
    public Title: string = '';
    public Text: string = '';
    public HTML: string = '';
    public CanBeFalse: boolean = false;
    public TrueOption: string = '';
    public FalseOption: string = '';
    public DocRequired: boolean = false;
    public DocRequiredOn: boolean = false;


    public constructor(Param1?: IAttestQuestion) {
      if (Param1) {
          this.Id = Param1.Id;
          this.AQAppType = new AppType(Param1.AQAppType);
          this.AQCertType = new CertType(Param1.AQCertType);
          this.Number = Param1.Number;
          this.Section = Param1.Section;
          this.Title = Param1.Title;
          this.Text = Param1.Text;
          this.HTML = Param1.HTML;
          this.CanBeFalse = Param1.CanBeFalse == 'T' ? true : false;
          this.TrueOption = Param1.TrueOption;
          this.FalseOption = Param1.FalseOption;
          this.DocRequired = Param1.DocRequired == 'T' ? true : false;
          this.DocRequiredOn = Param1.DocRequiredOn == 'T' ? true : false;
        }
    }

    public Erase() : void {
      this.Id = '';
      this.Number = '';
      this.Section = '';
      this.Title = '';
      this.Text = '';
      this.HTML = '';
      this.CanBeFalse = false;
      this.TrueOption = '';
      this.FalseOption = '';
      this.DocRequired = false;
      this.DocRequiredOn = false;
    }

    public Export() : IAttestQuestion {
      return {
        'Id' : this.Id,
        'AQAppType' : this.AQAppType.Export(),
        'AQCertType' : this.AQCertType.Export(),
        'Number' : this.Number,
        'Section' : this.Section,
        'Title' : this.Title,
        'Text' : this.Text,
        'HTML' : this.HTML,
        'CanBeFalse' : this.CanBeFalse ? 'T' : 'F',
        'TrueOption' : this.TrueOption,
        'FalseOption' : this.FalseOption,
        'DocRequired' : this.DocRequired ? 'T' : 'F',
        'DocRequiredOn' : this.DocRequiredOn ? 'T' : 'F'
      }
    }
}
