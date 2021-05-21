import { IAccommodation } from '../_interfaces/i-accommodation';

export class Accommodation {
  public LargeFont: boolean = false;
  public Scribe: boolean = false;
  public TimeAndAHalf: boolean = false;
  public SignLanguageInterpreter: boolean = false;
  public AdjustableHeightDesk: boolean = false;
  public Reader: boolean = false;
  public AdditionalTime: boolean = false;
  public DoubleTime: boolean = false;
  public SeparateTestingRoom: boolean = false;
  public Other: string = '';

  public constructor(accommodation?: IAccommodation) {
    if ( accommodation ) {
      this.LargeFont = accommodation.LargeFont == 'T';
      this.Scribe = accommodation.Scribe == 'T';
      this.TimeAndAHalf = accommodation.TimeAndAHalf == 'T';
      this.SignLanguageInterpreter = accommodation.SignLanguageInterpreter == 'T';
      this.AdjustableHeightDesk = accommodation.AdjustableHeightDesk == 'T';
      this.Reader = accommodation.Reader == 'T';
      this.AdditionalTime = accommodation.AdditionalTime == 'T';
      this.DoubleTime = accommodation.DoubleTime == 'T';
      this.SeparateTestingRoom = accommodation.SeparateTestingRoom == 'T';
      this.Other = accommodation.Other;
    }
  }

  public Export() {
    return {
      LargeFont: this.LargeFont ? 'T' : 'F',
      Scribe: this.Scribe ? 'T' : 'F',
      TimeAndAHalf: this.TimeAndAHalf ? 'T' : 'F',
      SignLanguageInterpreter: this.SignLanguageInterpreter ? 'T' : 'F',
      AdjustableHeightDesk: this.AdjustableHeightDesk ? 'T' : 'F',
      Reader: this.Reader ? 'T' : 'F',
      AdditionalTime: this.AdditionalTime ? 'T' : 'F',
      DoubleTime: this.DoubleTime ? 'T' : 'F',
      SeparateTestingRoom: this.SeparateTestingRoom ? 'T' : 'F',
      Other: this.Other,
    }
  }

  public Erase() {
    this.LargeFont = false;
    this.Scribe = false;
    this.TimeAndAHalf = false;
    this.SignLanguageInterpreter = false;
    this.AdjustableHeightDesk = false;
    this.Reader = false;
    this.AdditionalTime = false;
    this.DoubleTime = false;
    this.SeparateTestingRoom = false;
    this.Other = '';
  }
}
