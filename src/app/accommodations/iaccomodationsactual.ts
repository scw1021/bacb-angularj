export interface IAccommodationsActual {
  Id: string,
  ClientAccommodationTypeId: number,
  ShortDescription: string,
  TypeCodeShort: string,
  LongDescription: string
}

export interface IUserAccommodation {
  Type: IAccommodationsActual;
  DateSubmitted: string;
  Status: "Approved" | "Denied" | "Pending",
}
