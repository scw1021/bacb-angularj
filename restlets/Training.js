var ACTIONS = {
  Check: _Check,
  Create: _Create,
  Get: _ReadByAppId,
  Read: _Read,
  Update: _Update
};

function service(objRequest) {
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest));

	var stParam = objRequest['param'];
	if (ACTIONS[stParam]) {
		return ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};

function _Check(objRequest) {
  nlapiLogExecution('AUDIT','CHECK Training.ss', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  nlapiLogExecution('AUDIT', 'CHECK_CALLED', 'CHECK function in Training executed.');

  var objDataResponse = {
  hasError: false,
  message: '',
      complete: false
  }

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_training_trainee',null,'is', stCustId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_training_type');
  arrColumns[1] = new nlobjSearchColumn('custrecord_training_start_date');
  arrColumns[2] = new nlobjSearchColumn('custrecord_training_completion_date');

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
          // RBT 40 hour training
          if (AppTypeShort === 3 && searchResults[stIndex].getValue(arrColumns[0]) === 3) {
              var startDate = new Date(searchResults[stIndex].getValue(arrColumns[1]));
              var endDate = new Date(searchResults[stIndex].getValue(arrColumns[2]));
              var duration = Math.round((endDate-startDate)/(1000*60*60*24));
              if (duration > 5 && duration < 180){
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
      // RBT 40 hour training
      if (AppTypeShort === 3 && searchResults.getValue(arrColumns[0]) === 3) {
          var startDate = new Date(searchResults.getValue(arrColumns[1]));
          var endDate = new Date(searchResults.getValue(arrColumns[2]));
          var duration = Math.round((endDate-startDate)/(1000*60*60*24));
          if (duration > 5 && duration < 180){
              objDataResponse.complete = true;
          }
      }
  }

  nlapiLogExecution('AUDIT','CHECK Training', '======END======');
  return (JSON.stringify(objDataResponse));
};

// Actually Used ( 11/2019 )
function _Create(objRequest) {
nlapiLogExecution('AUDIT','CREATE Training', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Training executed.');

var relationship = objRxData.Training;
nlapiLogExecution('DEBUG', 'CREATE BackgroundCheck', JSON.stringify(objRxData));
var objDataResponse = {
  Response: 'T',
  Message: 'Training Created',
  TrainingId: ''
}

if (stCustId) {
  var recNewTraining = nlapiCreateRecord('customrecord_training');

  recNewTraining.setFieldValue('custrecord_training_trainee', stCustId);
  recNewTraining.setFieldValue('custrecord_training_type', objRxData.Type);
  recNewTraining.setFieldValue('custrecord_training_instructor', relationship.Customer.Id);
  recNewTraining.setFieldValue('custrecord_training_agency', relationship.Agency);
  recNewTraining.setFieldValue('custrecord_training_start_date', nlapiDateToString(new Date(relationship.StartDate),'date'));
  recNewTraining.setFieldValue('custrecord_training_completion_date', nlapiDateToString(new Date(relationship.EndDate),'date'));

  try {
    objDataResponse.TrainingId = nlapiSubmitRecord(recNewTraining, true);
  }
  catch (ex) {
    throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
  }
}
else {
  throw nlapiCreateError('INVALID_DATA', 'Customer ID is invalid.');
}

nlapiLogExecution('AUDIT','CREATE Training', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _ReadByAppId(objRequest) {
nlapiLogExecution('AUDIT','READ Training', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Training executed.');


var objDataResponse = {
    Id: '',
    Customer: {Id: '', Name: '', BACBID: ''},
    Agency: '',
    StartDate: '',
    EndDate: '',
    DocumentId: '',
    DocUploadDate: ''
}

nlapiLogExecution('AUDIT', 'CUSTOMER_ID', 'CustomerId = ' + stCustId);
recCustomer = nlapiLoadRecord('Customer',stCustId);


var arrFilters = [];
arrFilters[0] = new nlobjSearchFilter('custrecord_training_trainee',null,'is', stCustId);
arrFilters[1] = new nlobjSearchFilter('custrecord_training_type',null,'is', objRxData.Type);

var arrColumns = new Array();
arrColumns[0] = new nlobjSearchColumn('custrecord_training_instructor');
arrColumns[1] = new nlobjSearchColumn('altname','custrecord_training_instructor');
arrColumns[0] = new nlobjSearchColumn('entityid');
arrColumns[2] = new nlobjSearchColumn('custrecord_training_agency');
arrColumns[3] = new nlobjSearchColumn('custrecord_training_start_date');
arrColumns[4] = new nlobjSearchColumn('custrecord_training_completion_date');
arrColumns[5] = new nlobjSearchColumn('custrecord_training_doc');
arrColumns[6] = new nlobjSearchColumn('custrecord_doc_date_uploaded','custrecord_training_doc');

var searchResults = nlapiSearchRecord('customrecord_training',null, arrFilters, arrColumns);

if (searchResults !== null) {
  if (!(searchResults instanceof Array && searchResults.length)) {
    searchResults = [searchResults]
  }
  for (var stIndex in searchResults) {
    objDataResponse.Id = searchResults[stIndex].getId();
    objDataResponse.Customer.Id = searchResults[stIndex].getValue(arrColumns[0]);
    objDataResponse.Customer.Name = searchResults[stIndex].getValue(arrColumns[1]);
    objDataResponse.Customer.BACBID = searchResults[stIndex].getValue(arrColumns[2]);
    objDataResponse.Agency = searchResults[stIndex].getValue(arrColumns[3]);
    objDataResponse.StartDate = searchResults[stIndex].getValue(arrColumns[4]);
    objDataResponse.EndDate = searchResults[stIndex].getValue(arrColumns[5]);
    objDataResponse.DocumentId = searchResults[stIndex].getValue(arrColumns[6]);
    objDataResponse.DocUploadDate = searchResults[stIndex].getValue(arrColumns[7]);
  }
}
else {
  nlapiLogExecution('AUDIT','READ Training', 'No Search Results Found');
}
nlapiLogExecution('AUDIT','READ Training', '======END======');
  return (JSON.stringify(objDataResponse));
};

// Actually Used ( 11/2019 )
function _Read(objRequest) {
  nlapiLogExecution('AUDIT', 'READ Training', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Training executed.');


  var objDataResponse = {
    Id: '',
    Customer: {'Id': '', 'Name': '', 'BACBID': ''},
    Agency: '',
    StartDate: '',
    EndDate: '',
    DocumentId: '',
    DocUploadDate: ''
  }

  nlapiLogExecution('AUDIT', 'CUSTOMER_ID', 'CustomerId = ' + stCustId);
  recCustomer = nlapiLoadRecord('Customer', stCustId);


  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_training_trainee',null,'is', stCustId);
  arrFilters[1] = new nlobjSearchFilter('custrecord_training_type',null,'is', objRxData.Type);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalid', 'custrecord_training_instructor');
  arrColumns[1] = new nlobjSearchColumn('altname','custrecord_training_instructor');
  arrColumns[2] = new nlobjSearchColumn('entityid', 'custrecord_training_instructor');
  arrColumns[3] = new nlobjSearchColumn('custrecord_training_agency');
  arrColumns[4] = new nlobjSearchColumn('custrecord_training_start_date');
  arrColumns[5] = new nlobjSearchColumn('custrecord_training_completion_date');
  arrColumns[6] = new nlobjSearchColumn('custrecord_training_doc');
  arrColumns[7] = new nlobjSearchColumn('custrecord_doc_date_uploaded','custrecord_training_doc');
  arrColumns[8] = new nlobjSearchColumn('internalid');

  var searchResults = nlapiSearchRecord('customrecord_training',null, arrFilters, arrColumns);
  nlapiLogExecution('DEBUG', 'READ TRAINING RESULT', JSON.stringify(searchResults));
  if ( searchResults !== null ) {
    if ( !(searchResults instanceof Array && searchResults.length) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      // Oh, so we just take the last possible training apparently. That's fine.
      objDataResponse.Id = searchResults[stIndex].getId();
      objDataResponse.Customer.Id = searchResults[stIndex].getValue(arrColumns[0]);
      objDataResponse.Customer.Name = searchResults[stIndex].getValue(arrColumns[1]);
      objDataResponse.Customer.BACBID = searchResults[stIndex].getValue(arrColumns[2]);
      objDataResponse.Agency = searchResults[stIndex].getValue(arrColumns[3]);
      objDataResponse.StartDate = searchResults[stIndex].getValue(arrColumns[4]);
      objDataResponse.EndDate = searchResults[stIndex].getValue(arrColumns[5]);
      objDataResponse.DocumentId = searchResults[stIndex].getValue(arrColumns[6]);
      objDataResponse.DocUploadDate = searchResults[stIndex].getValue(arrColumns[7]);
    }
  }
  else {
    nlapiLogExecution('DEBUG', 'READ TRAINING', 'No Search Results Found');
  }

  nlapiLogExecution('AUDIT', 'READ Training', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
};

function _ReadAll(objRequest) {
  nlapiLogExecution('AUDIT','READALL Training', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Training executed.');

  var objDataResponse = {
      'Array' : []
  }
  // Id: '',
  // Instructor: {'Id': '', 'Name': '', 'BACBID': ''},
  // Agency: '',
  // StartDate: '',
  // EndDate: '',
  // DocumentId: '',
  // DocUploadDate: ''

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_training_type',null,'is', objRxData.Type);
  if (objRxData.StartDate) {
      arrFilters[1] = new nlobjSearchFilter('custrecord_training_start_date',null,'onOrBefore', objRxData.StartDate);
  }


  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_training_instructor');
  arrColumns[1] = new nlobjSearchColumn('altname','custrecord_training_instructor');
  arrColumns[0] = new nlobjSearchColumn('entityid');
  arrColumns[2] = new nlobjSearchColumn('custrecord_training_agency');
  arrColumns[3] = new nlobjSearchColumn('custrecord_training_start_date');
  arrColumns[4] = new nlobjSearchColumn('custrecord_training_completion_date');
  arrColumns[5] = new nlobjSearchColumn('custrecord_training_doc');
  arrColumns[6] = new nlobjSearchColumn('custrecord_doc_date_uploaded','custrecord_training_doc');

  var searchResults = nlapiSearchRecord('customrecord_training',null, arrFilters, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.push({
              'Id': searchResults[stIndex].getId(),
              'Instructor': {'Id': searchResults[stIndex].getValue(arrColumns[0]),
                             'Name': searchResults[stIndex].getValue(arrColumns[1]),
                             'BACBID': searchResults[stIndex].getValue(arrColumns[2])},
              'Agency': searchResults[stIndex].getValue(arrColumns[3]),
              'StartDate': searchResults[stIndex].getValue(arrColumns[4]),
              'EndDate': searchResults[stIndex].getValue(arrColumns[5]),
              'DocumentId': searchResults[stIndex].getValue(arrColumns[6]),
              'DocUploadDate': searchResults[stIndex].getValue(arrColumns[7])});
      }
  }
  else if (searchResults !== null){
      objDataResponse.push({
          'Id': searchResults.getId(),
          'Instructor': {'Id': searchResults.getValue(arrColumns[0]),
                         'Name': searchResults.getValue(arrColumns[1]),
                         'BACBID': searchResults.getValue(arrColumns[2])},
          'Agency': searchResults.getValue(arrColumns[3]),
          'StartDate': searchResults.getValue(arrColumns[4]),
          'EndDate': searchResults.getValue(arrColumns[5]),
          'DocumentId': searchResults.getValue(arrColumns[6]),
          'DocUploadDate': searchResults.getValue(arrColumns[7])});
  }

  nlapiLogExecution('AUDIT','READALL Training', '======END======');
  return (JSON.stringify(objDataResponse));
}

// Actually Used ( 11/2019 )
function _Update(objRequest) {
// objRequest styling: {Training: IResponsibleRelationship, Type: '40 Hour RBT Training'}
nlapiLogExecution('AUDIT','UPDATE Training', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest['data'];
nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in Training executed.');

var relationship = objRxData.Training;
nlapiLogExecution('DEBUG', 'UPDATE TRAINING', JSON.stringify(objRxData));
var objDataResponse = {
  Response: 'T',
  Message: 'Training Updated',
  TrainingId: ''
}
if (stCustId) {
  var recTraining = nlapiLoadRecord('customrecord_training', relationship.Id);
  recTraining.setFieldValue('custrecord_training_trainee', stCustId);
  recTraining.setFieldValue('custrecord_training_type', objRxData.Type);
  recTraining.setFieldValue('custrecord_training_instructor', relationship.Customer.Id);
  recTraining.setFieldValue('custrecord_training_agency', relationship.Agency);
  recTraining.setFieldValue('custrecord_training_start_date', nlapiDateToString(new Date(relationship.StartDate),'date'));
  recTraining.setFieldValue('custrecord_training_completion_date', nlapiDateToString(new Date(relationship.EndDate),'date'));
  try {
    objDataResponse.TrainingId = nlapiSubmitRecord(recTraining, true);
  }
  catch (ex) {
    throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
  }
}
else {
  throw nlapiCreateError('INVALID_DATA', 'Customer ID is invalid.');
}


nlapiLogExecution('AUDIT','UPDATE Training', '======END======');
return (JSON.stringify(objDataResponse));
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

// function _UpdateDocument(CustomerID, objDocument, RecordID, DocumentID) {
//     objDocument.setFolder(84146); // BACB Documents
//     var stFileId = nlapiSubmitFile(objDocument);

//     var recDoc = nlapiLoadRecord('customrecord_documents',DocumentID);
//     recDoc.setFieldValue('custrecord_doc_customer', CustomerID)
//     recDoc.setFieldValue('custrecord_doc_type', "2"); // need to match Document Types list
//     recDoc.setFieldValue('custrecord_doc_attestation', RecordID);
//     recDoc.setFieldValue('custrecord_doc_file', stFileId);
//     recDoc.setFieldValue('custrecord_doc_version', parseInt(recDoc.getFieldValues('custrecord_doc_version'),10) + 1);
//     recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));

//     return nlapiSubmitRecord(recDoc, true, true);
// };
