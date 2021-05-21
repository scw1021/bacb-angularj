import { IDocumentType } from './i-document-type';

export interface IUploadedFile {
  Id: string;
  Name: string;
  Date: string;
  CertCycleId?: string;
  CEActivityId?: string;
  Type: IDocumentType;
}
