var ACTIONS = {
  Read: _Read,
  Write: _Write
}

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

function _Read(objRequest) {
  var log_string = 'ACCOMMODATIONS READ';
  var log_audit = 'AUDIT';
  nlapiLogExecution(log_audit, log_string, '=====START=====');
  nlapiLogExecution(log_audit, log_string, 'READALL function in Accommodations executed.');
  // var stCustId = objRequest['CustomerId'];
  // var objRxData = objRequest;
  // var recCustomer = nlapiLoadRecord("customer", stCustId);
  nlapiLogExecution(log_audit, log_string, 'READALL function in Accommodations executed.');



  var Confirm = {
    "Response": 'F',
    "Message": 'init'
  };
  // Set to null initially, if none is found, that is fine.
  var Accommodation = null;

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_accommodation_application', null, 'is', objRxData.AppId);
  try {
    // I should only ever get one record, so let's grab the ID and load it.
    var searchResults = nlapiSearchRecord('customrecord_accommodation', null, arrFilters, null);
    Confirm.Response = 'T';
  }
  catch ( ex ) {
    throw nlapiCreateError(log_string, _parseError(ex))
  }

  if ( searchResults != null ) {
    if ( !(searchResults instanceof Array && searchResults.length) ) {
      searchResults = [searchResults]
    }
    if (searchResults.length > 1) {
      nlapiLogExecution('ERROR', log_string, 'There are multiple records for accommodations for this application')
    }
    nlapiLogExecution(log_audit, log_string, 'Search Results:' + JSON.stringify(searchResults));
    for (var stIndex in searchResults) {
      var accommodation = nlapiLoadRecord('customrecord_accommodation', searchResults[stIndex].getId());
      nlapiLogExecution(log_audit, log_string, 'Result:' + JSON.stringify(accommodation));
      accommodation = JSON.parse(JSON.stringify(accommodation).replace(/^[^{]*{/, "{"));
      Accommodation = {
        LargeFont: accommodation.custrecord_accommodation_large_font ? 'T' : 'F',
        Scribe: accommodation.custrecord_accommodation_scribe ? 'T' : 'F',
        TimeAndAHalf: accommodation.custrecord_accommodation_time_and_a_half ? 'T' : 'F',
        SignLanguageInterpreter: accommodation.custrecord_accommodation_sign_language ? 'T' : 'F',
        AdjustableHeightDesk: accommodation.custrecord_accommodation_adjustable_desk ? 'T' : 'F',
        Reader: accommodation.custrecord_accommodation_reader ? 'T' : 'F',
        AdditionalTime: accommodation.custrecord_accommodation_additional_time ? 'T' : 'F',
        DoubleTime: accommodation.custrecord_accommodation_double_time ? 'T' : 'F',
        SeparateTestingRoom: accommodation.custrecord_accommodation_separate_room ? 'T' : 'F',
        Other: accommodation.custrecord_accommodation_other,
      }
    }
  }
  nlapiLogExecution(log_audit, log_string, '======END======');
  return JSON.stringify({'Confirm': Confirm, 'Accommodation': Accommodation});
}

function _Write(objRequest) {
  var log_string = 'ACCOMMODATIONS WRTIE';
  var log_audit = 'AUDIT';
  nlapiLogExecution(log_audit, log_string, '=====START=====');
  nlapiLogExecution(log_audit, log_string, 'Write function in Accommodations executed.');
  // var stCustId = objRequest['CustomerId'];
  nlapiLogExecution(log_audit, log_string, 'Write function in Accommodations executed.');

  var objRxData = objRequest;

  var Confirm = {
    "Response": 'F',
    "Message": 'init'
  };

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_accommodation_application', null, 'is', objRxData.AppId);
  try {
    // I should only ever get one record, so let's grab the ID and load it.
    var searchResults = nlapiSearchRecord('customrecord_accommodation', null, arrFilters, null);
    Confirm.Response = 'T';
  }
  catch ( ex ) {
    throw nlapiCreateError(log_string, _parseError(ex))
  }
  nlapiLogExecution(log_audit, log_string, 'Search Results:' + JSON.stringify(searchResults));
  if ( searchResults != null ) {
    if ( !(searchResults instanceof Array && searchResults.length) ) {
      searchResults = [searchResults]
    }
    if (searchResults.length > 1) {
      nlapiLogExecution('ERROR', log_string, 'There are multiple records for accommodations for this application')
    }
    for (var stIndex in searchResults) {
      var accommodation = nlapiLoadRecord('customrecord_accommodation', searchResults[stIndex].getId());
      if (requestedAccommodation) {
        var accommodationId = nlapiSubmitRecord(_setValues(accommodation, requestedAccommodation));
        Confirm.Message = 'Submitted Accommodation with ID: ' + accommodationId;
      }
      else {
        nlapiDeleteRecord('customrecord_accommodation', searchResults[stIndex].getId());
        Confirm.Message = 'No Accommodation Required, Previous record deleted';
      }
    }
  }
  // we get here if there are no existing records, I checked
  else {
    if ( requestedAccommodation ) {
      var newAccommodation = nlapiCreateRecord('customrecord_accommodation');
      newAccommodation.setFieldValue('custrecord_accommodation_application', objRxData.AppId);
      Confirm.Message = 'Submitted Accommodation with ID: ' + nlapiSubmitRecord(_setValues(newAccommodation, requestedAccommodation));
    }
    else {
      Confirm.Message = 'No Accommodation Required';
    }
  }
  nlapiLogExecution(log_audit, log_string, '======END======');
	return JSON.stringify(Confirm);
}

function _setValues(accommodation, requestedAccommodation) {
  accommodation.setFieldValue('custrecord_accommodation_large_font', requestedAccommodation.LargeFont);
  accommodation.setFieldValue('custrecord_accommodation_scribe', requestedAccommodation.Scribe);
  accommodation.setFieldValue('custrecord_accommodation_time_and_a_half', requestedAccommodation.TimeAndAHalf);
  accommodation.setFieldValue('custrecord_accommodation_sign_language', requestedAccommodation.SignLanguageInterpreter);
  accommodation.setFieldValue('custrecord_accommodation_adjustable_desk', requestedAccommodation.AdjustableHeightDesk);
  accommodation.setFieldValue('custrecord_accommodation_reader', requestedAccommodation.Reader);
  accommodation.setFieldValue('custrecord_accommodation_additional_time', requestedAccommodation.AdditionalTime);
  accommodation.setFieldValue('custrecord_accommodation_double_time', requestedAccommodation.DoubleTime);
  accommodation.setFieldValue('custrecord_accommodation_separate_room', requestedAccommodation.SeparateTestingRoom);
  accommodation.setFieldValue('custrecord_accommodation_other', requestedAccommodation.other);
  return accommodation;
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
