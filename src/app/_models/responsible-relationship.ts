import { Customer } from './customer';
import { IResponsibleRelationship } from '../_interfaces/i-responsible-relationship';

export class ResponsibleRelationship {
  public Id: string = '';
  public StartDate?: Date | null = null;
  public EndDate: Date | null = null;
  public Customer: Customer = new Customer();
  public Agency?: string;
  public SupervisorRelationship?: string;
  public Document?: string;
  public TrainingType?: string;
  public Relationships: string[] = ['', 'Employer', 'Contractual'];

  constructor(param?: IResponsibleRelationship) {
    if ( param ) {
      if ( param.StartDate ) {
        this.StartDate = new Date(param.StartDate);
      }
      if ( param.Agency ) {
        this.Agency = param.Agency;
      }
      if ( param.SupervisorRelationship ) {
        this.SupervisorRelationship = param.SupervisorRelationship;
      }
      if ( param.Document ) {
        this.Document = param.Document;
      }
      if ( param.TrainingType ) {
        this.TrainingType = param.TrainingType;
      }
      this.EndDate = new Date(param.EndDate);
      this.Customer = new Customer(param.Customer);
      this.Id = param.Id;
    }

  }

  public Erase(): void {
    this.Id = '';
    this.Customer = new Customer();
    this.EndDate = null;
    this.StartDate = null;
    this.Agency = null;
    this.SupervisorRelationship = null;
    this.Document = null;
    this.TrainingType = null;
  }

  public Export(): IResponsibleRelationship {
    return {
      Id: this.Id,
      Customer: {
        Id: this.Customer.Id,
        Name: this.Customer.Name,
        BACBID: this.Customer.BACBID
      },
      EndDate: this.EndDate ? this.EndDate.toDateString() : null,
      StartDate: this.StartDate ? this.StartDate.toDateString() : null,
      Agency: this.Agency ? this.Agency : null,
      SupervisorRelationship: this.SupervisorRelationship ? this.SupervisorRelationship : null,
      Document: this.Document ? this.Document : null,
      TrainingType: this.TrainingType ? this.TrainingType: null,
    }
  }
}
