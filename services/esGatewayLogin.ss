/**
 * Copyright (c) 2008-2014 Elim Solutions Inc.
 * 50 McIntosh Drive, Suite 110, Markham, ON, Canada
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Elim Solutions ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Elim Solutions.
 *
 * SVN :: $
 *
 * Project :: Elim Solutions - Gateway
 * Filename :: esGatewayLogin.ss
 * Created :: 16-01-15
 * Author :: Michael
 *
 * Notes ::
 * <date> : <note>
 *
 */

var ES_ACTIONS = {
  login: login,
  getUser: getUser,
  resendActivation: resendActivation,
  register: register,
  logout: logout,
  retrievalEmail: retrievalEmail,
  heartbeat: heartbeat,
  getPayMethods: getPayMethods,
  resetPassword: resetPassword,
  isPasswordReset: isPasswordReset
};

function service(objRequest, objResponse) {
  E$.logAudit('service', '=====START=====');

  var stAx = objRequest.getParameter('esAx');

  if (ES_ACTIONS[stAx]) {
    ES_ACTIONS[stAx](objRequest, objResponse);
  }

  E$.logAudit('service', '======END======');
}

function heartbeat(objRequest, objResponse) {
  E$.logAudit('heartbeat', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
    }
  };

  try {
    objDataResponse.data.isLoggedIn = webSession.isLoggedIn2();
    if (webSession.isLoggedIn2() == true) {
      var webCustomer = webSession.getCustomer();

      objDataResponse.data.user = getCustomerData(webCustomer);

    }
  } catch (ex) {
    objDataResponse.hasError = true;
    objDataResponse.message = E$.parseError(ex);
  }

  E$.logAudit('heartbeat', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function getPayMethods(objRequest, objResponse) {
  E$.logAudit('getPayMethods', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      paymethods: []
    }
  };

  try {
    objDataResponse.data.paymethods = webSession.getPaymentMethods();
  } catch (ex) {
    objDataResponse.hasError = true;
    objDataResponse.message = E$.parseError(ex);
  }

  E$.logAudit('getPayMethods', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function retrievalEmail(objRequest, objResponse) {
  E$.logAudit('retrievalEmail', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objLoginDtl = JSON.parse(stBody);
  }

  try {
    webSession.sendPasswordRetrievalEmail(objLoginDtl.email);
  } catch (ex) {
    objDataResponse.hasError = true;
    objDataResponse.message = E$.parseError(ex);
  }

  E$.logAudit('retrievalEmail', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function logout(objRequest, objResponse) {
  E$.logAudit('register', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  webSession.logout();

  E$.logAudit('logout', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function register(objRequest, objResponse) {
  E$.logAudit('register', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objLoginDtl = JSON.parse(stBody);

    try {

      var objLoginResult = webSession.registerCustomer({
        firstname: objLoginDtl.firstname,
        lastname: objLoginDtl.lastname,
        email: objLoginDtl.email,
        password: objLoginDtl.password,
        password2: objLoginDtl.password2
      });

      E$.logDebug('register', 'objLoginResult: ' + JSON.stringify(objLoginResult));

      if (objLoginResult.customerid) {
        webSession = nlapiGetWebContainer().getShoppingSession();
        var webCustomer = webSession.getCustomer();
        objDataResponse.data.user = getCustomerData(webCustomer);
      } else {
        objDataResponse.hasError = true;
        objDataResponse.message = 'Registration failed.';
        objDataResponse.message = E$.parseError(ex);
      }
    } catch (ex) {
      objDataResponse.hasError = true;
      objDataResponse.message = E$.parseError(ex);
      E$.logDebug('register', E$.parseError(ex));
    }
  } else {

    objDataResponse.hasError = true;
    objDataResponse.message = 'Registration failed.';
  }

  E$.logAudit('register', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function resendActivation(objRequest, objResponse) {
  E$.logAudit('resendActivation', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {

    }
  };

  try {
    if (webSession.isLoggedIn2() == true) {
      var webCustomer = webSession.getCustomer();

      var objCust = getCustomerData(webCustomer);
      webCustomer.updateProfile({
        'internalid': objCust.id,
        customfields: {
          'custentity_es_resend_activation_email': 'T'
        }
      });

    }
  } catch (ex) {
    E$.logDebug('getUser', 'ex: ' + E$.parseError(ex));
    objDataResponse.hasError = true;
    objDataResponse.message = E$.parseError(ex);
  }

  E$.logAudit('resendActivation', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function isPasswordReset() {
  E$.logAudit('isPasswordReset', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      isPasswordReset: false
    }
  };

  objDataResponse.data.isPasswordReset = webSession.isChangePasswordRequest();

  E$.logAudit('isPasswordReset', '======END======');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function resetPassword(objRequest, objResponse) {
  E$.logAudit('resetPassword', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objPasswordDtl = JSON.parse(stBody);

    try {
      var bChanged = webSession.doChangePassword(objPasswordDtl.QueryString, objPasswordDtl.password);

      if (bChanged) {
        var webCustomer = webSession.getCustomer();
        objDataResponse.data.user = getCustomerData(webCustomer);
      } else {
        objDataResponse.hasError = true;
        objDataResponse.message = 'Password change failed.';
      }
    } catch (ex) {
      E$.logError('resetPassword', 'ex: ' + E$.parseError(ex));
      objDataResponse.hasError = true;
      objDataResponse.message = 'Password change failed.';
    }
  } else {

    objDataResponse.hasError = true;
    objDataResponse.message = 'Login failed.';
  }

  E$.logAudit('resetPassword', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function getUser(objRequest, objResponse) {
  E$.logAudit('getUser', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  try {
    objDataResponse.data.isLoggedIn = webSession.isLoggedIn2();
    if (webSession.isLoggedIn2() == true) {
      var webCustomer = webSession.getCustomer();

      objDataResponse.data.user = getCustomerData(webCustomer);

    }
  } catch (ex) {
    E$.logDebug('getUser', 'ex: ' + E$.parseError(ex));
    objDataResponse.hasError = true;
    objDataResponse.message = E$.parseError(ex);
  }

  E$.logAudit('getUser', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}


function login(objRequest, objResponse) {
  E$.logAudit('login', '=====START=====');

  var webSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objLoginDtl = JSON.parse(stBody);

    try {
      var objLoginResult = webSession.login(objLoginDtl);

      if (objLoginResult.customerid) {
        var webCustomer = webSession.getCustomer();

        objDataResponse.data.user = getCustomerData(webCustomer);
      } else {
        objDataResponse.hasError = true;
        objDataResponse.message = 'Login failed - No customer id.';
      }
    } catch (ex) {
      objDataResponse.hasError = true;
      objDataResponse.message = 'Login failed - Caught Error: ' + ex.message;
    }
  } else {

    objDataResponse.hasError = true;
    objDataResponse.message = 'Login failed - No body.';
  }

  E$.logAudit('login', '======END======');

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}


function getCustomerData(webCustomer) {

  var objCustData = webCustomer.getFieldValues([
    'internalid',
    'firstname',
    'lastname',
    'entityid',
    'email'
  ]);

  var objCustDataCustom = function (arr) {
    var objData = {};
    for (var idx=0; idx < arr.length; idx++) {
      var objCurData = arr[idx];
      objData[objCurData.name] = objCurData.value;
    }
    return objData;
  } (webCustomer.getCustomFieldValues());

  var objUser = {
    id: objCustData.internalid,
    firstname: objCustData.firstname,
    lastname: objCustData.lastname,
    entityid: objCustData.entityid,
    email: objCustData.email,
    activated: objCustDataCustom.custentity_es_has_user_activated == 'T',
    acceptTerms: objCustDataCustom.custentity_es_accept_bacb_terms == 'T'
  };

  return objUser;
}
