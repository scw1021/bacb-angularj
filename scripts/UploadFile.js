/**
 * UploadFile.js
 *
 * v1.0.0
 * 10/2/2019
 * Robert Imbler
 *
 * File Upload script to allow for >5MB files and 2.0 function assistance
 * Loads a file into Engyte folder
 * Creates a Document Record to facilitate Egnyte recall of uploaded file
 */
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
// Takes objRequest as type INetsuiteFile in Angular
define(['N/file', 'N/log', 'N/search', 'N/encode'], function (file, log, search, encode) {

  function UploadFile(context) {
    log.debug('Upload Invoked', 'Loading: ' + context.Name);
    var objRxData = context;
    // var objRxData;
    // if (stBody) {
    //   objRxData = JSON.parse(stBody);
    // }
    // Like most BACB Server responses, 'response' is TRUE when completed successfully, FALSE in all other situations
    var objResponse = {
      response: false,
      message: "Upload File SuiteScript Invoked",
      data: {}
    };
    objResponse.data['POST'] = objRxData.Document;
    // Get File Type
    var _fileType;
    switch(objRxData.Type) {
      case 'PDF':
        _fileType = file.Type.PDF;
        break;
      case 'IMAGE':
        _fileType = file.Type.IMAGE;
        break;
      default:
        _fileType = file.Type.PLAINTEXT;
        break;
    }
    // I am so tired of this shit not working
    // F@$% you I'm printing the whole thing
    // objResponse.data['FileTypes'] = file.Type;
    // DEBUG ELEMENT
    _fileType = file.Type.PDF;
    objResponse.data['FileType'] = _fileType;


    // Before creating the file, we need to find the Dev-specific Egnyte file
    var foldername= 'Egnyte';
    // var filter = new nlobjSearchFilter('name', null, 'contains', foldername);
    // var arrColumns = new Array();
    // // Currently grabbing extra info should it be required
    // arrColumns[0] = new nlobjSearchColumn('name');
    // arrColumns[1] = new nlobjSearchColumn('parent');
    // arrColumns[2] = new nlobjSearchColumn('internalid');
    // arrColumns[3] = new nlobjSearchColumn('description');
    // arrColumns[4] = new nlobjSearchColumn('internalid', 'file');
    // arrColumns[5] = new nlobjSearchColumn('name', 'file');
    // // Get Results
    // var searchResult = nlapiSearchRecord('folder', null , filter , arrColumns);
    var searchResult = foldername;
    // As it stands, we grab the only folder that is Egnyte
    try {

      // Let's just get our file and dump it back to console
      var loadedFile = file.load({
        id: 6834
      });
      objResponse.data['FileContents'] = loadedFile.getContents();
      objResponse.data['FileDescription'] = loadedFile.description;
      objResponse.data['FileEncoding'] = loadedFile.encoding;
      objResponse.data['FileType'] = loadedFile.fileType;



      // If we end up having multiple, find the other folder here
      if(searchResult != null){
        // Store search result locally and for response
        var folderId = 1026;// searchResult[0].getId();
        objResponse.data['EgnyteFolder'] = folderId;
      }
      else {
        throw('Egnyte folder not found');
      }
      // With the folder located, create the file in that folder
      // Create the file like NetSuite likes
      // var encodeResult = encode.convert({
      //   // remove the double quotes around the string apriori
      //   string: objRxData.Document,
      //   inputEncoding: encode.Encoding.UTF_8,
      //   outputEncoding: encode.Encoding.BASE_64
      // });
      // objResponse.data['NSB64'] = encodeResult;
      // objResponse.data['Ang64'] = objRxData.Base64;
      // log('UploadFile', 'encoded');
      var parsedData = objRxData.Document.replace(/.+base64,/,'');
      objResponse.data['CONV'] = parsedData;

      var fileObj = file.create({
        name: objRxData.Name,
        fileType: _fileType,
        contents: parsedData.replace(/"/g,'')
      });
      fileObj.folder = folderId;
      // Get the file ID on save
      var stFileId = fileObj.save();
      // if the save failed, let's deal with that now
      if (stFileId){
        objResponse.data['FileID'] = stFileId;
      }
      else {
        throw('FileObject could not be saved');
      }
      // var recDoc = nlapiCreateRecord('customrecord_documents');
      // recDoc.setFieldValue('custrecord_doc_customer', CustomerID);
      // recDoc.setFieldValue('custrecord_doc_orig_filename', rxData.Name);
      // recDoc.setFieldValue('custrecord_doc_application', rxData.AppId);
      // recDoc.setFieldValue('custrecord_doc_type', "1");
      // recDoc.setFieldValue('custrecord_doc_file', stFileId);
      // recDoc.setFieldValue('custrecord_doc_version', "1");
      // recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));
      // var result = nlapiSubmitRecord(recDoc, true, true);
      // // As before, handle errors
      // if (result) {
      //   objResponse.data['Record'] = result;
      // }
      // else {
      //   throw('Document Record failed to Submit');
      // }
      // We did it, fix the response
      objResponse.response = true;
    }
    catch (ex) {
      // set the message and move on
      objResponse.message = ex;
    }
    // Once all things are complete or thrown an error, send back the required response
    finally {
      return objResponse;
    }
  }

  return {
    put: function() {
      log.debug('Upload File: PUT');
      return 'LIT';
    },
    post: UploadFile,
    get: function() {
      log.debug('Upload File: GET');
      return "Got 'Em";
    },

  }
})
