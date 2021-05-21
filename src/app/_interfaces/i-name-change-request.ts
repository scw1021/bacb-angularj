import { ListObject } from "../_models";
import { IListObject } from "./i-list-object";

export interface INameChangeRequest {
  OriginalFirstName: string;
  OriginalMiddleName: string;
  OriginalLastName: string;
  OriginalSuffix?: IListObject;
  OriginalPrefix?: IListObject;
  RequestedFirstName: string;
  RequestedMiddleName: string;
  RequestedLastName: string;
  RequestedSuffix?: IListObject;
  RequestedPrefix?: IListObject;
  Document: string;
}
