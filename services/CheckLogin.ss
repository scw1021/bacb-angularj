var ACTIONS = {
  isLoggedIn: _IsLoggedIn,
  logout: _Logout
};

function service(objRequest, objResponse) {

  var stParam = objRequest.getParameter('param');

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }

}

function _IsLoggedIn(objRequest, objResponse) {
  E$.logAudit('IsLoggedIn CheckLogin.ss', '=====START===== Other version');

  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: false,
    Message: ''
  };

  E$.logAudit('IsLoggedIn CheckLogin.ss', 'isLoggedIn2() Response: ' + objSession.isLoggedIn2().toString());
  E$.logAudit('IsLoggedIn CheckLogin.ss', 'isRecognized() Response: ' + objSession.isRecognized().toString());
  if (objSession.isLoggedIn2() == true && objSession.isRecognized() == true) {
    objDataResponse.Response = true;
    objDataResponse.Message = "Customer is logged in.";
  }
  else {
    objDataResponse.Response = false;
    objDataResponse.Message = "Customer not logged in.";
  }

  E$.logAudit('IsLoggedIn CheckLogin.ss', 'Returned Data: ' + JSON.stringify(objDataResponse));

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));

  E$.logAudit('IsLoggedIn CheckLogin.ss', '=====END=====  Other version');
 };

 function _Logout(objRequest, objResponse) {
    E$.logAudit('Logout CheckLogin.ss', '=====START=====');
    var objSession = nlapiGetWebContainer().getShoppingSession();
  
    var objDataResponse = {
      Response: false,
      Message: ''
    };
    
    try {
      objSession.logout();
    }
    catch (ex) {
      objDataResponse.Response = true;
      objDataResponse.Message = _parseError(ex);
    }
  
    if (!objDataResponse.Response) {
      objDataResponse.Message = 'Logout Successful';
    }
  
    E$.logAudit('Logout CheckLogin.ss', 'Logout Data: ' + JSON.stringify(objDataResponse));
    E$.logAudit('Logout CheckLogin.ss', '=====END=====');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
  };