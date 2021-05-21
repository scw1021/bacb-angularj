function service(request, response){

var objSession= nlapiGetWebContainer().getShoppingSession();

var objDataResponse = {
    hasError: false,
    message: 'User logged out.',
    data: {
      user: {}
    }
  };
  
  try {
    objSession.logout();
  }
  catch (ex) {
    objDataResponse.hasError = true;
    objDataResponse.message = _parseError(ex);
  }

   if (objSession.isLoggedIn2() && objSession.isRecognized()) {
      // var loggedInCustomer = objSession.getCustomer(); <-- this line is never used
      objDataResponse.message = "Customer already logged in."
    }

  response.setContentType('PLAINTEXT');
  response.write(JSON.stringify(objDataResponse));

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