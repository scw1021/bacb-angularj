var ACTIONS = {
  Find: _Find,
  Read: _Read,
  Register: _Register,
  translate: _TranslateUsername,
  login: _TranslateLogin,
  ValidateUsername: _ValidateUsername,
  ValidateEmail: _ValidateEmail,
  Update: _Update,
  Reset: _ResetPassword,
  ResolveUrl: _ResolveUrl
};



function _ResolveUrl(objRequest, objResponse) {
  E$.logAudit("ResolveURL elevatedPortal", "=====START=====");
  var _response = {
    Response: 'F',
    Message: 'Record could not be created'
  }
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    _response.Message = objRxData.email;
  }
  else {
    nlapiLogExecution(
      "ERROR - ResolveURL",
      "INVALID_BODY",
      "Body of the request is not defined."
    );
  }

  var resolvedUrl = nlapiResolveURL('SUITELET','customscript_customer_registration','customdeploy_customer_registration',true );
  // Dev 3
  // var resolvedUrl = "https://2058484.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=100&deploy=1&compid=2058484&h=73ef1293e04907c12244";
  // Dev 5
  // var resolvedUrl = "https://2058486.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=164&deploy=1&compid=2058486&h=b1997b4092b5cc4a36d3";
  try {
    // FIXME if this works to include all other fields allowed
    resolvedUrl  = resolvedUrl
      + "&firstname=" + objRxData.FirstName
      + "&middlename=" + objRxData.MiddleName
      + "&lastname=" + objRxData.LastName
      + "&email=" + objRxData.Email
      + "&phone=" + objRxData.Phone.Number
      + "&altphone=" + objRxData.AltPhone.Number
      + "&country=" + objRxData.Phone.Country.Id
      + "&altcountry=" + objRxData.AltPhone.Country.Id
      + "&ext=" + objRxData.Phone.Ext
      + "&altext=" + objRxData.AltPhone.Ext
      + "&prefix=" + objRxData.Prefix.Id
      + "&suffix=" + objRxData.Suffix.Id
      + "&password=" + objRxData.Password1
      + "&password2=" + objRxData.Password2;

    E$.logAudit("ResolveURL request", resolvedUrl);
    var resolvedResponse = nlapiRequestURL(resolvedUrl).getBody();

    var responseObj = JSON.parse(resolvedResponse);
    E$.logAudit("ResolveURL response", JSON.stringify(responseObj));

    _response.Response = 'T';
    _response.Message = responseObj.data.ID;
  }
  catch ( errorMessage ) {
    nlapiLogExecution(
      "ERROR",
      "Registration Failed",
      "The attempt to register the user failed: " + _parseError(errorMessage)
    );
  }
  objResponse.setContentType("JSON");
  objResponse.write(JSON.stringify(_response));
  E$.logAudit("Final response", JSON.stringify(_response));
  E$.logAudit("ResolveURL elevatedPortal", "=====END=====");
}






function service(objRequest, objResponse) {
  var stParam = objRequest.getParameter("param");

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }
}

function _Find(objRequest, objResponse) {
  // E$.logAudit("FIND elevatedPortal", "=====START=====");
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Id: "",
    BACBID: "",
    Name: ""
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution(
      "ERROR - FIND",
      "INVALID_BODY",
      "Body of the request is not defined."
    );
  }

  try {
    var arrFilters = [
      new nlobjSearchFilter("entityId", null, "is", objRxData.BACBID)
    ];

    var arrColumns = [
      new nlobjSearchColumn("entityid"),
      new nlobjSearchColumn("firstname"),
      new nlobjSearchColumn("lastname")
    ];

    var Customers = nlapiSearchRecord("customer", null, arrFilters, arrColumns);
  } catch (ex) {
    nlapiLogExecution(
      "ERROR - FIND",
      "SEARCH_FAILED",
      "The search for the user failed: " + _parseError(ex)
    );
  }
  if (Customers instanceof Array && Customers.length) {
    for (var stIndex in Customers) {
      objDataResponse.Id = Customers[stIndex].getId();
      objDataResponse.BACBID = Customers[stIndex].getValue(arrColumns[0]);
      objDataResponse.Name =
        Customers[stIndex].getValue(arrColumns[1]) +
        " " +
        Customers[stIndex].getValue(arrColumns[2]);
    }
  } else {
    objDataResponse.Id = Customers.getId();
    objDataResponse.BACBID = Customers.getValue(arrColumns[0]);
    objDataResponse.Name =
      Customers.getValue(arrColumns[1]) +
      " " +
      Customers.getValue(arrColumns[2]);
  }

  // objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit("FIND elevatedPortal", "=====END=====");
}

function _Read(objRequest, objResponse) {
  // E$.logAudit("READ elevatedPortal", "=====START=====");
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Array: []
  };

  try {
    var arrColumns = [
      new nlobjSearchColumn("entityid"),
      new nlobjSearchColumn("firstname"),
      new nlobjSearchColumn("lastname")
    ];

    var Customers = nlapiSearchRecord("customer", null, null, arrColumns);
  } catch (ex) {
    nlapiLogExecution("ERROR - READ", "SEARCH_FAILED", "The search for customers failed: " + _parseError(ex));
  }
  if (Customers instanceof Array && Customers.length) {
    for (var stIndex in Customers) {
      objDataResponse.Array.push({
        'Id': Customers[stIndex].getId(),
        'BACBID': Customers[stIndex].getValue(arrColumns[0]),
        'Name': Customers[stIndex].getValue(arrColumns[1]) + " " +
                Customers[stIndex].getValue(arrColumns[2])
      });
    }
  } else {
    objDataResponse.Array.push({
      'Id': Customers.getId(),
      'BACBID': Customers.getValue(arrColumns[0]),
      'Name': Customers.getValue(arrColumns[1]) + " " +
              Customers.getValue(arrColumns[2])
    });
  }

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  // E$.logAudit("READ elevatedPortal", "=====END=====");
}

function _Register(objRequest, objResponse) {
  // E$.logAudit("REGISTER elevatedPortal", "=====START=====");
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: false,
    Message: ""
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);

    var filters = [];
    E$.logAudit(
      "REGISTER",
      "Seaching for customer record: " + JSON.stringify(objBody)
    );
    filters[0] = new nlobjSearchFilter(
      "email",
      null,
      "is",
      objBody.Email
    );

    try {
      var customers = nlapiSearchRecord("customer", null, filters, null);
    } catch (ex) {
      nlapiLogExecution("ERROR", "SEARCH FAILED", "The attempt to SEARCH for a customer record failed.:" + ex.message);
    }
    if (!customers) {
      var CustomerId = 0;
      E$.logAudit("REGISTER", "No Email Found, attempting to Register: " + objBody.Email);
      var objRegistration = objSession.registerCustomer({
        // companyname: objBody.Username,
        firstname: objBody.FirstName,
        lastname: objBody.LastName,
        email: objBody.Email,
        password: objBody.Password1,
        password2: objBody.Password2
      });

      if (objRegistration.customerid) {
        // objSession = nlapiGetWebContainer().getShoppingSession();
        // var objCustomer = objSession.getCustomer();
        try {
          // Create profile record
          var recProfile = nlapiCreateRecord("customrecord_profile", {
            recordmode: "dynamic"
          });
          recProfile.setFieldValue(
            "custrecord_customer",
            objRegistration.customerid
          );
          recProfile.setFieldValue(
            "custrecord_profile_prefix",
            objBody.Prefix ? objBody.Prefix.Id : null
          );
          recProfile.setFieldValue(
            "custrecord_profile_suffix",
            objBody.Suffix ? objBody.Suffix.Id : null
          );
          recProfile.setFieldValue(
            "custrecord_primary_phone_country_code",
            objBody.Phone.Country.DialCode
          );
          recProfile.setFieldValue(
            "custrecord_secondary_phone_country_code",
            objBody.AltPhone ? objBody.AltPhone.Country.DialCode : null
          );
          recProfile.setFieldValue(
            "custrecord_profile_primary_ext",
            objBody.Phone.Ext ? objBody.Phone.Ext : null
          );
          recProfile.setFieldValue(
            "custrecord_profile_secondary_ext",
            objBody.AltPhone ? objBody.AltPhone.Ext : null
          );
          objDataResponse.ProfileId = nlapiSubmitRecord(recProfile, true, true);
        } catch (ex) {
          nlapiLogExecution(
            "ERROR",
            "Register FAILED",
            "CREATE profile attempt failed: " + _parseError(ex)
          );
        }
        CustomerId = objRegistration.customerid;
        if (CustomerId) {
          objDataResponse.Response = true;
          objDataResponse.Message = CustomerId.toString();
            // update customer record as customer
            // try {
            //   _Update(objRequest, objResponse);
            // }
            // catch (ex) {
            //   nlapiLogExecution(
            //     "ERROR",
            //     "UPDATE FAILED",
            //     "The attempt to update the customer record failed: " + _parseError(ex)
            //   );
            //   nlapiLogExecution(
            //     "ERROR",
            //     "UPDATE objResponse",
            //     JSON.stringify(objResponse)
            //   );
            // }
        }
        // try {
        //     // Update customer record
        //     var recCustomer = nlapiLoadRecord('customer', objRegistration.customerid);
        //     recCustomer = setFieldValue('middlename',objBody.middlename);
        //     recCustomer = setFieldValue('phone', objBody.primaryphone);
        //     recCustomer = setFieldValue('altphone', objBody.secondaryphone);
        //     recCustomer = setFieldValue('mobilephone', objBody.mobilephone);
        //     recCustomer = setFieldValue('fax', objBody.faxnumber);
        //     var intCustomerId = nlapiSubmitRecord(recCustomer, true, true);
        // } catch (ex) {
        //   objDataResponse.hasError = true;
        //   objDataResponse.message = "Register customer attempt failed: " + _parseError(ex);
        // }
        // objDataResponse.data.user = _GetCustomerData(objCustomer);
        // objSession.logout();
      } else {
        nlapiLogExecution(
          "ERROR",
          "Register FAILED",
          "An account already exists for that Email."
        );
        objDataResponse.Message =
          "An account already exists for that email.";
      }
    } else {
      //customer username already found!
      nlapiLogExecution("ERROR", "Register FAILED", "No Customer ID returned");
      objDataResponse.Message = "No Customer ID returned";
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "Register FAILED",
      "Registration failed - Bad Body."
    );
    objDataResponse.Message = "Registration failed - Bad Body.";
  }
  var objLogoutDataResponse = {
    Response: 'F',
    Message: '',
    Redirect: ''
  };
  try {
    objLogoutDataResponse.Redirect = objSession.logout();
    objLogoutDataResponse.Response = 'T';
    objLogoutDataResponse.Message = 'Logout Successful';
  }
  catch (ex) {
    objLogoutDataResponse.Response = 'F';
    objLogoutDataResponse.Message = _parseError(ex);
  }

  // E$.logAudit('Logout elevatedPortal.ss', 'Registration Logout Data: ' + JSON.stringify(objLogoutDataResponse));

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  // E$.logAudit("REGISTER elevatedPortal", "=====END=====");
}

function _TranslateUsername(objRequest, objResponse) {
  // E$.logAudit("TRANSLATE elevatedPortal", "=====START=====");

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    E$.logAudit(
      "TRANSLATE elevatedPortal",
      "Body Object: " + JSON.stringify(objRxData)
    );

    var objDataResponse = {
      Username: objRxData.Username,
      Email: "",
      Password: ""
    };

    var arrFilters = [
      new nlobjSearchFilter("companyname", null, "is", objRxData.Username)
    ];

    var arrColumns = [new nlobjSearchColumn("email")];

    var customers = nlapiSearchRecord("customer", null, arrFilters, arrColumns);

    if (true) {
      objDataResponse.Email = customers.shift().getValue(arrColumns[0]);
      //objDataResponse.Email = "jevaluator@unique.com";
      E$.logAudit(
        "TRANSLATE elevatedPortal",
        "Username Found return data object: " + JSON.stringify(objDataResponse)
      );
    } else {
      nlapiLogExecution(
        "ERROR",
        "TRANSLATE FAILED",
        "The attempt to find the username failed: "
      );
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "TRANSLATE FAILED",
      "Body of returned object is undefined."
    );
  }

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  // E$.logAudit("TRANSLATE elevatedPortal", "=====END=====");
}

function _ValidateUsername(objRequest, objResponse) {
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);

    // Sanitize incoming data for obvious reasons
    var objDataResponse = {
      Message: ""
    };
    // Get Username checked out, but skip if null
    if (objRxData.Username != null) {
      var arrUsernameFilters = [
        new nlobjSearchFilter("companyname", null, "is", objRxData.Username)
      ];
      var arrUsernameColumns = [new nlobjSearchColumn("companyname")];
      var customersByUsername = nlapiSearchRecord(
        "customer",
        null,
        arrUsernameFilters,
        arrUsernameColumns
      );
      try {
        objDataResponse.Message = customersByUsername
          .shift()
          .getValue(arrUsernameColumns[0]);
      } catch (error) {
        // ignore because it just means we didn't find the username
      }
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "ValidateUsername FAILED",
      "Body of REQUESTED object is undefined."
    );
  }
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _ValidateEmail(objRequest, objResponse) {
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);

    // Sanitize incoming data for obvious reasons
    var objDataResponse = {
      Message: ""
    };
    // Get Email checked out
    if (objRxData.Email != null) {
      var arrEmailFilters = [
        new nlobjSearchFilter("email", null, "is", objRxData.Email)
      ];
      var arrEmailColumns = [new nlobjSearchColumn("email")];
      var customersByEmail = nlapiSearchRecord(
        "customer",
        null,
        arrEmailFilters,
        arrEmailColumns
      );
      try {
        objDataResponse.Message = customersByEmail
          .shift()
          .getValue(arrEmailColumns[0]);
      } catch (error) {
        // ignore because it just means we didn't find the username
      }
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "ValidateUsername FAILED",
      "Body of REQUESTED object is undefined."
    );
  }
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Update(objRequest, objResponse) {
  E$.logAudit("UPDATE elevatedPortal", "=====START=====");
  var objSession = nlapiGetWebContainer().getShoppingSession();
  var objCustomer = objSession.getCustomer();
  var stCustId = objCustomer.getFieldValues().internalid;

  var objDataResponse = {
    Response: false,
    Message: ""
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);
    var CustomerId = 0;
    try {
      // Update customer record
      nlapiLogExecution(
        "DEBUG",
        "UPDATE Object",
        "ID:" + stCustId + " Body:" + JSON.stringify(objBody)
      );
      var recCustomer = nlapiLoadRecord("customer", stCustId);
      nlapiLogExecution(
        "DEBUG",
        "UPDATE: CustomerObj",
        JSON.stringify(recCustomer)
      );
      // recCustomer.setFieldValue("entitystatus",{
      //   "internalid": "17",
      //   "name": "CUSTOMER-Good Standing"
      // });
      recCustomer.setFieldValue("entitystatus",17);
      // recCustomer.setFieldValue("stage", "CUSTOMER");
      recCustomer.setFieldValue("isperson", "T");
      recCustomer.setFieldValue("giveaccess","T");
      // if ( objBody.MiddleName ) {
      //   recCustomer.setFieldValue("middlename", objBody.MiddleName);
      // } else {
      //   recCustomer.setFieldValue("middlename", "");
      // }
      recCustomer.setFieldValue("phone", objBody.Phone.Number);
      // if (objBody.AltPhone) {
      //   recCustomer.setFieldValue("altphone", objBody.AltPhone.Number);
      // } else {
      //   recCustomer.setFieldValue("altphone",null);
      // }
      // if ( objBody.MobilePhone ) {
      //   recCustomer.setFieldValue("mobilephone",objBody.MobilePhone.Number);
      // } else {
      //   recCustomer.setFieldValue("mobilephone", null);
      // }
      nlapiLogExecution(
        "DEBUG",
        "UPDATE Object before submission",
        JSON.stringify(recCustomer)
      );
      CustomerId = nlapiSubmitRecord(recCustomer, true, true);
    } catch (ex) {
      nlapiLogExecution(
        "ERROR",
        "UPDATE FAILED",
        "The attempt to update the customer record failed: " + _parseError(ex)
      );
      objDataResponse.Message =
        "The attempt to update the customer record failed: " + _parseError(ex);
    }
    if (CustomerId) {
      objDataResponse.Response = true;
      objDataResponse.Message = "Update completed successfully.";
    }
  }
  // objSession.logout();

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit("UPDATE elevatedPortal", "=====END=====");
}

function _GetCustomerData(objCustomer) {
  var objUser = (function(standard) {
    var retVal = {};
    // get standard customer fields
    for (var standardKey in standard) {
      retVal[standardKey] = standard[standardKey];
    }
    // get custom customer fields
    //for (var indexCustom=0; indexCustom < custom.length; indexCustom++) {
    //  retVal[custom[indexCustom].name] = custom[indexCustom].value;
    //}

    return retVal;
  })(objCustomer.getFieldValues());

  return objUser;
}

function _ResetPassword(objRequest, objResponse) {
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: "",
    Message: ""
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);

    try {
      var bChanged = objSession.doChangePassword(
        objBody.QueryString,
        objBody.password
      );

      if (bChanged) {
        objDataResponse.Response = "T";
      } else {
        objDataResponse.Response = "F";
        objDataResponse.Message = "Password change failed.";
      }
    } catch (ex) {
      objDataResponse.Response = "F";
      objDataResponse.Message = "Password change failed.";
    }
  } else {
    objDataResponse.Response = "F";
    objDataResponse.Message = "Login failed.";
  }

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _parseError(ErrorObj) {
  var errorText = "";

  if (ErrorObj instanceof nlobjError) {
    errorText = "UNEXPECTED ERROR: " + "\n\n";
    errorText += "Script Name: " + ErrorObj.getUserEvent() + "\n";
    errorText += "Error Code: " + ErrorObj.getCode() + "\n";
    errorText += "Error Details: " + ErrorObj.getDetails() + "\n\n";
    errorText += "Stack Trace: " + ErrorObj.getStackTrace();
  } else {
    errorText = "UNEXPECTED ERROR: " + "\n\n";
    errorText += "Error Details: " + ErrorObj.toString();
  }

  return errorText;
}


function _TranslateLogin(objRequest, objResponse) {
  E$.logAudit("TRANSLATE elevatedPortal", "=====START=====");

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    E$.logAudit(
      "TRANSLATE elevatedPortal",
      "Body Object: " + JSON.stringify(objRxData)
    );

    var objDataResponse = {
      Username: objRxData.Username,
      Email: "",
      Password: ""
    };

    var arrFilters = [
      new nlobjSearchFilter("companyname", null, "is", objRxData.Username)
    ];

    var arrColumns = [new nlobjSearchColumn("email")];

    var customers = nlapiSearchRecord("customer", null, arrFilters, arrColumns);

    if (true) {
      objDataResponse.Email = customers.shift().getValue(arrColumns[0]);
      //objDataResponse.Email = "jevaluator@unique.com";
      E$.logAudit(
        "TRANSLATE elevatedPortal",
        "Username Found return data object: " + JSON.stringify(objDataResponse)
      );
    } else {
      nlapiLogExecution(
        "ERROR",
        "TRANSLATE FAILED",
        "The attempt to find the username failed: "
      );
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "TRANSLATE FAILED",
      "Body of returned object is undefined."
    );
  }

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  // E$.logAudit("TRANSLATE elevatedPortal", "=====END=====");

  // E$.logAudit('Login initPortal.ss', '=====START=====');
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: 'F',
    Message: ''
  };

  // E$.logAudit('Login initPortal.ss', 'got here: ' + JSON.stringify(objDataResponse));
  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);
    var objLoginCredentials = {
        "email": objBody.Email,
        "password": objBody.Password
    };
    // E$.logAudit('Login initPortal.ss', 'objLoginCredentials defined: ' + JSON.stringify(objLoginCredentials));
    // if (objSession.isLoggedIn2() && objSession.isRecognized()) {
    //   objDataResponse.Response = true;
    //   objDataResponse.Message = 'Username already logged in.';
    //   E$.logAudit('Login initPortal.ss', 'already logged in: ' + JSON.stringify(objDataResponse));
    // }
    if (objLoginCredentials.email != '' && objLoginCredentials.password != '') {
      E$.logAudit('Login initPortal.ss', 'NOT - already logged in: ' + JSON.stringify(objLoginCredentials));
      // email for login coming from translateUsername in elevatedPortal.ss
      if (objLoginCredentials.email) {
        try {
          var objLoginResult = objSession.login(objLoginCredentials);

          if (objLoginResult.customerid > 0) {
            objDataResponse.Response = 'T';
            objDataResponse.Message = 'Login Successful, CustomerID = ' + objLoginResult.customerid;
            E$.logAudit('Login initPortal.ss', 'Login Successful: ' + JSON.stringify(objLoginResult));
          }
        } catch (ex) {
          nlapiLogExecution('ERROR', 'LOGIN FAILED', 'The attempt to login failed: ' + ex.message);
          objDataResponse.Message = 'The attempt to login failed: ' + ex.message;
        }
      }
    }
  } else {
    nlapiLogExecution('ERROR', 'LOGIN FAILED', 'Bad body: ' + ex.message);
    objDataResponse.Message = 'Bad body: ' + ex.message;
  }

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  // E$.logAudit('Login initPortal.ss', '=====END=====');


}
