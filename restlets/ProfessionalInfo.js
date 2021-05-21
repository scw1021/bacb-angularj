var ACTIONS = {
  Check: _Check,
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Update: _Update
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

function _Check(objRequest) {
  // nlapiLogExecution('AUDIT','CHECK ProfessionalInfo', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Check ProfessionalInfo', 'READ function in ProfessionalInfo executed. CustomerId: ' + stCustId);

  var objDataResponse = {
  'Response': 'F',
  'Message': 'Professional Info Check Default Value'
  }

  if (parseInt(_GetProfile(stCustId), 10) > 0) {

      var recProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId));

      if (!recProfile.getFieldValue('custrecord_profile_primary_role')) {
          objDataResponse.Message = 'Primary Role is not defined.';

      }
      else if (!recProfile.getFieldValue('custrecord_profile_primary_area_prof_emp')) {
          objDataResponse.Message = 'Primary area of emphasis is not defined.';
      }
      else if (!recProfile.getFieldValue('custrecord_profile_ages_client')) {
          objDataResponse.Message = 'Client Ages are not defined.';
      }
      else {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Required professional information fields completed.'
      }
  }

  // nlapiLogExecution('AUDIT','CHECK Professional Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Create(objRequest) {
  // nlapiLogExecution('AUDIT','CREATE Personal/Professional Information', '=====START=====');

  // nlapiLogExecution('AUDIT','CREATE Professional Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objReqeust) {
  // nlapiLogExecution('AUDIT','DELETE Personal/Professional Information', '=====START=====');

  // nlapiLogExecution('AUDIT','DELETE Professional Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ Personal/Professional Information', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  // nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in ProfessionalInfo executed. CustomerId: ' + stCustId);

  if (!stCustId) {
      throw nlapiCreateError('Read ProfessionalInfo', 'Client ID is NULL.: ' + stCustId);
  }
  else {
      var recProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId));

      var objDataResponse = {
          PrimaryRole: {
              Id: recProfile.getFieldValue('custrecord_profile_primary_role'),
              Value: recProfile.getFieldText('custrecord_profile_primary_role')
          },
          SecondaryRole: {
              Id: recProfile.getFieldValue('custrecord_profile_secondary_role') ? recProfile.getFieldValue('custrecord_profile_secondary_role') : '',
              Value: recProfile.getFieldText('custrecord_profile_secondary_role')
          },
          PrimaryArea: {
              Id: recProfile.getFieldValue('custrecord_profile_primary_area_prof_emp'),
              Value: recProfile.getFieldText('custrecord_profile_primary_area_prof_emp')
          },
          PrimaryAreaOther: recProfile.getFieldValue('custrecord_profile_primary_area_other') != 'undefined' ? recProfile.getFieldValue('custrecord_profile_primary_area_other') : '',
          SecondaryArea: {
              Id: recProfile.getFieldValue('custrecord_profile_secondary_area_prof') ? recProfile.getFieldValue('custrecord_profile_secondary_area_prof') : '',
              Value: recProfile.getFieldText('custrecord_profile_secondary_area_prof')
          },
          SecondaryAreaOther: recProfile.getFieldValue('custrecord_profile_secondary_area_other') != 'undefined' ? recProfile.getFieldValue('custrecord_profile_secondary_area_other') : '',

          TertiaryArea: getMultiSelectValues(recProfile,"custrecord_profile_tertiary_area_prof"),
          ClientAges: getMultiSelectValues(recProfile, 'custrecord_profile_ages_client'),
          SecondaryClientAges: getMultiSelectValues(recProfile, 'custrecord_profile_secondary_ages_client')
      }
  }

nlapiLogExecution('AUDIT','READ Professional Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {
// nlapiLogExecution('AUDIT','UPDATE Personal/Professional Information', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest['data'];

  var objDataResponse = {
  'Response': false,
      'Message': '',
      'ReturnId' : ''
  }
  nlapiLogExecution('DEBUG', 'Update ProfessionalInfo', 'stBody: ' + JSON.stringify(stBody));
try {
      var recProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId));

      recProfile.setFieldValue('custrecord_profile_primary_role', objRxData.PrimaryRole?objRxData.PrimaryRole.Id:'');
      recProfile.setFieldValue('custrecord_profile_secondary_role', objRxData.SecondaryRole?objRxData.SecondaryRole.Id:'');
      recProfile.setFieldValue('custrecord_profile_primary_area_prof_emp', objRxData.PrimaryArea?objRxData.PrimaryArea.Id:'');
      recProfile.setFieldValue('custrecord_profile_primary_area_other', objRxData.PrimaryAreaOther? objRxData.PrimaryAreaOther:'');
      recProfile.setFieldValue('custrecord_profile_secondary_area_prof', objRxData.SecondaryArea?objRxData.SecondaryArea.Id:'');
      recProfile.setFieldValue('custrecord_profile_secondary_area_other', objRxData.SecondaryAreaOther?objRxData.SecondaryAreaOther:'');
      var TertiaryArea = '';
      for (var stIndex1 in objRxData.TertiaryArea) {
          TertiaryArea += TertiaryArea != '' ? '\u0005' : '';
          TertiaryArea += objRxData.TertiaryArea[stIndex1].Id;
      }
      // nlapiLogExecution('AUDIT','UPDATE ProfessionalInfo','TertiaryArea:' + TertiaryArea);
      var ClientAges = '';
      // nlapiLogExecution('AUDIT','UPDATE ProfessionalInfo','ClientAges(raw):' + JSON.stringify(objRxData.ClientAges));
      for (var stIndex2 in objRxData.ClientAges) {
          ClientAges += ClientAges != '' ? '\u0005' : '';
          ClientAges += objRxData.ClientAges[stIndex2].Id;
      }
      var SecondaryClientAges = '';
      for (var stIndex3 in objRxData.SecondaryClientAges) {
        SecondaryClientAges += SecondaryClientAges != '' ? '\u0005' : '';
        SecondaryClientAges += objRxData.SecondaryClientAges[stIndex3].Id;
    }

      nlapiLogExecution('AUDIT','UPDATE ProfessionalInfo','ClientAges:' + ClientAges);
      recProfile.setFieldValue('custrecord_profile_tertiary_area_prof', TertiaryArea);
      recProfile.setFieldValue('custrecord_profile_ages_client', ClientAges);
      recProfile.setFieldValue('custrecord_profile_secondary_ages_client', ClientAges);

      var ProfileId = nlapiSubmitRecord(recProfile, true);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'ProfessionalInfo UPDATE', 'The update function failed: ' + ex.message)
  }

  if (ProfileId) {
      objDataResponse.Response = true;
      objDataResponse.Message = "Professional Information successfully updated.  Profile ID: " + ProfileId;
      objDataResponse.ReturnId = ProfileId;
  }

// nlapiLogExecution('AUDIT','UPDATE Personal/Professional Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _GetProfile(CustomerID) {
  var ReturnID = 0;
  var arrFilters = [];

  // nlapiLogExecution('AUDIT','GetProfile ProfessionalInfo', 'CustomerID: ' + CustomerID);

  arrFilters[0] = new nlobjSearchFilter('custrecord_customer',null,'anyof', CustomerID);

  try {
      var searchResults = nlapiSearchRecord('customrecord_profile',null, arrFilters, null);
  }
  catch (ex) {
      nlapiLogExecution('AUDIT','GetProfile ProfessionalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'CustomerID: ' + CustomerID);
      return 0;
  }
  // nlapiLogExecution('AUDIT','GetProfile ProfessionalInfo After', 'CustomerID: ' + CustomerID + ' Result: ' + JSON.stringify(searchResults));

  if (searchResults instanceof Array && searchResults.length) {
      ReturnID = searchResults[0].getId();
  }
  else if (searchResults) {
      ReturnID = searchResults.getId();
  }
  else {
      // nlapiLogExecution('AUDIT','GetProfile ProfessionalInfo inside', 'CustomerID: ' + CustomerID);
      var recNewProfile = nlapiCreateRecord('customrecord_profile', {recordmode: 'dynamic'});
      recNewProfile.setFieldValue('custrecord_customer', CustomerID);
      ReturnID = nlapiSubmitRecord(recNewProfile, true, true);
  }

  // nlapiLogExecution('AUDIT','GetProfile ProfessionalInfo bottom', 'CustomerID: ' + CustomerID, ' and ProfileID: ' + ReturnID);
  return ReturnID;
};

function getMultiSelectValues(ProfileRecord, FieldID) {
  var ReturnValue = [];
  var ValueArray = ProfileRecord.getFieldValue(FieldID).split("\u0005");
  var TextArray = ProfileRecord.getFieldText(FieldID).split("\u0005");
  for (var stIndex in ValueArray) {
      ReturnValue.push({'Id' : ValueArray[stIndex], 'Value' : TextArray[stIndex]})
  }
  return ReturnValue;
}

function _parseError (ErrorObj) {

  var errorText = '';

  if (ErrorObj instanceof nlobjError)
  {
      errorText = 'UNEXPECTED ERROR: ' + '\n\n';
      errorText += 'Script Name: ' + ErrorObj.getUserEvent() + '\n';
      errorText += 'Error Code: ' + ErrorObj.getCode() + '\n';
      errorText += 'Error Details: ' + ErrorObj.getDetails() + '\n\n';
      errorText += 'Stack Trace: ' + ErrorObj.getStackTrace();
  }
  else
  {
      errorText = 'UNEXPECTED ERROR: ' + '\n\n';
      errorText += 'Error Details: ' + ErrorObj.toString();
  }

  return errorText;
};




