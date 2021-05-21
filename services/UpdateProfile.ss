var ES_ACTIONS = {
  ChangeNameAndEmail: _ChangeNameAndEmail,
  Reset: _ResetPassword
};

function service(objRequest, objResponse) {
  var stParam = objRequest.getParameter('param');
  if (ES_ACTIONS[stParam]) {
    ES_ACTIONS[stParam](objRequest, objResponse);
  }
};


function _ChangeNameAndEmail(objRequest, objResponse) {
  E$.logAudit('UPDATE Name/Email', '=====START=====');

  // Open session
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'objSession_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in UpdateProfile executed. Customer ID:' + stCustId);
  // Get request as object ( new information sent by SPA )
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'UpdateProfile UPDATE INVALID_BODY', 'Body of the request is not defined.');
  }
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

  E$.logAudit('UPDATE PersonalInfo', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}


function _ResetPassword (objRequest, objResponse) {
  E$.logAudit('RESET PASSWORD', '======YEET======');
  objResponse.write(JSON.stringify(objRequest));
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
