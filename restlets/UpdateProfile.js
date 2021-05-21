var ES_ACTIONS = {
  ChangeNameAndEmail: _ChangeNameAndEmail,
  Reset: _ResetPassword
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


function _ChangeNameAndEmail(objRequest) {
  nlapiLogExecution('AUDIT','UPDATE Name/Email', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in UpdateProfile executed. Customer ID:' + stCustId);

  // nlapiLogExecution('DEBUG', 'UpdateProfile - objRxData', JSON.stringify(objRxData));
  var objDataResponse = {
    'Response': 'F',
    'Message' : ''
  }

  // Grab required records and update fields
  if (stCustId) {
    var recCustomer = nlapiLoadRecord('customer', stCustId);

    recCustomer.setFieldValue('firstname', objRxData.FirstName);
    recCustomer.setFieldValue('middlename', objRxData.MiddleName);
    recCustomer.setFieldValue('lastname', objRxData.LastName);
    recCustomer.setFieldValue('email', objRxData.Email);
    recCustomer.setFieldValue('altemail', objRxData.AltEmail);

    try {
        // Update the customer
        var CustomerId = nlapiSubmitRecord(recCustomer, true);
    }
    catch (ex) {
        throw nlapiCreateError('ERROR', 'Update profile record failed.' + _parseError(ex) );
    }
    if (CustomerId) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = "Customer " + CustomerId + " updated.";
    }
    // if (CustomerId && ProfileId) {
    //     objDataResponse.Response = 'T';
    //     objDataResponse.Message = "Profile " + CustomerId + " updated.  Profile ID: " + ProfileId;
    // }
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','UPDATE PersonalInfo', '======END======');
  return (JSON.stringify(objDataResponse));
}


function _ResetPassword (objRequest) {
  nlapiLogExecution('AUDIT','RESET PASSWORD', '======YEET======');
  return (JSON.stringify(objRequest));
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
