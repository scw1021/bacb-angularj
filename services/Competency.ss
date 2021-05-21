var ACTIONS = {
    Check: _Check,
    Create: _Create,
    GetSkillList: _GetSkillList,
    Read: _Read,
    Update: _Update
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}

};


function _GetSkillList(objRequest, objResponse) {
  nlapiLogExecution('AUDIT', 'GET Competency Skill List', '=====START=====');
  var objDataResponse = getList('customlist_competency_skills');
  nlapiLogExecution('AUDIT', 'GET Competency Skill List', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

/**
 * This is a solid boilerplate fxn to get an entire list object from netsuite
 * It is automatically used as a IResponseObject so it can be immediately returned.
 * @param listName
 * @returns { Array: [] } as IResponseObject
 */
function getList(listName) {
  var objDataResponse = {
    "Array": []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalId');
  arrColumns[1] = new nlobjSearchColumn('name');

  var searchResults = nlapiSearchRecord(listName, null, null, arrColumns);

  if (searchResults !== null) {
    if (!( searchResults instanceof Array ) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].getValue(arrColumns[0]),
        Value: searchResults[stIndex].getValue(arrColumns[1])
      });
    }
  }
  return objDataResponse;
}

function getMultiSelectValues(loadedRecord, FieldID) {
  var ReturnValue = [];
  var ValueArray = loadedRecord.getFieldValue(FieldID).split("\u0005");
  var TextArray = loadedRecord.getFieldText(FieldID).split("\u0005");
  for (var stIndex in ValueArray) {
      ReturnValue.push({'Id' : ValueArray[stIndex], 'Value' : TextArray[stIndex]})
  }
  return ReturnValue;
}

function _Check(objRequest, objResponse) {
    E$.logAudit('CHECK Competency.ss', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'CHECK_CALLED', 'CHECK function in Training executed.');

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
    arrFilters[0] = new nlobjSearchFilter('custrecord_comp_assess_application',null,'is', objRxData.AppId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_comp_assess_assessor');
    arrColumns[1] = new nlobjSearchColumn('custrecord_comp_assess_date_completed');
    arrColumns[2] = new nlobjSearchColumn('custrecord_comp_assess_skills_assessed');
    arrColumns[3] = new nlobjSearchColumn('custrecord_comp_assess_document');

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
            // RBT Competency Assessment
            if (AppTypeShort === 3 && searchResults[stIndex].getValue(arrColumns[0]) === 3) {
                var startDate = new Date(searchResults[stIndex].getValue(arrColumns[1]));
                var Today = new Date();
                var duration = Math.round((Today-startDate)/(1000*60*60*24));
                if (duration < 180 && searchResults[stIndex].getValue(arrColumns[0]) !== null && searchResults[stIndex].getValue(arrColumns[2]) !== null && searchResults[stIndex].getValue(arrColumns[3]) !== null){
                    objDataResponse.complete = true;
                }
            }
        }
    }
    else if (searchResults !== null){
        var AppTypeShort = 0;
        ApplicationType = searchResults.getValue(arrColumns[0]);
        if (ApplicationType === 4 || ApplicationType === 5 || ApplicationType === 6 || ApplicationType === 7 || ApplicationType === 8 || ApplicationType === 9 || ApplicationType === 10 || ApplicationType === 13) {
            AppTypeShort = 1; // BCBA
        }
        else if (ApplicationType === 2 || ApplicationType === 3 || ApplicationType === 11) {
            AppTypeShort = 2; // BCaBA
        }
        else if (ApplicationType === 1 || ApplicationType === 12) {
            AppTypeShort = 3; // RBT
        }
        // RBT Competency Assessment
        if (AppTypeShort === 3 && searchResults.getValue(arrColumns[0]) === 3) {
            var startDate = new Date(searchResults.getValue(arrColumns[1]));
            var Today = new Date();
            var duration = Math.round((Today-startDate)/(1000*60*60*24));
            if (duration < 180 && searchResults.getValue(arrColumns[0]) !== null && searchResults.getValue(arrColumns[2]) !== null && searchResults.getValue(arrColumns[3]) !== null){
                objDataResponse.complete = true;
            }
        }
    }

    E$.logAudit('CHECK Competency', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Create(objRequest, objResponse) {
  E$.logAudit('CREATE Competency', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Competency executed.');

  var stBody = objRequest.getBody();
	if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
      nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }
  nlapiLogExecution('DEBUG', 'CREATE INPUT', JSON.stringify(objRxData));
  var relationship = objRxData.Relationship;
  var objDataResponse = {
    Response: 'T',
    Message: ''
  }

  if (stCustId) {
    var recAssessment = nlapiCreateRecord('customrecord_competency_assessment');
    recAssessment.setFieldValue('custrecord_comp_assess_application', objRxData.AppId);
    recAssessment.setFieldValue('custrecord_comp_assess_assessor', relationship.Customer.Id);
    recAssessment.setFieldValue('custrecord_comp_assess_date_completed', nlapiDateToString(new Date(relationship.EndDate),'date'));
    recAssessment.setFieldValue('custrecord_comp_assess_relationship', relationship.SupervisorRelationship);

    recAssessment.setFieldValue('custrecord_)comp_assess_document', relationship.Document);
    var SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS = '';
    for (var index in objRxData.Skills) {
      SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS += SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS != '' ? '\u0005' : '';
      SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS += objRxData.Skills[index].Id;
    }
    recAssessment.setFieldValue('custrecord_comp_assess_skills', SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS);

    try {
      objDataResponse.CompetencyId = nlapiSubmitRecord(recAssessment, true);
    }
    catch (ex) {
      throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
    }
    // if (objRxData.TrainingDocument) {
    //   try {
    //     var recCompetency = nlapiLoadRecord('customrecord_competency_assessment', objDataResponse.CompetencyId);
    //     recCompetency.setFieldValue('custrecord_comp_assess_document', _WriteDocument(stCustId, objRxData.CompetencyDocument, objDataResponse.CompetencyId));
    //     objDataResponse.CompetencyId = nlapiSubmitRecord(recCompetency, true);
    //   }
    //   catch (ex) {
    //     throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed on document write.' + ex.message);
    //   }
    // };
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Customer ID is invalid.');
  }

  E$.logAudit('CREATE Competency', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Read(objRequest, objResponse) {
  E$.logAudit('READ Competency', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Competency executed.');

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }

  var objDataResponse = {
    // Type of ICompetency
    Relationship: {
      Id: '',
      Customer: {
        Id: '',
        Name: '',
        BACBID: '',
      },
      SupervisorRelationship: '',
      EndDate: '',
      Document: '',
    },
    Skills: [],
  }

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_comp_assess_application',null,'is', objRxData.AppId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalid','custrecord_comp_assess_assessor');
  arrColumns[1] = new nlobjSearchColumn('altname','custrecord_comp_assess_assessor');
  arrColumns[2] = new nlobjSearchColumn('entityid','custrecord_comp_assess_assessor');
  arrColumns[3] = new nlobjSearchColumn('custrecord_comp_assess_relationship');
  arrColumns[4] = new nlobjSearchColumn('custrecord_comp_assess_date_completed');
  arrColumns[5] = new nlobjSearchColumn('custrecord_comp_assess_skills');
  arrColumns[6] = new nlobjSearchColumn('custrecord_comp_assess_document');
  // not sure if that will work may
  // may need to do a document search

  var searchResults = nlapiSearchRecord('customrecord_competency_assessment',null, arrFilters, arrColumns);

  if ( searchResults !== null ) {
    if ( !(searchResults instanceof Array && searchResults.length) ){
      searchResults = [searchResults];
    }
    // Like many of these elements, if multiple exist, we only want the most recent information
    for (var stIndex in searchResults) {
      objDataResponse.Relationship.Id = searchResults[stIndex].getId();
      objDataResponse.Relationship.Customer.Id = searchResults[stIndex].getValue(arrColumns[0]);
      objDataResponse.Relationship.Customer.Name = searchResults[stIndex].getValue(arrColumns[1]);
      objDataResponse.Relationship.Customer.BACBID = searchResults[stIndex].getValue(arrColumns[2]);
      objDataResponse.Relationship.SupervisorRelationship = searchResults[stIndex].getValue(arrColumns[3]);
      objDataResponse.Relationship.EndDate = searchResults[stIndex].getValue(arrColumns[4]);
      objDataResponse.Relationship.Document = searchResults[stIndex].getValue(arrColumns[6]);
    }
    // Now we get skills a slightly different way, because it's multi-select
    var competency = nlapiLoadRecord('customrecord_competency_assessment', objDataResponse.Relationship.Id);
    objDataResponse.Skills = getMultiSelectValues(competency, 'custrecord_comp_assess_skills');
  }
  nlapiLogExecution('DEBUG','READ COMPETENCY RESULT', JSON.stringify(objDataResponse));
  E$.logAudit('READ Competency', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Update(objRequest, objResponse) {
  E$.logAudit('UPDATE Competency', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in Competency executed.');

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }
  var relationship = objRxData.Relationship;
  var objDataResponse = {
    Response: 'T',
    Message: ''
  }

  if (stCustId) {
    var recAssessment = nlapiLoadRecord('customrecord_competency_assessment', objRxData.Relationship.Id);
    recAssessment.setFieldValue('custrecord_comp_assess_application', objRxData.AppId);
    recAssessment.setFieldValue('custrecord_comp_assess_assessor', relationship.Customer.Id);
    recAssessment.setFieldValue('custrecord_comp_assess_date_completed', nlapiDateToString(new Date(relationship.EndDate),'date'));
    recAssessment.setFieldValue('custrecord_comp_assess_relationship', relationship.SupervisorRelationship);

    recAssessment.setFieldValue('custrecord_)comp_assess_document', relationship.Document);
    var SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS = '';
    for (var index in objRxData.Skills) {
      SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS += SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS != '' ? '\u0005' : '';
      SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS += objRxData.Skills[index].Id;
    }
    recAssessment.setFieldValue('custrecord_comp_assess_skills', SELFDOCUMENTINGCODESEPARATEDBYOVERFLOWCHARACTERS);

    try {
      objDataResponse.CompetencyId = nlapiSubmitRecord(recAssessment, true);
    }
    catch (ex) {
      throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
    }
    // if (objRxData.CompetencyDocument) {
    //   try {
    //     var recCompetency = nlapiLoadRecord('customrecord_competency_assessment', objDataResponse.CompetencyId);
    //     recCompetency.setFieldValue('custrecord_comp_assess_document', _UpdateDocument(stCustId, objRxData.CompetencyDocument, objDataResponse.CompetencyId, objRxData.DocumentId));
    //     objDataResponse.CompetencyId = nlapiSubmitRecord(recCompetency, true);
    //   }
    //   catch (ex) {
    //     throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed on document write.' + ex.message);
    //   }
    // };
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Customer ID is invalid.');
  }

  E$.logAudit('UPDATE Training', '======END======');
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
