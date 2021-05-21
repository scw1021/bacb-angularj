var ACTIONS = {
  Read: _Read,
  ReadAll: _ReadAll,
  CreateTestCert: _CreateTestCert,
  Check: _Check
};

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

// This is used by a router guard to prevent unauth access to Certificaiton Elements via direct URL modification
function _Check(objRequest) {
  var objDataResponse = {
    Response: 'F',
    Message: '',
  }
  try {
    var stCustId = objRequest['CustomerId'];
    objDataResponse.Message = 'Customer '+ stCustId +' checked for certifications';
    var arrFilter = [new nlobjSearchFilter('custrecord_es_cert_certificant', null, 'is', stCustId)];
    var searchResults = nlapiSearchRecord('customrecord_es_certification', null, arrFilter, null);
    // nlapiLogExecution('AUDIT', 'FOUND CERTIFICATIONS', 'Customer '+stCustId+':: '+JSON.stringify(searchResults));
    if ( searchResults ) {
      objDataResponse.Response = 'T';
    }
  }
  catch ( certException ) {
    nlapiLogExecution('AUDIT', 'ERROR CERTIFICATIONS Vibe Check', 'Customer '+stCustId);
    // no action required, just ensuring objResponse write
  }
  return (JSON.stringify(objDataResponse));
}

function _ReadAll(objRequest, objResponse) {
  nlapiLogExecution('AUDIT','READALL Certifications', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var CustomerId = objRxData.CustomerId ? objRxData.CustomerId : stCustId;

  var objDataResponse = {
      "Array": []
  }

  // Single Certificaiton Looks like this
  // var Certification = {
  //     "Id": "",
  //     "Number": "",
  //     "BACBID": "",
  //     "Cycles": []
  // }

  // Single Cycle looks like this
  // var Cycle = {
  //      "Id": "",
  //      "Status": "",
  //      "StartDate": "",
  //      "RenewDate": "",
  //      "AbbrevMod": "",
  //      "NameMod": ""
  //}

  nlapiLogExecution('AUDIT', 'READALL Certifications', 'CustomerId = ' + CustomerId);

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_es_cert_certificant',null,'is', CustomerId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_es_cert_certificate_number');
  arrColumns[1] = new nlobjSearchColumn('entityid','custrecord_es_cert_certificant');
  arrColumns[2] = new nlobjSearchColumn('custrecord_cert_type_name','custrecord_es_cert_certification_type');
  arrColumns[3] = new nlobjSearchColumn('custrecord_cert_type_abbrev','custrecord_es_cert_certification_type');
  arrColumns[4] = new nlobjSearchColumn('internalid','custrecord_es_cert_certification_type');
  try {
      var searchResults = nlapiSearchRecord('customrecord_es_certification',null, arrFilters, arrColumns);
  }
  catch (ex) {
      throw nlapiCreateError('ERROR', 'ReadALL Certifications record failed.' + _parseError(ex) );
  };

  nlapiLogExecution('AUDIT', 'READALL Certifications Read', 'Certifications table query successful: ');

  recCustomer = nlapiLoadRecord('Customer',stCustId);

  if ( searchResults !== null ) {
    if ( !(searchResults instanceof Array && searchResults.length ) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        'Id': searchResults[stIndex].getId(),
        'Number': searchResults[stIndex].getValue(arrColumns[0]),
        'BACBID': searchResults[stIndex].getValue(arrColumns[1]),
        'Type': {
          'Id': searchResults[stIndex].getValue(arrColumns[4]),
          'Name': searchResults[stIndex].getValue(arrColumns[2]),
          'Abbrev': searchResults[stIndex].getValue(arrColumns[3]),
        }
      });
      var arrFiltersCycle = new Array();
      arrFiltersCycle[0] = new nlobjSearchFilter('custrecord_cert_cyc_certification',null,'is', objDataResponse.Array[objDataResponse.Array.length - 1].Id);

      var arrColumnsCycle = new Array();
      arrColumnsCycle[0] = new nlobjSearchColumn('custrecord_entity_status_int_name','custrecord_cert_cyc_status');
      arrColumnsCycle[1] = new nlobjSearchColumn('custrecord_cert_cyc_start_date');
      arrColumnsCycle[2] = new nlobjSearchColumn('custrecord_cert_cyc_end_date');
      arrColumnsCycle[3] = new nlobjSearchColumn('custrecord_cert_cycle_doctoral');

      var searchResultsCycle = nlapiSearchRecord('customrecord_certification_cycle',null, arrFiltersCycle, arrColumnsCycle);

      nlapiLogExecution('AUDIT', 'READALL Certification Cycles Read', JSON.stringify(searchResultsCycle));
      if (searchResultsCycle !== null) {
        if (!(searchResultsCycle instanceof Array && searchResultsCycle.length)) {
          nlapiLogExecution('AUDIT', 'READALL Certification Cycles Read', 'array-ed');
          searchResultsCycle = [searchResultsCycle];
        }
        objDataResponse.Array[objDataResponse.Array.length - 1].Cycles = [];
        for (var stCycleIndex in searchResultsCycle) {
          objDataResponse.Array[objDataResponse.Array.length - 1].Cycles.push({
            "Id" : searchResultsCycle[stCycleIndex].getId(),
            "Status" : searchResultsCycle[stCycleIndex].getValue(arrColumnsCycle[0]),
            "StartDate": searchResultsCycle[stCycleIndex].getValue(arrColumnsCycle[1]),
            "RenewalDate" : searchResultsCycle[stCycleIndex].getValue(arrColumnsCycle[2]),
            "AbbrevMod": searchResultsCycle[stIndex].getValue(arrColumnsCycle[3]) === 'Y' ? "-D" : "",
            "NameMod": searchResultsCycle[stIndex].getValue(arrColumnsCycle[3]) === 'Y' ? "-Doctoral" : ""
          });
        }
      }
    }
  }

  nlapiLogExecution('AUDIT', 'Cert Read certs', JSON.stringify(objDataResponse));

  nlapiLogExecution('AUDIT','READALL Certifications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _ReadAllIdOnly(objRequest){
  nlapiLogExecution('AUDIT','READALLIDOnly Certifications', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'READ_CALLED', 'READALL function in Certifications executed.');

  var objDataResponse = {
      "Certifications": []
  }

  nlapiLogExecution('AUDIT', 'CUSTOMER_ID', 'CustomerId = ' + stCustId);

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_es_cert_certificant',null,'is', stCustId);

  try {
      var searchResults = nlapiSearchRecord('customrecord_es_certification',null, arrFilters, null);
  }
  catch (ex) {
      throw nlapiCreateError('ERROR', 'ReadAll Certifications record failed.' + _parseError(ex) );
  };

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Certifications.push(searchResults[stIndex].getId());
      }
  }
  else if (searchResults !== null){
      objDataResponse.Certifications.push(searchResults.getId());
  }

  nlapiLogExecution('AUDIT','READALLIDOnly Certifications', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ Certifications', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var objDataResponse = {
      "Id": "",
      "Number": "",
      "BACBID": "",
      "Cycles": []
  }

  if (objRxData.Id) {
      stCustId = objRxData.Id;
  }

  nlapiLogExecution('AUDIT', 'CUSTOMER_ID', 'CustomerId = ' + stCustId);

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_es_cert_certificant',null,'is', stCustId);
  //arrFilters[0] = new nlobjSearchFilter('entityid', null, 'is', objRxData.CertId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_es_cert_certificate_number');
  arrColumns[1] = new nlobjSearchColumn('entityid','custrecord_es_cert_certificant');
  try {
      var searchResults = nlapiSearchRecord('customrecord_es_certification',null, arrFilters, arrColumns);
  }
  catch (ex) {
      throw nlapiCreateError('ERROR', 'Read Certifications record failed.' + _parseError(ex) );
  };

  recCustomer = nlapiLoadRecord('Customer',stCustId);
  // recCustomer.getFieldValues('entityid')

  var bNotFound = 0;
  var Certifications = [];
  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Id = searchResults[stIndex].getId();
          objDataResponse.Number = searchResults[stIndex].getValue(arrColumns[0]);
          objDataResponse.BACBID = searchResults[stIndex].getValue(arrColumns[1]);
      }
  }
  else if (searchResults !== null){
      objDataResponse.Id = searchResults.getId();
      objDataResponse.Number = searchResults.getValue(arrColumns[0]);
      objDataResponse.BACBID = searchResults.getValue(arrColumns[1]);
  }
  else {
      bNotFound = 1;
  }

  if (!bNotFound){
      var arrFiltersCycle = [];
      arrFiltersCycle[0] = new nlobjSearchFilter('custrecord_es_cert_certificant','custrecord_cert_cyc_certification','is', stCustId);

      var arrColumnsCycle = new Array();
      arrColumnsCycle[0] = new nlobjSearchColumn('custrecord_entity_status_int_name','custrecord_cert_cyc_status');
      arrColumnsCycle[1] = new nlobjSearchColumn('custrecord_cert_cyc_end_date');
      arrColumnsCycle[2] = new nlobjSearchColumn('custrecord_cert_cycle_doctoral');
      arrColumnsCycle[3] = new nlobjSearchColumn('custrecord_cert_cyc_certification');

      var searchResultsCycle = nlapiSearchRecord('customrecord_certification_cycle',null, arrFiltersCycle, arrColumnsCycle);
      if (searchResultsCycle instanceof Array && searchResultsCycle.length) {
          for (var stIndex in searchResultsCycle) {
              objDataResponse.Cycles.push({   "Id" : searchResultsCycle[stIndex].id,
                                              "Status" : searchResultsCycle[stIndex].getValue(arrColumnsCycle[0]),
                                              "RenewalDate" : searchResultsCycle[stIndex].getValue(arrColumnsCycle[1])});
                  if (searchResultsCycle[stIndex].getValue(arrColumnsCycle[2]) === 'Y') {
                      objDataResponse.Cycles[objDataResponse.length - 1].AbbrevMod = "-D";
                      objDataResponse.Cycles[objDataResponse.lenght - 1] = "-Doctoral";
                  }
          }
      }
      else if (searchResultsCycle !== null){
          objDataResponse.Cycles.push({   "Id" : searchResultsCycle.id,
                                          "Status" : searchResultsCycle.getValue(arrColumnsCycle[0]),
                                          "RenewalDate" : searchResultsCycle.getValue(arrColumnsCycle[1])});
          if (searchResultsCycle.getValue(arrColumnsCycle[2]) === 'Y') {
              objDataResponse.Cycles[objDataResponse.length - 1].AbbrevMod = "-D";
              objDataResponse.Cycles[objDataResponse.lenght - 1] = "-Doctoral";
          }
      }
  }

  nlapiLogExecution('AUDIT','READ Certifications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _CreateTestCert(objRequest) {
  nlapiLogExecution('DEBUG', 'CreateTestCert', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var objDataResponse = {
    Response: 'F',
    Message: 'INIT',
  }

  nlapiLogExecution('AUDIT', 'CreateTestCert', 'CustomerId = ' + stCustId);

  // We need to check for existing Certification
  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_es_cert_certificant', null, 'is', stCustId);
  var arrColumns = [];
  arrColumns[0] = new nlobjSearchColumn('custrecord_es_cert_certification_type');
  arrColumns[1] = new nlobjSearchColumn('custrecord_cert_type_abbrev', 'custrecord_es_cert_certification_type');
  try {
    var certSearchResults = nlapiSearchRecord('customrecord_es_certification', null, arrFilters, arrColumns);
    if ( certSearchResults !== null ) {
      if (!( certSearchResults instanceof Array && certSearchResults.length ) ) {
        certSearchResults = [certSearchResults];
      }
      // should always be an array of 1
      for ( var stIndex in certSearchResults ) {
        nlapiLogExecution('AUDIT', 'CreateTestCert RESULT', JSON.stringify(certSearchResults[stIndex]));
        var submitCycle = nlapiCreateRecord('customrecord_certification_cycle');
        submitCycle.setFieldValue('custrecord_cert_cyc_certification', certSearchResults[stIndex].getId());
        submitCycle.setFieldValue('custrecord_cert_cyc_start_date', objRxData.StartDate);
        submitCycle.setFieldValue('custrecord_cert_cyc_end_date', objRxData.EndDate);
        submitCycle.setFieldValue('custrecord_cert_cyc_cert_type', certSearchResults[stIndex].getValue(arrColumns[0]))
        submitCycle.setFieldValue('custrecord_cert_cyc_status', '39');
        var submitCycleId = nlapiSubmitRecord(submitCycle);
        objDataResponse.Response = 'T';
        objDataResponse.Message = 'Submitted CertCycle with ID: ' + submitCycleId;
      }
    }
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'CreateTestCert', 'Failed to find existing cert: ' + JSON.stringify(ex));
  }

  nlapiCreateRecord('customrecord_certification_cycle')
  // Request is 'BACB' and StartDate

  nlapiLogExecution('DEBUG', 'CreateTestCert', '======END======');
  return (JSON.stringify(objDataResponse));
}


function _parseError (ErrorObj) {
  var errorText = '';
  if (ErrorObj instanceof nlobjError) {
    errorText = 'UNEXPECTED ERROR: ' + '\n\n';
    errorText += 'Script Name: ' + ErrorObj.getUserEvent() + '\n';
    errorText += 'Error Code: ' + ErrorObj.getCode() + '\n';
    errorText += 'Error Details: ' + ErrorObj.getDetails() + '\n\n';
    errorText += 'Stack Trace: ' + ErrorObj.getStackTrace();
  }
  else {
    errorText = 'UNEXPECTED ERROR: ' + '\n\n';
    errorText += 'Error Details: ' + ErrorObj.toString();
  }
  return errorText;
};
