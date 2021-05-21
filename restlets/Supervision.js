var ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  ReadSupervisees: _ReadSupervisees,
  ReadSupervisors: _ReadSupervisors,
  ReasonsForRemoval: _ReasonsForRemoval,
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

function _Create(objRequest) {
nlapiLogExecution('AUDIT','Supervision.ss Create', '=====START=====');
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'Supervision.ss Create', 'Create function was executed.');

var objDataResponse = {
  'Response': 'F',
  'Message': 'Default Message',
  'ReturnId': ''
}

try {
  var NewSupervisionRecord = nlapiCreateRecord('customrecord_supervision');
  NewSupervisionRecord.setFieldValue('custrecord_supervision_supervisor', objRxData.Supervisor.Id);
  NewSupervisionRecord.setFieldValue('custrecord_supervision_supervisee', objRxData.Supervisee.Id);
  NewSupervisionRecord.setFieldValue('custrecord_supervision_start_date', objRxData.StartDate);
  // There is no reason upon creation, this field is update only
  // NewSupervisionRecord.setFieldValue('custrecord_supervision_end_Date', objRxData.EndDate);
  // NewSupervisionRecord.setFieldValue('custrecord_supervision_reason', objRxData.Reason.Id);
  NewSupervisionRecord.setFieldValue('custrecord_supervision_status', '47'); // Entity Status 47 (Active)
  objDataResponse.ReturnId = nlapiSubmitRecord(NewSupervisionRecord, true);
  nlapiLogExecution('AUDIT', 'Supervision.ss Create', 'ReturnId: ' + objDataResponse.ReturnId);
}
catch(ex) {
  objDataResponse.Message = 'The attempt to create a supervision record failed: ' + ex.message;
  nlapiLogExecution('ERROR', 'Supervision.ss Create', 'The attempt to create a supervision record failed: ' + ex.message);
}

if (objDataResponse.ReturnId) {
  objDataResponse.Response = 'T';
  objDataResponse.Message = 'Supervision record created successfully.'
}
else {
  objDataResponse.Message = 'The attempt to create a supervision record failed.';
}

nlapiLogExecution('AUDIT','Supervision.ss Create', '======END======');
return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','Supervision.ss Delete', '=====START=====');
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Supervision.ss Delete', 'Delete function was executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': 'Default Message'
  }

  // Not defined because a supervision record should never be deleted, we just set the end date (even on records created on accedent or mistyped)

  nlapiLogExecution('AUDIT','Supervision.ss Delete', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','Supervision.ss Read', '=====START=====');
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Supervision.ss Read', 'Read function was executed.');
  var objDataResponse = {
      'Array': []
  }

  // Not defined until we need a solo read function

  nlapiLogExecution('AUDIT','Supervision.ss Read', '======END======');
    return (JSON.stringify(objDataResponse));
}

function _ReadSupervisees(objRequest) {
  nlapiLogExecution('AUDIT','Supervision.ss ReadSupervisees', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Supervision.ss ReadSupervisees', 'ReadSuperviseesOld function was executed.');
  var objDataResponse = {
      'Array': []
  }

  // try {
      var arrFilter = new Array();
      // To get a list of supervisee you must find supervision records where the customer is the supervisor
      arrFilter[0] = new nlobjSearchFilter('custrecord_es_cert_certificant', 'custrecord_supervision_supervisor', 'is', stCustId);

      var arrColumns = new Array();
      arrColumns[0] = new nlobjSearchColumn('custrecord_supervision_supervisor');
      arrColumns[1] = new nlobjSearchColumn('custrecord_supervision_supervisee');
      arrColumns[2] = new nlobjSearchColumn('custrecord_supervision_start_date');
      arrColumns[3] = new nlobjSearchColumn('custrecord_supervision_status');
      arrColumns[4] = new nlobjSearchColumn('custrecord_entity_status_recordtype_name', 'custrecord_supervision_status');
      arrColumns[5] = new nlobjSearchColumn('custrecord_entity_status_int_name', 'custrecord_supervision_status');
      arrColumns[6] = new nlobjSearchColumn('custrecord_entity_status_ext_name', 'custrecord_supervision_status');
      arrColumns[7] = new nlobjSearchColumn('custrecord_supervision_end_date');
      arrColumns[8] = new nlobjSearchColumn('custrecord_supervision_reason');

      var SuperviseeSearchResults = nlapiSearchRecord('customrecord_supervision', null, arrFilter, arrColumns);
  // }
  // catch (ex) {
      // nlapiLogExecution('ERROR', 'Supervision.ss ReadSupervisors', 'Search for supervision records related to the current user failed. ' + ex.message);
  // }
  if (!(SuperviseeSearchResults instanceof Array)) {
    SuperviseeSearchResults  = [SuperviseeSearchResults ];
  }
  else if (SuperviseeSearchResults.length) {
    for (var SuperviseeIndex in SuperviseeSearchResults) {
      objDataResponse.Array.push({
        'Id': SuperviseeSearchResults[SuperviseeIndex].getId(),
        'Supervisee': _ReadCertifications(SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[1])),
        'Supervisor': _ReadCertifications(SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[0])),
        'StartDate': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[2]),
        'Status':  {
          'Id': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[3]),
          'RecordTypeName': {
            'Id': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[4]),
            'Value': SuperviseeSearchResults[SuperviseeIndex].getText(arrColumns[4]),
          },
          'InternalName': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[5]),
          'ExternalName': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[6])
        },
        'EndDate': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[7]),
        'Reason': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[8]),
      })
    }
  }
  nlapiLogExecution('AUDIT','Supervision.ss ReadSupervisees', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _ReadSupervisors(objRequest) {
  nlapiLogExecution('AUDIT','Supervision.ss ReadSupervisors', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Supervision.ss ReadSupervisors', 'ReadSupervisors function was executed.');

  var objDataResponse = {
      'Array': []
  }

  try {
      var arrFilter = new Array();
      // To get a list of supervisors you must find supervision records where the customer is the supervisee
      arrFilter[0] = new nlobjSearchFilter('custrecord_es_cert_certificant', 'custrecord_supervision_supervisee', 'is', stCustId);

      var arrColumns = new Array();
      arrColumns[0] = new nlobjSearchColumn('custrecord_supervision_supervisor');
      arrColumns[1] = new nlobjSearchColumn('custrecord_supervision_supervisee');
      arrColumns[2] = new nlobjSearchColumn('custrecord_supervision_start_date');
      arrColumns[3] = new nlobjSearchColumn('custrecord_supervision_status');
      arrColumns[4] = new nlobjSearchColumn('custrecord_entity_status_recordtype_name', 'custrecord_supervision_status');
      arrColumns[5] = new nlobjSearchColumn('custrecord_entity_status_int_name', 'custrecord_supervision_status');
      arrColumns[6] = new nlobjSearchColumn('custrecord_entity_status_ext_name', 'custrecord_supervision_status');
      arrColumns[7] = new nlobjSearchColumn('custrecord_supervision_end_date');
      arrColumns[8] = new nlobjSearchColumn('custrecord_supervision_reason');

      var SuperviseeSearchResults = nlapiSearchRecord('customrecord_supervision', null, arrFilter, arrColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Supervision.ss ReadSupervisors', 'Search for supervision records related to the current user failed. ' + ex.message);
  }
  if (!(SuperviseeSearchResults instanceof Array)) {
      SuperviseeSearchResults  = [SuperviseeSearchResults ];
  }
  else if (SuperviseeSearchResults.length) {
      for (var SuperviseeIndex in SuperviseeSearchResults) {
          objDataResponse.Array.push({
              'Id': SuperviseeSearchResults[SuperviseeIndex].getId(),
              'Supervisee': _ReadCertifications(SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[1])),
              'Supervisor': _ReadCertifications(SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[0])),
              'StartDate': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[2]),
              'Status':  {
                  'Id': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[3]),
                  'RecordTypeName': {
                      'Id': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[4]),
                      'Value': SuperviseeSearchResults[SuperviseeIndex].getText(arrColumns[4]),
                  },
                  'InternalName': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[5]),
                  'ExternalName': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[6])
              },
              'EndDate': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[7]),
              'Reason': SuperviseeSearchResults[SuperviseeIndex].getValue(arrColumns[8])
          })
      }
  }

  nlapiLogExecution('AUDIT','Supervision.ss ReadSupervisors', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _ReadCertifications(CertificationId) {
var ReturnCertificationObj = {};
try {
  var CertificationRecord = nlapiLoadRecord('customrecord_es_certification', CertificationId);
  var CustomerRecord = nlapiLoadRecord('customer', CertificationRecord.getFieldValue('custrecord_es_cert_certificant'));
  nlapiLogExecution('DEBUG', 'AUDIT', JSON.stringify(CertificationRecord.getFieldValue('custrecord_es_cert_certification_type')))
  var CertificationTypeRecord = nlapiLoadRecord('customrecord_cert_type', CertificationRecord.getFieldValue('custrecord_es_cert_certification_type'));
}
catch(ex) {
  nlapiLogExecution('ERROR', 'Supervision.ss ReadCertifications', 'Unable to load record.');
}
nlapiLogExecution('AUDIT', 'SUP READ CUST', JSON.stringify(CustomerRecord));
nlapiLogExecution('AUDIT', 'SUP READ CERT', JSON.stringify(CertificationRecord));
nlapiLogExecution('AUDIT', 'SUP READ TYPE', JSON.stringify(CertificationTypeRecord));
ReturnCertificationObj.Id = CertificationRecord.getId();
ReturnCertificationObj.Number = CertificationRecord.getFieldValue('custrecord_es_cert_certificate_number');
ReturnCertificationObj.Customer = {
  'Id': CustomerRecord.getId(),
  'Name': CustomerRecord.getFieldValue('altname'),
  'BACBID': CustomerRecord.getFieldValue('entityid')
};
ReturnCertificationObj.Type = {
  'Id': CertificationTypeRecord.getId(),
  'Name': CertificationTypeRecord.getFieldValue('custrecord_cert_type_name'),
  'Abbrev': CertificationTypeRecord.getFieldValue('custrecord_cert_type_abbrev')
}
ReturnCertificationObj.Cycles = [];
try {
  var arrCycleFilters = new Array();
  arrCycleFilters[0] = new nlobjSearchFilter('custrecord_cert_cyc_certification', null, 'is', CertificationRecord.getId());
  var arrCycleColumns = new Array();
  arrCycleColumns[0] = new nlobjSearchColumn('custrecord_cert_cyc_isactive');
  arrCycleColumns[1] = new nlobjSearchColumn('custrecord_cert_cyc_start_date');
  arrCycleColumns[2] = new nlobjSearchColumn('custrecord_cert_cyc_end_date');
  arrCycleColumns[3] = new nlobjSearchColumn('custrecord_cert_cycle_doctoral');

  var CertificationCycleSearchResults = nlapiSearchRecord('customrecord_certification_cycle', null, arrCycleFilters, arrCycleColumns);
  if ( CertificationCycleSearchResults !== null ) {
    if (!(CertificationCycleSearchResults instanceof Array)) {
      CertificationCycleSearchResults = [CertificationCycleSearchResults];
    }
    for (var stCertificationCycleIndex in CertificationCycleSearchResults) {
      nlapiLogExecution('DEBUG', 'SEARCH', JSON.stringify(CertificationCycleSearchResults[stCertificationCycleIndex]));
      ReturnCertificationObj.Cycles.push({
        'Id': CertificationCycleSearchResults[stCertificationCycleIndex].getId(),
        'Status': CertificationCycleSearchResults[stCertificationCycleIndex].getValue(arrCycleColumns[0]) === 'Yes' ? 'Active' : 'Inactive' ,
        'RenewalDate': CertificationCycleSearchResults[stCertificationCycleIndex].getValue(arrCycleColumns[2]),
        'AbbrevMod': CertificationCycleSearchResults[stCertificationCycleIndex].getValue(arrCycleColumns[3]) === 'T' ? '-D' : '',
        'NameMod': CertificationCycleSearchResults[stCertificationCycleIndex].getValue(arrCycleColumns[3]) === 'T' ? ' Doctoral' : ''
      })
    }
  }
  else {
    nlapiLogExecution('ERROR', 'Supervision.ss ReadCertifications', 'No cert cycles available for ' + CustomerRecord.getFieldValue('altname'));
  }
}
catch(ex) {
  nlapiLogExecution('ERROR', 'Supervision.ss ReadCertifications', JSON.stringify(ex));
}
return ReturnCertificationObj;
}

function _Update(objRequest) {
  nlapiLogExecution('AUDIT','Supervision.ss Update', '=====START=====');
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Supervision.ss Update', 'Update function was executed.');

  nlapiLogExecution('DEBUG', 'UPDATE', JSON.stringify(objRxData));

  var objDataResponse = {
      'Response': 'F',
      'Message': 'Default Message'
  }

  try {
      var NewSupervisionRecord = nlapiLoadRecord('customrecord_supervision', objRxData.Id);
      // None of this should ever get altered unless I'm wildly mistaken
      // NewSupervisionRecord.setFieldValue('custrecord_supervision_supervisor', objRxData.Supervisor.Id);
      // NewSupervisionRecord.setFieldValue('custrecord_supervision_supervisee', objRxData.Supervisee.Id);
      // NewSupervisionRecord.setFieldValue('custrecord_supervision_type', objRxData.Type);
      // NewSupervisionRecord.setFieldValue('custrecord_supervision_start_date', objRxData.StartDate);
      NewSupervisionRecord.setFieldValue('custrecord_supervision_end_Date', objRxData.EndDate);
      NewSupervisionRecord.setFieldValue('custrecord_supervision_reason', objRxData.Reason);
      NewSupervisionRecord.setFieldValue('custrecord_supervision_status', objRxData.EndDate ? '48' : '47'); // Entity Status 47 (Active) 48 (Inactive)
      objDataResponse.ReturnId = nlapiSubmitRecord(NewSupervisionRecord, true);
  }
  catch(ex) {
      objDataResponse.Message = 'The attempt to update a supervision record failed: ' + ex.message;
      nlapiLogExecution('ERROR', 'Supervision.ss Update', 'The attempt to update a supervision record failed: ' + ex.message);
  }

  if (objDataResponse.ReturnId) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Supervision record updated successfully.'
  }
  else {
      objDataResponse.Message = 'The attempt to update a supervision record failed.';
  }

  nlapiLogExecution('AUDIT','Supervision.ss Update', '======END======');
    return (JSON.stringify(objDataResponse));
}

// Copy pasta from Utility.ss courtesty of RVI
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

function _ReasonsForRemoval(objRequest) {
  return (JSON.stringify(getList('customlist_suprvsn_remove_sup_reason')));
}
