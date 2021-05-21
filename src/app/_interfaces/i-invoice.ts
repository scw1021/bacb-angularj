export interface IInvoice {
  Id: string;
  InvoiceId: string;
  VersionId: string;
  Version: {
    Name: string;
    Price: number;
  }
  PaymentId: string;
}

let json =
{
  "Id": "8a5d2c10-7940-eb11-a813-000d3a5a7103",
  "NetSuiteId": null,
  "VersionId": "928b3fb0-2140-eb11-a813-00224808102a",
  "Version": {
      "Id": "928b3fb0-2140-eb11-a813-00224808102a",
      "NetSuiteId": null,
      "Name": "2019 BCBA Exam Application Option 2",
      "Price": 245.0,
      "CurrencyId": "7eb3b82b-6e97-ea11-a811-000d3a33f0ae",
      "ProductId": "c4e5e64e-1240-eb11-a813-00224808102a",
      "Product": {
          "Id": "c4e5e64e-1240-eb11-a813-00224808102a",
          "NetSuiteId": null,
          "Name": "BCBA Exam Application",
          "Description": null
      }
  },
  "InvoiceId": "5a020bfd-0d40-eb11-a813-000d3a5a7103",
  "Invoice": {
      "Id": "5a020bfd-0d40-eb11-a813-000d3a5a7103",
      "NetSuiteId": null,
      "Number": "1005",
      "ContactId": "e5d42cbd-6ac3-4a9a-80b9-3508bba81834",
      "ApplicationId": "7adfced1-5533-eb11-a813-000d3a5a7103"
  },
  "PaymentId": null,
  "Payment": null
}
