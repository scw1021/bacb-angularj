var ES_ACTIONS = {
    Logout: logout
};

function service(objRequest, objResponse) {

	var stAx = objRequest.getParameter('esAx');
  
	if (ES_ACTIONS[stAx]) {
		ES_ACTIONS[stAx](objRequest, objResponse);
	}
  
};

function logout(objRequest, objResponse) {

    var webSession = nlapiGetWebContainer().getShoppingSession();
  
    var objDataResponse = {
      hasError: false,
      message: 'User logged out.',
      data: {
        user: {}
      }
    };
    
    try {
      webSession.logout();
    }
    catch (ex) {
      objDataResponse.hasError = true;
      objDataResponse.message = "function logout threw an error.";
    }
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
  };
