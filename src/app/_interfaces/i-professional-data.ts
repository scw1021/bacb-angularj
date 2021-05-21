import { IListObject } from './i-list-object';
import { ListObject } from '../_models';

export interface IProfessionalData {
    PrimaryRole: IListObject;
    SecondaryRole: IListObject;
    PrimaryArea: IListObject;
    SecondaryArea: IListObject;
    PrimaryAreaOther: string;
    SecondaryAreaOther: string;
    TertiaryArea: IListObject [];
    ClientAges: IListObject [];
    SecondaryClientAges?: IListObject [];
}
export const BlankProfessionalData: IProfessionalData = {
  PrimaryRole: (new ListObject()).Export(),
  SecondaryRole: (new ListObject()).Export(),
  PrimaryArea: (new ListObject()).Export(),
  SecondaryArea: (new ListObject()).Export(),
  PrimaryAreaOther: "",
  SecondaryAreaOther: "",
  TertiaryArea: [],
  ClientAges: [],
  SecondaryClientAges: []
}
