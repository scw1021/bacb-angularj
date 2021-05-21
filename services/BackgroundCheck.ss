var ACTIONS = {
    Check: _Check,
    Create: _Create,
    Read: _Read,
    Update: _Update
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}

};

// #copypasta
function _Check(objRequest, objResponse) {
    E$.logAudit('CHECK BackgroundCheck.ss', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'CHECK_CALLED', 'CHECK function in BackgroundCheck executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
    }

    var objDataResponse = {
		hasError: false,
		message: '',
        complete: false
    }

    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_background_application',null,'is', objRxData.AppId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_background_attesting_cert');
    arrColumns[1] = new nlobjSearchColumn('custrecord_background_date_signed');

    var searchResults = nlapiSearchRecord('customrecord_training',null, arrFilters, arrColumns);
    var ApplicationType = 0;
    if (searchResults instanceof Array && searchResults.length) {
        var AppTypeShort = 0;
        ApplicationType = searchResults[0].getValue(arrColumns[0])
        if (ApplicationType === 4 || ApplicationType === 5 || ApplicationType === 6 || ApplicationType === 7 || ApplicationType === 8 || ApplicationType === 9 || ApplicationType === 10 || ApplicationType === 13) {
            AppTypeShort = 1; // BCBA
        }
        else if (ApplicationType === 2 || ApplicationType === 3 || ApplicationType === 11) {
            AppTypeShort = 2; // BCaBA
        }
        else if (ApplicationType === 1 || ApplicationType === 12) {
            AppTypeShort = 3; // RBT
        }
        for (var stIndex in searchResults) {
            // RBT Background Check
            if (AppTypeShort === 3 && searchResults[stIndex].getValue(arrColumns[0]) !== null) {
                var DateSigned = new Date(searchResults[stIndex].getValue(arrColumns[1]));
                var Today = new Date();
                var duration = Math.round((Today-DateSigned)/(1000*60*60*24));
                if (duration > 0 && duration < 180){
                    objDataResponse.complete = true;
                }
            }
        }
    }
    else if (searchResults !== null){
        var AppTypeShort = 0;
        ApplicationType = searchResults.getValue(arrColumns[0])
        if (ApplicationType === 4 || ApplicationType === 5 || ApplicationType === 6 || ApplicationType === 7 || ApplicationType === 8 || ApplicationType === 9 || ApplicationType === 10 || ApplicationType === 13) {
            AppTypeShort = 1; // BCBA
        }
        else if (ApplicationType === 2 || ApplicationType === 3 || ApplicationType === 11) {
            AppTypeShort = 2; // BCaBA
        }
        else if (ApplicationType === 1 || ApplicationType === 12) {
            AppTypeShort = 3; // RBT
        }
        // RBT Background Check
        if (AppTypeShort === 3 && searchResults.getValue(arrColumns[0]) !== null) {
            var DateSigned = new Date(searchResults.getValue(arrColumns[1]));
            var Today = new Date();
            var duration = Math.round((Today-DateSigned)/(1000*60*60*24));
            if (duration > 0 && duration < 180){
                objDataResponse.complete = true;
            }
        }
    }

    E$.logAudit('CHECK BackgroundCheck', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Create(objRequest, objResponse) {
  E$.logAudit('CREATE BackgroundCheck', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in BackgroundCheck executed.');

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }
  nlapiLogExecution('DEBUG', 'CREATE BackgroundCheck', JSON.stringify(objRxData));
  var relationship = objRxData.Relationship;
  var objDataResponse = {
    Response: 'T',
    Message: 'BackgroundCheck Updated',
    BackgroundId: ''
  }

  if (objRxData.AppId) {
    var recBackground = nlapiCreateRecord('customrecord_background');
    recBackground.setFieldValue('custrecord_background_application', objRxData.AppId);
    recBackground.setFieldValue('custrecord_background_relationship', relationship.SupervisorRelationship);
    recBackground.setFieldValue('custrecord_background_date_signed', nlapiDateToString(new Date(relationship.EndDate),'date'));
    recBackground.setFieldValue('custrecord_background_document', relationship.Document);
    recBackground.setFieldValue('custrecord_background_attesting_cert', relationship.Customer.Id);
    try {
      objDataResponse.BackgroundId = nlapiSubmitRecord(recBackground, true);
    }
    catch (ex) {
      throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
    }
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  E$.logAudit('CREATE BackgroundCheck', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Read(objRequest, objResponse) {
  E$.logAudit('READ Training', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'READ BACKGROUNDCHECK', 'READ function in Training executed.');

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }

  var objDataResponse = {
    ID: '',
    Customer: { 'Id': '', 'Name': '', 'BACBID': ''},
    EndDate: '',
    SupervisorRelationship: '',
  }

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_background_application',null,'is', objRxData.AppId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_background_relationship');
  arrColumns[1] = new nlobjSearchColumn('custrecord_background_date_signed');
  arrColumns[2] = new nlobjSearchColumn('custrecord_background_document');
  arrColumns[3] = new nlobjSearchColumn('internalid', 'custrecord_background_attesting_cert');
  arrColumns[4] = new nlobjSearchColumn('altname', 'custrecord_background_attesting_cert');
  arrColumns[5] = new nlobjSearchColumn('entityid', 'custrecord_background_attesting_cert');

  var searchResults = nlapiSearchRecord('customrecord_background',null, arrFilters, arrColumns);
  nlapiLogExecution('DEBUG', 'READ BG RESULT', JSON.stringify(searchResults));
  if ( searchResults !== null ) {
    if (!(searchResults instanceof Array && searchResults.length)) {
      searchResults = [searchResults]
    }
    for (var stIndex in searchResults) {
      objDataResponse.Id = searchResults[stIndex].getId();
      objDataResponse.SupervisorRelationship = searchResults[stIndex].getValue(arrColumns[0]);
      objDataResponse.EndDate = searchResults[stIndex].getValue(arrColumns[1]);
      objDataResponse.Customer.Id = searchResults[stIndex].getValue(arrColumns[3]);
      objDataResponse.Customer.Name = searchResults[stIndex].getValue(arrColumns[4]);
      objDataResponse.Customer.BACBID = searchResults[stIndex].getValue(arrColumns[5]);
    }
  }

  E$.logAudit('READ BackgroundCheck', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Update(objRequest, objResponse) {
  E$.logAudit('UPDATE BackgroundCheck', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in BackgroundCheck executed.');

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }


  nlapiLogExecution('DEBUG', 'UPDATE BackgroundCheck', JSON.stringify(objRxData));
  var relationship = objRxData.Relationship;
  var objDataResponse = {
    Response: 'T',
    Message: 'BackgroundCheck Updated',
    BackgroundId: ''
  }

  if (stCustId) {
    var recBackground = nlapiLoadRecord('customrecord_background', relationship.Id);
    recBackground.setFieldValue('custrecord_background_application', objRxData.AppId);
    recBackground.setFieldValue('custrecord_background_attesting_cert', relationship.Customer.Id);
    recBackground.setFieldValue('custrecord_background_relationship', relationship.SupervisorRelationship);
    recBackground.setFieldValue('custrecord_background_date_signed', nlapiDateToString(new Date(relationship.EndDate),'date'));

    try {
      objDataResponse.BackgroundId = nlapiSubmitRecord(recBackground, true);
    }
    catch (ex) {
      throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed on update.' + ex.message);
    }
    // if (objRxData.BackgroundDocument) {
    //   try {
    //     var recBackground = nlapiLoadRecord('customrecord_background', objRxData.BackgroundId);
    //     var stDocId = _UpdateDocument(stCustId, objRxData.BackgroundDocument, objDataResponse.BackgroundId, objRxData.DocumentId);
    //     recBackground.setFieldValue('custrecord_training_doc', stDocId);
    //     objDataResponse.BackgroundId = nlapiSubmitRecord(recBackground, true);
    //     objDataResponse.DocumentId = stDocId;
    //   }
    //   catch (ex) {
    //     throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed for document.' + ex.message);
    //   }
    // };
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Customer ID is invalid.');
  }

  E$.logAudit('UPDATE BackgroundCheck', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _WriteDocument(CustomerID, objDocument, RecordID){
    objDocument.setFolder(84146); // BACB Documents
    var stFileId = nlapiSubmitFile(objFile);

    var recDoc = nlapiCreateRecord('customrecord_documents');
    recDoc.setFieldValue('custrecord_doc_customer', CustomerID)
    recDoc.setFieldValue('custrecord_doc_type', "2"); // need to match Document Types list
    recDoc.setFieldValue('custrecord_doc_attestation', RecordID);
    recDoc.setFieldValue('custrecord_doc_file', stFileId);
    recDoc.setFieldValue('custrecord_doc_version', "1");
    recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));

    return nlapiSubmitRecord(recDoc, true, true);
};

function _UpdateDocument(CustomerID, objDocument, RecordID, DocumentID) {
    objDocument.setFolder(84146); // BACB Documents
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
