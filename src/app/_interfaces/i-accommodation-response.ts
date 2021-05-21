import { IAccommodation } from './i-accommodation';
import { IConfirm } from './i-confirm';

export interface IAccommodationResponse {
  Confirm: IConfirm,
  Accommodation: IAccommodation
}
