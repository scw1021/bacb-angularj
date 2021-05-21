/**
 * FileMgmt.ss
 *
 * v1.0.0
 * 11/07/2019
 * Robert Imbler
 *
 * UPLOAD:
 *  File Upload script to allow for >5MB files and 2.0 function assistance
 *  Creates a Document Record to facilitate Egnyte recall of uploaded file
 *
 * NOTES:
 *  This uses nlapiresolveurl to use a NS2.0 Restlet to load files.
 *  This requires an update in order to better manage the login credentials.
 *  I guess we can just manually change thing until then, but this is FAR from ideal
 *  however it isn't worth refactoring until we have confirmation on what requires refactor
 *
 */

var ACTIONS = {
  Create: _Create,
  Read: _Read,
  ReadDocTypes: _ReadDocTypes,
  Write: _Create,
  Egnyte: _Egnyte
};

const BACB_FOLDER_ID = 1026;

function service(objRequest) {
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest))

	var stParam = objRequest['param'];
	if (ACTIONS[stParam]) {
		return ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};
function _Create (objRequest) {
  nlapiLogExecution('AUDIT',"Write File", "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  try {
    var customerName = objSession.getCustomer().getFieldValues().name;
  } catch (ex) {
    nlapiLogExecution(
      "ERROR",
      "Write File",
      "The call to get the current web session failed.:" + ex.message
    );
  }

  var _response = {
    Response: 'F',
    Message: 'FileMGMT ResolveUrl Invoked',
    UrlResponse: {}
  }

  // Create the required call to ClientFileTransfer and load the file
  try {
    // we need to parse out just the numeric value for the customer
    // customer name is styled: "12345678 First M Last"
    // so let's just strip all characters after a space
    var BACBID = customerName.replace(/ .+/g, ''); // Works
    nlapiLogExecution(
      "AUDIT",
      "Write File BACBID",
      JSON.stringify(BACBID)
    );
    // Get the Folder ID
    var foldername = 'Egnyte';
    var filter = new nlobjSearchFilter('name', null, 'contains', foldername);

    // Get Results
    var searchResult = nlapiSearchRecord('folder', null , filter , null);
    nlapiLogExecution(
      "AUDIT",
      "Write File Result",
      JSON.stringify(searchResult)
    );
    var folderId = searchResult[0].id;
    nlapiLogExecution(
      "AUDIT",
      "Write File Folder",
      folderId
    );

    // Create the Request Object
    var postPackage = {
      action: 'UPLOAD',
      package: objRxData,
      params: {
        CustId: stCustId,
        CustName: customerName,
        bacbId: BACBID,
        folder: folderId,
        Date: nlapiDateToString(new Date(),'date'),
      }
    }
    // Resolve URL Request
    var _authorizationHeader = {
      "User-Agent-x": "SuiteScript-Call",
      "Content-Type": "application/json",
      // FIXME - We need a way to resolve the current 205848* number
      "Authorization": 'NLAuth nlauth_account="2058486",nlauth_email="ns_service@bacb.com",nlauth_signature="AStrongSystemPasswordIsGood!",nlauth_role=3'
    };
    var resolvedUrl = nlapiResolveURL(
      'RESTLET',                          // Script Type
      'customscript_manage_client_file',  // Script ID
      'customdeploy_manage_client_file',  // Script Deployment ID
      'external'                          // displayMode (Restlet URL['internal', 'external'], else true)
    );
    nlapiLogExecution(
      "AUDIT",
      "Write File pre url",
      resolvedUrl
    );
    // Call URL
    var _urlResponse = nlapiRequestURL(
      resolvedUrl, // URL - https://205848.../app/site/hosting/restlet.nl?script=102&deploy=1
      JSON.stringify(postPackage), // POST object / payload (null if GET)
      _authorizationHeader,  // Header - content and authorization elements
      'POST'
    );

    var resolvedResponse = _urlResponse.getBody();

    var responseObj = JSON.parse(resolvedResponse);
    nlapiLogExecution(
      "AUDIT",
      "Write File post url",
      JSON.stringify(responseObj)
    );
    _response.UrlResponse = responseObj;
    // Finally, if the URL response gives positive, propogate that
    if ( responseObj.response == true ){
      _response.Response = 'T';
    }
    else {
      _response.Message = 'FileMGMT URL Resolved, but task failed';
    }
  }
  catch (ex) {
    nlapiLogExecution(
      "ERROR",
      "File Upload Failed",
      _parseError(ex)
    );
    _response.Message = "FileMGMT Error: " + _parseError(ex);
  }
  nlapiLogExecution('AUDIT',"Write File", "======END======");
  return (JSON.stringify(_response));
};

function _Egnyte(objRequest) {
  nlapiLogExecution('AUDIT', "Write File", "=====START=====");
  var accessToken = 'gpnqezqsa4npqmm2dkua6hqm';
  var authHeader = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'text/plain',
  }
  nlapiLogExecution('AUDIT', "Write File", JSON.stringify(objRequest));
  var urlResponse = nlapiRequestURL(
    'https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/CustomerDocuments/420690/angularTest.pdf',
    objRequest,
    authHeader,
    'POST'
  );
  nlapiLogExecution('AUDIT', "Write File", JSON.stringify(urlResponse));
  nlapiLogExecution('AUDIT', "Write File", "======END======");
  return (JSON.stringify(urlResponse));
}

function _Read(objRequest) {
  // nlapiLogExecution('AUDIT',"READ File", "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  // nlapiLogExecution(
  //   "AUDIT",
  //   "READ File",
  //   "READ function in FileMGMT executed."
  // );

  var objDataResponse = {
    Response: "F",
    Message: []
  };

  try {
    var arrFilters = [];
    // arrFilters[0] = new nlobjSearchFilter('custrecord_doc_application', null,'is', objRxData.AppId);
    arrFilters[0] = new nlobjSearchFilter('custrecord_doc_customer', null, 'is', stCustId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_doc_orig_filename');
    arrColumns[1] = new nlobjSearchColumn('custrecord_doc_date_uploaded');
    arrColumns[2] = new nlobjSearchColumn('custrecord_doc_type');
    arrColumns[3] = new nlobjSearchColumn('custrecord_document_type_code','custrecord_doc_type');
    arrColumns[4] = new nlobjSearchColumn('custrecord_document_type_description','custrecord_doc_type');
    // arrColumns[3] = new nlobjSearchColumn('custrecord_document_type_description', 'customrecord_document_type');
    var searchResults = nlapiSearchRecord('customrecord_documents', null, arrFilters, arrColumns);

    searchResults.forEach(function(_result) {
      // nlapiLogExecution(
      //   "AUDIT",
      //   "READ File - result",
      //   _result
      // );
      objDataResponse.Message.push( {
        'Id': _result.id,
        'Name': _result.getValue('custrecord_doc_orig_filename'),
        'Date': _result.getValue('custrecord_doc_date_uploaded'),
        'Type': {'Id': _result.getValue(arrColumns[2]),
                 'Code':  _result.getValue(arrColumns[3]),
                 'Description': _result.getValue(arrColumns[4])}
      })
    })

    objDataResponse.Message;
    objDataResponse.Response = 'T';
  }
  catch (ex) {
    nlapiLogExecution(
      "ERROR",
      "READ File",
      JSON.stringify(ex));
  }
  // nlapiLogExecution('AUDIT',"READ File", "======END======");
  return (JSON.stringify(objDataResponse));
};

function _ReadDocTypes(objRequest) {
  nlapiLogExecution('AUDIT',"READ Doc Types", "=====START=====");
  var objDataResponse = {
    Response: "F",
    Message: ""
  };
  try {
    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_document_type_code');
    arrColumns[1] = new nlobjSearchColumn('custrecord_document_type_description');
    objDataResponse.Message = nlapiSearchRecord('customrecord_document_type', null, null, arrColumns);

    objDataResponse.Response = 'T';
  }
  catch (ex) {
    nlapiLogExecution(
      "ERROR",
      "READ File",
      JSON.stringify(ex));
  }
  nlapiLogExecution('AUDIT',"READ Doc Types", "======END======");
  return (JSON.stringify(objDataResponse));
};


function _WriteDocument (CustomerID, rxData) {
  // Error handling is handled outside of this function
  if (rxData == null) {
    return 'objDocument is null';
  }
  // Get the Folder ID in the most ridiculous way possible
  var filename = 'MLY_HWL';
  var foldername= 'Egnyte';
  // var filter = new nlobjSearchFilter('name', 'file', 'contains', filename);
  var filter = new nlobjSearchFilter('name', null, 'contains', foldername);
  // var filter = new nlobjSearchFilter('internalid', null, 'is', 1026);
  // var column = new nlobjSearchColumn('internalid', 'file');
  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('name');
  arrColumns[1] = new nlobjSearchColumn('parent');
  arrColumns[2] = new nlobjSearchColumn('internalid');
  arrColumns[3] = new nlobjSearchColumn('description');
  arrColumns[4] = new nlobjSearchColumn('internalid', 'file');
  arrColumns[5] = new nlobjSearchColumn('name', 'file');

  var searchResult = nlapiSearchRecord('folder', null , filter , arrColumns);

  // As it stands, we grab the only folder that is Egnyte
  var folderId = 1026;
  // if(searchResult != null){
  //    folderId = searchResult[0].getId();
  //    var fileId = searchResult[0].getValue('internalid','file');
  // }
  nlapiLogExecution(
    "AUDIT",
    "WRITE Folder Result",
    JSON.stringify(searchResult)
  );

  // For debugging, we need to ensure we actually get meaningful data from the client
  // so let's evaluate it here
  // var file = rxData.file.getContents();
  nlapiLogExecution(
    "AUDIT",
    "WRITE Client Object",
    JSON.stringify(rxData)
  );


  // var fileObj = file.create({
  //   name: rxData.Name,
  //   fileType: 'PDF',
  //   contents: rxData.Document
  // });
  // Create the new file in NetSuite specified directory
  var objFile = nlapiCreateFile(rxData.Name, 'text', rxData.Document);

  nlapiLogExecution(
    "AUDIT",
    "WRITE File Created",
    JSON.stringify(objFile)
  );
  objFile.setFolder(folderId); // BACB Documents
  var stFileId = nlapiSubmitFile(objFile);
  // With the file created, we need to create a Document record
  // specific to the user and application
  var recDoc = nlapiCreateRecord('customrecord_documents');
  recDoc.setFieldValue('custrecord_doc_customer', CustomerID);
  recDoc.setFieldValue('custrecord_doc_orig_filename', rxData.Name);
  recDoc.setFieldValue('custrecord_doc_application', rxData.AppId);
  recDoc.setFieldValue('custrecord_doc_type', "1");
  recDoc.setFieldValue('custrecord_doc_file', stFileId);
  recDoc.setFieldValue('custrecord_doc_version', "1");
  recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));
  var result = nlapiSubmitRecord(recDoc, true, true);
  // Assuming this was a success
  nlapiLogExecution(
    "AUDIT",
    "WRITE File Result",
    result);
  return {
    "Id": result,
    // "RecordID": RecordID,
    "RecordID": "FIXME - Still need to update Document Type information (FileMGMT: _Write)",
    "FileId": stFileId,
    "FolderID": folderId
  };
};

function _UpdateDocument(CustomerID, objDocument, RecordID, DocumentID) {
  objDocument.setFolder(BACB_FOLDER_ID); // BACB Documents
  var stFileId = nlapiSubmitFile(objDocument);

  var recDoc = nlapiLoadRecord('customrecord_documents',DocumentID);
  recDoc.setFieldValue('custrecord_doc_customer', CustomerID)
  recDoc.setFieldValue('custrecord_doc_type', "2"); // need to match Document Types list
  recDoc.setFieldValue('custrecord_doc_attestation', RecordID);
  recDoc.setFieldValue('custrecord_doc_file', stFileId);
  recDoc.setFieldValue('custrecord_doc_version', parseInt(recDoc.getFieldValues('custrecord_doc_version'),10) + 1);
  recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));

  return nlapiSubmitRecord(recDoc, true, true);
};
function _parseError(ErrorObj) {
  var errorText = "";

  if (ErrorObj instanceof nlobjError) {
    errorText = "UNEXPECTED ERROR: " + "\n\n";
    errorText += "Script Name: " + ErrorObj.getUserEvent() + "\n";
    errorText += "Error Code: " + ErrorObj.getCode() + "\n";
    errorText += "Error Details: " + ErrorObj.getDetails() + "\n\n";
    errorText += "Stack Trace: " + ErrorObj.getStackTrace();
  } else {
    errorText = "UNEXPECTED ERROR: " + "\n\n";
    errorText += "Error Details: " + ErrorObj.toString();
  }

  return errorText;
}
