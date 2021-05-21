export interface INetsuiteFile {
  // Document Name
  Name: string;
  // Document Type - NOTE: non-TXT style must be base64 else error
  Type: string;
  // Docstring from file import
  Document: string;
}
