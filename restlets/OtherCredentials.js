var ACTIONS = {
  Check: _Check,
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Update: _Update,
  SetBypass: _SetBypass,
  Submit: _Submit,
  ReadBypass: _ReadBypass
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

/**
* Submit all credentials and prevent future deletions
* This confirms credentials as a permanent application element
* @param objRequest { AppId: `string`, Credentials: `[{id : string}]`}
* @param objResponse
*/
function _Submit(objRequest) {
nlapiLogExecution('AUDIT',"SUBMIT Credentials", "=====START=====");
// var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution(
  "AUDIT",
  "Submit Credentials",
  "SUBMIT function in Credentials executed."
);

var AppId = '';
if (objRxData) {
  AppId = objRxData.AppId;
  index = objRxData.NumCredentials;
  Credentials = objRxData.Credentials;
  nlapiLogExecution(
    "AUDIT",
    "Submit Credentials",
    JSON.stringify(Credentials)
  );
} else {
  nlapiLogExecution(
    "ERROR",
    "Submit Credentials",
    "Body of the request is not defined."
  );
}

var objDataResponse = {
  Response: "F",
  Message: "Results: "
};

// Update all courses if the appId and Credentials are valid
if ( AppId && objRxData.Credentials && objRxData.Credentials.length > 0 ) {
  for ( var i=0; i < index; i++ ) {
    try {
      var degree = nlapiLoadRecord('customrecord_non_bacb_prof_credential', Credentials[i]);
      degree.setFieldValue('custrecord_non_bacb_cred_submitted', 'T');
      var response = nlapiSubmitRecord(degree, true);
      objDataResponse.Message += "{" + Credentials[i] + ":" + response + "}";
    }
    catch (ex) {
      objDataResponse.Response = "Failed on DegreeID: " + Credentials[i];
      nlapiLogExecution(
        "ERROR",
        "Submit Credentials",
        "Failed to update credential with ID:" + Credentials[i]
      );
    }
  }
}
else {
  nlapiLogExecution(
    "ERROR",
    "Submit Degrees",
    "AppId missing, or CredentialsIds are missing from request. OBJ: " + JSON.stringify(objRxData)
  );
}
nlapiLogExecution('AUDIT',"SUBMIT Credentials", "======END======");
return (JSON.stringify(objDataResponse));
}
function _Check(objRequest) {
  nlapiLogExecution('AUDIT','Check OtherCredentials', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Check OtherCredentials', 'CHECK function in OtherCredentials executed.');

  var objDataResponse = {
  Response: 'F',
  Message: 'Default Value',
      ReturnId: ''
  }

  var appSearchResults = [];
  var NoCredentials = '';
  if (objRxData.AppId) {
      try {
          var arrAppFilters = [];
          arrAppFilters[0] = new nlobjSearchFilter('internalid',null,'is', objRxData.AppId);

          var arrAppColumns = new Array();
          arrAppColumns[0] = new nlobjSearchColumn('custrecord_app_no_other_credentials');

          var appSearchResults = nlapiSearchRecord('customrecord_applications',null, arrAppFilters, arrAppColumns);

          if (appSearchResults instanceof Array && appSearchResults.length) {
              NoCredentials = appSearchResults[0].getValue(arrAppColumns[0]);
          }
          else if (appSearchResults != null) {
              NoCredentials = appSearchResults.getValue(arrAppColumns[0]);
          }

          if (NoCredentials != 'T') {
              if (stCustId) {
                  var arrFilters = [];
                  arrFilters[0] = new nlobjSearchFilter('custrecord_non_bacb_cred_customer',null,'is', stCustId);

                  var credSearchResults = nlapiSearchRecord('customrecord_non_bacb_prof_credential', null, arrFilters, null);
                  if (credSearchResults) {
                      objDataResponse.Response = 'T';
                      objDataResponse.Message = 'Non BACB credentials found.';
                  }
              }
              else {
                  objDataResponse.Message = "No customer Id found, please check that you are logged in.";
              }
          }
          else {
              objDataResponse.Response = 'T';
              objDataResponse.Message = 'No other credenitals declared.';
          }
      }
      catch (ex) {
          nlapiLogExecution('ERROR', 'Check OtherCredentials', 'Application query failed.');
      }
  }
  else {
      objDataResponse.Message = "No application Id found.";
  }

  nlapiLogExecution('AUDIT','CHECK OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Create(objRequest){
  nlapiLogExecution('AUDIT','CREATE OtherCredentials', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest['credential'];
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in OtherCredentials executed.');

  var objDataResponse = {
    'Response': 'F',
    'Message': '',
    'ReturnId': ''
  }

  nlapiLogExecution('Audit', 'JSON Object', 'objRxData: ' + JSON.stringify(objRxData));

  if (stCustId) {
      var recNewCred = nlapiCreateRecord('customrecord_non_bacb_prof_credential');
      recNewCred.setFieldValue('custrecord_non_bacb_cred_customer', stCustId);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_type', objRxData.Type.Id);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_title', objRxData.Title);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_country', objRxData.Country.Id);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_state', objRxData.State.Name);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_state_code', objRxData.State.Abbrev);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_number', objRxData.Number);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_year', objRxData.Year);
      objDataResponse.ReturnId = nlapiSubmitRecord(recNewCred, true);
      if (objDataResponse.ReturnId) {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'New credential created successfully.'
      }
      else {
          objDataResponse.Message = 'No record was created for the submitted credential.'
      }
  }
  else {
      objDataResponse.Message = 'Customer Id is invalid, consider re-logging in.';
  }

  nlapiLogExecution('AUDIT','CREATE OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest){
  nlapiLogExecution('AUDIT','DELETE OtherCredentials', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Delete_OtherCredentials', 'DELETE function in OtherCredentials executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': ''
  }

  if (objRxData.Id) {
      try{
          nlapiDeleteRecord('customrecord_non_bacb_prof_credential',objRxData.Id);
      }
      catch (ex) {
          throw nlapiCreateError('DELETE_FAILED', 'Credential Delete call failed.');
      }
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Credential removed successfully.'
  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Credential ID is invalid.');
  }

  nlapiLogExecution('AUDIT','DELETE OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ OtherCredentials', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in OtherCredentials executed.');

  var objDataResponse = {
      Array: []
  }
  nlapiLogExecution('AUDIT', 'READ_OtherCredentials', 'READ function passed CustomerID:' + stCustId);

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_non_bacb_cred_customer',null,'is', stCustId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_non_bacb_cred_type');
  arrColumns[1] = new nlobjSearchColumn('custrecord_non_bacb_cred_title');
  arrColumns[2] = new nlobjSearchColumn('custrecord_non_bacb_cred_country');
  arrColumns[3] = new nlobjSearchColumn('custrecord_non_bacb_cred_state');
  arrColumns[4] = new nlobjSearchColumn('custrecord_non_bacb_cred_state_code');
  arrColumns[5] = new nlobjSearchColumn('custrecord_non_bacb_cred_number');
  arrColumns[6] = new nlobjSearchColumn('custrecord_non_bacb_cred_year');

  var searchResults = nlapiSearchRecord('customrecord_non_bacb_prof_credential',null, arrFilters, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Array.push({Id: searchResults[stIndex].getId(),
                                      Type:   {'Id' : searchResults[stIndex].getValue(arrColumns[0]),
                                               'Value' : searchResults[stIndex].getText(arrColumns[0])},
                                      Title:  searchResults[stIndex].getValue(arrColumns[1]),
                                      Country: _GetCountry(searchResults[stIndex].getValue(arrColumns[2])),
                                      State:  {'Id' : searchResults[stIndex].getValue(arrColumns[4]),
                                               'Abbrev' : searchResults[stIndex].getValue(arrColumns[4]),
                                               'Name' : searchResults[stIndex].getText(arrColumns[3])},
                                      Number: searchResults[stIndex].getValue(arrColumns[5]),
                                      Year:   searchResults[stIndex].getValue(arrColumns[6])
          });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Array.push({Id: searchResults.getId(),
                                  Type:   {'Id' : searchResults.getValue(arrColumns[0]),
                                           'Value' : searchResults.getText(arrColumns[0])},
                                  Title:  searchResults.getValue(arrColumns[1]),
                                  Country: _GetCountry(searchResults.getValue(arrColumns[2])),
                                  State:  {'Id' : searchResults.getValue(arrColumns[4]),
                                           'Abbrev' : searchResults.getValue(arrColumns[4]),
                                           'Name' : searchResults.getText(arrColumns[3])},
                                  Number: searchResults.getValue(arrColumns[5]),
                                  Year:   searchResults.getValue(arrColumns[6])
      });
  }

  nlapiLogExecution('AUDIT','READ OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {
  nlapiLogExecution('AUDIT','UPDATE OtherCredentials', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest['credential'];
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in OtherCredentials executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': '',
      'ReturnId' : ''
  }

  if (objRxData.Id) {

      var recNewCred = nlapiLoadRecord('customrecord_non_bacb_prof_credential', objRxData.Id);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_customer', stCustId);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_type', objRxData.Type.Id);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_title', objRxData.Title);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_country', objRxData.Country.Id);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_state', objRxData.State.Name);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_state_code', objRxData.State.Abbrev);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_number', objRxData.Number);
      recNewCred.setFieldValue('custrecord_non_bacb_cred_year', objRxData.Year);
      objDataResponse.ReturnId = nlapiSubmitRecord(recNewCred, true);
      if (objDataResponse.ReturnId) {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Credential updated successfully.'
      }
  }
  else {
      objDataResponse.Message = 'Credential ID is invalid.';
      nlapiLogExecution('ERROR','INVALID_DATA', 'Credential ID is invalid.');
  }

  nlapiLogExecution('AUDIT','UPDATE OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _GetCountry(CountryId) {
  // nlapiLogExecution('AUDIT','GetCountry OtherCred', '====START====');

  // nlapiLogExecution('AUDIT','GetCountry OtherCred','Country ID: ' + CountryId);

  var recCountry = nlapiLoadRecord('customrecord_countries', CountryId);
  var ReturnCountry = { 'Id': CountryId,
                        'Name' : recCountry.getFieldValue('custrecord_country_name'),
                        'Abbrev' : recCountry.getFieldValue('custrecord_country_code'),
                        'Enumeration' : recCountry.getFieldValue('custrecord_country_enumeration'),
                        'Discount' : recCountry.getFieldValue('custrecord_country_discount'),
                        'DialCode' : recCountry.getFieldValue('custrecord_country_dialcode')};

  // nlapiLogExecution('AUDIT','GetCountry OtherCred', '====End====');
  return ReturnCountry;
}

function _SetBypass(objRequest) {
  nlapiLogExecution('AUDIT','SetBypass OtherCredentials', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('DEBUG', 'SET BYPASS', JSON.stringify(objRxData))
  var objDataResponse = {
      'Response': 'F',
      'Message': '',
      'ReturnId' : ''
  }

  if (objRxData.AppId) {
      try {
          var recNewCred = nlapiLoadRecord('customrecord_applications', objRxData.AppId);
          recNewCred.setFieldValue('custrecord_app_no_other_credentials', objRxData.Bypass);
          objDataResponse.ReturnId = nlapiSubmitRecord(recNewCred, true);
      }
      catch (ex) {
          nlapiLogExecution('ERROR', 'SetBypass', 'The attempt to set the bypass value faield: ' + ex.message)
      }

      if (objDataResponse.ReturnId) {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Other credential bypass value set.';
      }
  }

  nlapiLogExecution('AUDIT','SetBypass OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _ReadBypass(objRequest) {
  nlapiLogExecution('AUDIT','ReadBypass OtherCredentials', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  var objDataResponse = {
      'Response': 'F',
      'Message': '',
      'ReturnId' : ''
  }

  if (objRxData.AppId) {
      try {
          nlapiLogExecution('Audit', 'ReadBypass', 'The AppId: ' + objRxData.AppId);
          var arrFilters = [];
          arrFilters[0] = new nlobjSearchFilter('internalid',null,'is', objRxData.AppId);

          var arrColumns = new Array();
          arrColumns[0] = new nlobjSearchColumn('custrecord_app_no_other_credentials');

          var searchResults = nlapiSearchRecord('customrecord_applications',null, arrFilters, arrColumns);

          if (searchResults instanceof Array && searchResults.length) {
              objDataResponse.Response = searchResults[0].getValue(arrColumns[0]);
              objDataResponse.Message = 'Result found.';
          }
          else if (searchResults) {
              objDataResponse.Response = searchResults.getValue(arrColumns[0]);
              objDataResponse.Message = 'Result found.'
          }
      }
      catch (ex) {
          nlapiLogExecution('ERROR', 'ReadBypass', 'The attempt to set the bypass value field: ' + ex.message)
      }
  }

  nlapiLogExecution('AUDIT','ReadBypass OtherCredentials', '======END======');
  return (JSON.stringify(objDataResponse));
}
