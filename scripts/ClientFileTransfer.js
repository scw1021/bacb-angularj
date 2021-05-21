/**
 * ClientFileTransfer.js
 *
 * v1.0.0
 * 10/24/2019
 * Robert Imbler
 *
 * UPLOAD:
 *  File Upload script to allow for >5MB files and 2.0 function assistance
 *  Loads a file into Engyte folder
 *  Creates a Document Record to facilitate Egnyte recall of uploaded file
 * DOWNLOAD:
 *  Pull File from Netsuite and deliver to client?? I don't know what that actually should do
 *  now that I think about it
 *
 * NOTES:
 *  This could probably use a refactor once we get further along
 *  But, it works now and there's too much to get done otherwise
 *  If there is a better way to get the file information determined,
 *  it might be worth evaluating.
 *
 * CHANGELOG: Since this is stored elsewhere, please update this information.
 * 10/24/19 - Search column 'name' removed from query after it was removed from NS record
 * 01/30/20 - Added the Evaluated filename to the newly created Doc record under New Filename for Egnyte
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */

define(["N/file", "N/log", "N/record", "N/search"], function(
  file,
  log,
  record,
  search
) {
  /**
   * This function determines the course of action to take from the POST object
   * Parameters should be set by the .SS UrlResolve request
   * Parameters should include folder information, or file location information
   * @param { action: string, package: any, params: {} } context
   */
  function EvaluateRequest(context) {
    log.debug("FILE TRANSFER", "Initiated");
    switch (context.action) {
      case "UPLOAD":
        return _UploadFile(context.package, context.params);
      case "DOWNLOAD":
        return _DownloadFile(context.package);
      default:
        log.error("FILE TRANSFER", "No action specified!");
        break;
    }
  };


  /**
   *
   * @param {*} CustId
   * @param {*} DocType
   * @param {*} objResponse
   */
  function _getVersionNumber(CustId, DocType, objResponse) {

    // First, let's get the version number
    var versionSearchResult = search.create({
      type: 'customrecord_documents',
      columns: [
        'internalid', 'custrecord_doc_application', 'custrecord_doc_type',
        'custrecord_doc_version'
      ],
      // So we can't search by doc type because we only have it as a string
      // and filters require a numeric. So I'll just parse it out manually.
      filters: [{
        name: 'custrecord_doc_customer',
        operator: 'is',
        values: [CustId]
      }]
    }).run().getRange({start: 0, end: 100});
    objResponse.data['SearchResults'] = versionSearchResult;
    // Let's get the appropriate version number now
    var _version = 0;
    // Make the result typesafe too
    (versionSearchResult || []).forEach( function(_file) {
      log.debug(_file.getText("custrecord_doc_type"), DocType);
      if ( _file.getText("custrecord_doc_type") == DocType ) {
        if ( parseInt(_file.getValue("custrecord_doc_version")) > _version ) {
          _version = parseInt(_file.getValue("custrecord_doc_version"));
        }
      }
    });
    _version = _version + 1;
    objResponse.data['version'] = '' + _version;
    // Set output
    return (_version < 10) ? '0' + _version : '' + _version;
  };
  /**
   * Uploads a file to Netsuite, requires stringified file, Folder ID, CustomerID, App ID, and Date of Submission
   * @param {any} clientFile - This is just objRxData in the .ss script TODO: refactor with better nomenclature that reflects final changes?
   * @param {folder: string, CustID: string, Date: any} params
   */
  function _UploadFile(clientFile, params) {
    // To remove all extra output, change this value
    var _debugging = true;
    log.debug("Upload Invoked", "Loading: " + clientFile.Name);
    log.debug("Upload Invoked", "For: " + params.CustId);
    var objResponse = {
      response: false,
      message: "Upload File SuiteScript Invoked",
      data: {}
    };
    // If the browser has stayed open too long, the CustId is null and we need to stop here
    if ( params.CustId == null ) {
      objResponse.message = "Not Logged in!"
      return objResponse;
    }

    // As it stands, we grab the only folder that is Egnyte for most uploads
    // The folder is determined by the sending .ss script
    try {
      var _version = _getVersionNumber(params.CustId, clientFile.DocumentRecordType, objResponse);
      // Get File Type
      // For Uploads, please have the client determine file type as an angular file type
      var _fileType;
      var parsedData;
      // Based on the file type, parse the file package accordingly
      objResponse.data["ClientFileType"] = clientFile.DocType;
      switch (clientFile.DocType) {
        case "PDF":
          // We will want this lower-case because we use it in the naming system later (.pdf)
          clientFile.DocType = "pdf";
          // No break though, because this is a waterfall function
        case "pdf":
          _fileType = file.Type.PDF;
          log.debug('Write File',' Writing a PDF');
          // If it's a PDF then we need to strip some characters off
          // All Angular BASE_64 strings are prepended with a short file
          // description string which we need to remove
          parsedData = clientFile.Document.replace(/.+base64,/, "");
          parsedData = parsedData.replace(/"/g,'');
          break;
        case "IMAGE":
          _fileType = file.Type.IMAGE;
          parsedData = clientFile.Document;
          break;
        default:
            log.debug('Write File','BISH you writing plaintext again');
          _fileType = file.Type.PLAINTEXT;
          parsedData = clientFile.Document;
          break;
      }
      // Create the desired File Name
      var EvaluatedFileName = clientFile.DocumentRecordType + '_' + params.bacbId + '_' + clientFile.Date + '_' + _version + '.' + clientFile.DocType;
      var fileObj = file.create({
        name: EvaluatedFileName,
        fileType: _fileType,
        contents: parsedData
      });
      // All information, as aquired can be passed back to the client
      if ( _debugging ) {
        objResponse.data["FileType"] = _fileType;
        objResponse.data['Folder'] = params.folder;
      }
      fileObj.folder = params.folder;
      // Get the file ID on save, commiting whatever file we got
      var stFileId = fileObj.save();
      // if the save failed, let's deal with that now
      if (stFileId) {
        _debugging ? objResponse.data["FileID"] = stFileId : null;
      } else {
        throw "FileObject could not be saved";
      }

      // in order to better commemorate this most cowabunga of occasions
      var recDoc = record.create({
        type: 'customrecord_documents',
        // isDynamic: true
      });
      // With the record created, we need to specify all the working information
      // But with 2.0, we just SET the fields all willy nilly individually
      recDoc.setValue({ fieldId: 'custrecord_doc_customer', value: params.CustId });
      recDoc.setValue({ fieldId: 'custrecord_doc_orig_filename', value: clientFile.Name });
      recDoc.setValue({ fieldId: 'custrecord_doc_application', value: clientFile.AppId });
      recDoc.setValue({ fieldId: 'custrecord_doc_type', value: clientFile.DocumentRecordTypeId });
      recDoc.setValue({ fieldId: 'custrecord_doc_file', value: stFileId });
      recDoc.setText ({ fieldId: 'custrecord_doc_version', text: _version });
      recDoc.setValue({ fieldId: 'custrecord_doc_infilecabnet', value: true });
      recDoc.setValue({ fieldId: 'custrecord_doc_needs_uploaded', value: true });
      recDoc.setValue({ fieldId: 'custrecord_doc_upload_source', value: "1" });
      recDoc.setValue({ fieldId: 'custrecord_doc_new_filename', value: EvaluatedFileName });
      // We need to toss in a date too
      var d = new Date();
      var dateStr = ''+(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
      objResponse.data['DateStr'] = dateStr;
      recDoc.setText({ fieldId: 'custrecord_doc_date_uploaded', text: dateStr});

      if ( params.Version < 10 ) {
        params.Version = "0" + params.Version;
      }
      recDoc.setValue({
        fieldId: 'name',
        value: EvaluatedFileName
      });
      // recDoc.setValue({ fieldId: 'custrecord_doc_date_uploaded', value: params.Date });

      // Save the Document Record
      var recDocId = recDoc.save();
      objResponse.data['DocumentRecordId'] = recDocId;
      // // As before, handle errors
      if (recDocId) {
        _debugging ? objResponse.data['DocumentRecord'] = recDoc : null;
      }
      else {
        throw('Document Record failed to Create');
      }
      // Throw separate issue for submit fields if it didn't already throw an error
      if (!recDoc) {
        throw('Document Record failed to Submit Fields');
      }
      // We did it, fix the response
      objResponse.response = true;
    } catch (ex) {
      // set the message and move on
      objResponse.message = ex;
    } finally {
      // Once all things are complete or thrown an error, send back the required response
      return objResponse;
    }
  }

  return {
    put: function() {
      log.debug("Upload File: PUT");
      return "LIT";
    },
    post: EvaluateRequest,
    get: function() {
      log.debug("Upload File: GET");
      return "Got 'Em";
    }
  };
});
