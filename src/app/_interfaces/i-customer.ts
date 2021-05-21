export interface ICustomer {
    Id: string;
    BACBID: string;
    Name: string;
}

export interface ICustomerExt extends ICustomer {
  IsQualified: boolean,
  CompletedSupervision: boolean
}
