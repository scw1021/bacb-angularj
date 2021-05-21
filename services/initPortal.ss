var ACTIONS = {
  //test: _Test,
  login: _Login,
  logout: _Logout,
  getUser: _GetUser,
  // resendActivation: _ResendActivation,
  retrievalEmail: _RetrievalEmail,
  // heartbeat: _Heartbeat,
  // getPayMethods: _GetPayMethods,
  // resetPassword: _ResetPassword,
  // isPasswordReset: _IsPasswordReset,
  isLoggedIn: _IsLoggedIn
};

function service(objRequest, objResponse) {

  var stParam = objRequest.getParameter('param');

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }

}

// function _Test(objRequest, objResponse) {
//   E$.logAudit('Test initPortal.ss', '=====START=====');

//   var objDataResponse = {
//     Id: '',
//     FullName: '',
//     Address: { 'Address1': '', 'Address2': '', 'City': '', 'State': '', 'PostalCode': '', 'Country': '' },
//     BACBID: '',
//     Phone: '',
//     Email: '',
//     Applications: [],
//     Certifications: []
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
//   E$.logAudit('Test initPortal.ss', '=====END=====');
// }

function _Login(objRequest, objResponse) {
  E$.logAudit('Login initPortal.ss', '=====START=====');
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: 'F',
    Message: ''
  };
  nlapiLogExecution('AUDIT', 'IsLoggedIn', objSession.isLoggedIn());
  nlapiLogExecution('AUDIT', 'IsLoggedIn2', objSession.isLoggedIn2());
  nlapiLogExecution('AUDIT', 'IsRecognized', objSession.isRecognized());
  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);
    var objLoginCredentials = {
        "email": objBody.Email,
        "password": objBody.Password
    };
    E$.logAudit('Login initPortal.ss', 'objLoginCredentials defined: ' + JSON.stringify(objLoginCredentials));
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
  E$.logAudit('Login initPortal.ss', '=====END=====');
};

function _Logout(objRequest, objResponse) {
  E$.logAudit('Logout initPortal.ss', '=====START=====');
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Response: 'F',
    Message: '',
    Redirect: ''
  };
  try {
    objDataResponse.Redirect = objSession.logout();
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Logout Successful';
  }
  catch (ex) {
    objDataResponse.Response = 'F';
    objDataResponse.Message = _parseError(ex);
  }

  E$.logAudit('Logout initPortal.ss', 'Logout Data: ' + JSON.stringify(objDataResponse));
  E$.logAudit('Logout initPortal.ss', '=====END=====');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
};

function _GetUser(objRequest, objResponse) {
  E$.logAudit('GetUser initPortal', '=====START=====');
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Id: '',
    FirstName: '',
    MiddleName: '',
    LastName: '',
    BACBID: '',
    Phone: '',
    Email: '',
    Addresses: [],
    Applications: [],
    Certifications: []
  };

  try {
    if (objSession.isLoggedIn2() && objSession.isRecognized()) {
      objDataResponse.isLoggedIn = true;
      var objCustomer = objSession.getCustomer();
      objDataResponse.Id = objSession.getCustomer().getFieldValues().internalid;
      var CustomerData = _getCustomerData(objCustomer);

      E$.logAudit('GetUser initPortal', 'Customer Data: ' + JSON.stringify(CustomerData));
      objDataResponse.FirstName = CustomerData.firstname;
      objDataResponse.MiddleName = CustomerData.middlename;
      objDataResponse.LastName = CustomerData.lastname;
      objDataResponse.BACBID = CustomerData.entityid;
      objDataResponse.Phone = CustomerData.phone;
      objDataResponse.Email = CustomerData.email;

      var Address = { 'Address1': '',
                      'Address2': '',
                      'City': '',
                      'State': {'Id': '', 'Abbrev': '','Name': ''},
                      'Country': {'Id': '', 'Name': '', 'Enumeration': '', 'Abbrev': '', 'DialCode': ''},
                      'PostalCode': '',
                      'IsShipping': '',
                      'IsBilling' : '' };
      Address = _FindAddress(objCustomer,'Shipping');
      if (Address.IsBilling == 'F') {
        objDataResponse.Addresses.push(Address);
        objDataResponse.Addresses.push(_FindAddress(objCustomer, 'Billing'));
      }
      E$.logAudit('GetUser initPortal', 'Returned Data: ' + JSON.stringify(objDataResponse));
    }
  } catch (ex) {
    throw nlapiCreateError('ERROR', 'GetUser failed. ' + _parseError(ex) );
  }
  E$.logAudit('GetUser initPortal', '=====END=====');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
};

// function _ResendActivation(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {

//     }
//   };

//   try {
//     if (objSession.isLoggedIn2() == true) {
//       var objCustomer = objSession.getCustomer();

//       var objCust = _getCustomerData(objCustomer);
//       objCustomer.updateProfile({
//         'internalid': objCust.id,
//         customfields: {
//           'custentity_es_resend_activation_email': 'T'
//         }
//       });

//     }
//   } catch (ex) {

//     objDataResponse.hasError = true;
//     objDataResponse.message = _parseError(ex);
//   }

//   objResponse.setContentType('PLAINTEXT');ss
//   objResponse.write(JSON.stringify(objDataResponse));
// };

function _RetrievalEmail(objRequest, objResponse) {
  // objRequest looks like: com.netledger.app.common.scripting.version1.nlobjRequestImplV1@565c9ca9
  // E$.logAudit('Password Reset', 'objRequest: ' + objRequest);
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    hasError: false,
    message: '',
    data: {
      user: {}
    }
  };

  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);
  }

  try {
    objSession.sendPasswordRetrievalEmail2(objBody.email);
    E$.logAudit('Password Reset', 'Email sent to: ' + objBody.email);
    objDataResponse.message = 'Email sent to: ' + objBody.email;
  } catch (ex) {
    objDataResponse.hasError = true;
    objDataResponse.message = _parseError(ex);
  }

  // objDataResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

// function _Heartbeat(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {
//     }
//   };

//   try {
//     objDataResponse.data.isLoggedIn = objSession.isLoggedIn2();
//     if (objSession.isLoggedIn2() == true) {
//       var objCustomer = objSession.getCustomer();

//       objDataResponse.data.user = _getCustomerData(objCustomer);

//     }
//   } catch (ex) {
//     objDataResponse.hasError = true;
//     objDataResponse.message = _parseError(ex);
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// }

// function _GetPayMethods(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {
//       paymethods: []
//     }
//   };

//   try {
//     objDataResponse.data.paymethods = objSession.getPaymentMethods();
//   } catch (ex) {
//     objDataResponse.hasError = true;
//     objDataResponse.message = _parseError(ex);
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// };



// function _IsPasswordReset() {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {
//       isPasswordReset: false
//     }
//   };

//   objDataResponse.data.isPasswordReset = objSession.isChangePasswordRequest();

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// }

function _getCustomerData(objCustomer) {

  var objUser = (function (standard) {
    var retVal = {};
    // get standard customer fields
    for (var standardKey in standard) {
      retVal[standardKey] = standard[standardKey];
    }
    // get custom customer fields - currently no custom fields exsist in customer
    // for (var indexCustom=0; indexCustom < custom.length; indexCustom++) {
    //   retVal[custom[indexCustom].name] = custom[indexCustom].value;
    // }

    return retVal;
  } (objCustomer.getFieldValues()));

  return objUser;
}

 function _IsLoggedIn(objRequest, objResponse) {
  E$.logAudit('IsLoggedIn initPortal.ss', '=====START=====');

  var objSession = nlapiGetWebContainer().getShoppingSession();
  var objCustomer = objSession.getCustomer();

  var objDataResponse = {
    Response: 'F',
    Message: ''
  };

  var ShortCutLogout = true;
  try {
    objCustomer.getAddressBook();
  }
  catch (ex) {
    E$.logAudit('IsLoggedIn ERROR', 'getAddressBook failed. ' + _parseError(ex) + ' isLoggedIn2: ' + objSession.isLoggedIn2() + ' isRecognized: ' + objSession.isRecognized());
    objSession.logout();
    ShortCutLogout = false;
  }

  nlapiLogExecution('AUDIT', 'Login Customer', objSession.getCustomer().getFieldValues().name);
  nlapiLogExecution('AUDIT', 'IsLoggedIn', objSession.isLoggedIn());
  nlapiLogExecution('AUDIT', 'IsLoggedIn2', objSession.isLoggedIn2());
  nlapiLogExecution('AUDIT', 'IsRecognized', objSession.isRecognized());

  // FIXME - isLoggedIn is deprecated but also accurate? So IDK what that's all about
  if (ShortCutLogout && objSession.isLoggedIn()) {
    objDataResponse.Response = 'T';
    objDataResponse.Message = "Customer is logged in.";
  }
  // else if (ShortCutLogout && objSession.isRecognized() ) {
  //   objDataResponse.Response = 'T';
  //   objDataResponse.Message = "Customer is recognized.";
  // }
  else {
    objDataResponse.Response = 'F';
    objDataResponse.Message = "Customer not logged in.";
  }

  E$.logAudit('IsLoggedIn initPortal', 'Returned Data: ' + JSON.stringify(objDataResponse));

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));

  E$.logAudit('IsLoggedIn initPortal.ss', '=====END=====');
 };

function _FindAddressIndex(recCustomer, AddressType) {
  for (var stCount=(recCustomer.getLineItemCount('addressbook')-1); stCount >= 0; stCount--) {
      if (AddressType == "Shipping" && recCustomer.getLineItemValue('addressbook', 'is_default_ship_address', stCount) == 'T') {
          return stCount;
      }
      if (AddressType == "Billing" && recCustomer.getLineItemValue('addressbook', 'is_default_bill_address', stCount) == 'T') {
          return stCount;
      }
  }
  return null;
};

function _FindAddress(CustomerObj, AddressType) {
  var objAddress = {
    'Index': '',
    'Address1': '',
    'Address2': '',
    'City': '',
    'State': {'Id': '', 'Abbrev': '','Name': ''},
    'Country': {'Id': '', 'Name': '', 'Enumeration': '', 'Abbrev': '', 'DialCode': ''},
    'PostalCode': '',
    'IsShipping': 'F',
    'IsBilling': 'F'
  };
  var AddressBook = CustomerObj.getAddressBook();
  if (typeof AddressBook === 'array' && typeof AddressBook.length !== 'undefined') {
    for (var stIndex = 0; stIndex < AddressBook.length; stIndex++) {
      if (AddressType == "Shipping" && AddressBook[stIndex].defaultshipping){
          objAddress = {
            Index: AddressBook[stIndex].internalid,
            Address1: AddressBook[stIndex].addr1,
            Address2: AddressBook[stIndex].addr2,
            City: AddressBook[stIndex].city,
            State: {'Id': '',
                    'Abbrev' : '',
                    'Name': AddressBook[stIndex].state},
            Country: {'Id': '',
                      'Name': AddressBook[stIndex].country,
                      'Enumeration': '',
                      'Abbrev': '',
                      'DialCode': ''},
            PostalCode: AddressBook[stIndex].zip,
            IsShipping: defaultshipping,
            IsBilling: defaultbilling,
          };
      }
      else if (Addresstype == "Billing" && AddressBook[stIndex].defaultbilling) {
        objAddress = {
          Index: AddressBook[stIndex].internalid,
          Address1: AddressBook[stIndex].addr1,
          Address2: AddressBook[stIndex].addr2,
          City: AddressBook[stIndex].city,
          State: {'Id': '',
                  'Abbrev' : '',
                  'Name': AddressBook[stIndex].state},
          Country: {'Id': '',
                    'Name': AddressBook[stIndex].country,
                    'Enumeration': '',
                    'Abbrev': '',
                    'DialCode': ''},
          PostalCode: AddressBook[stIndex].zip,
          IsShipping: defaultshipping,
          IsBilling: defaultbilling,
        };
      }
    }
  }
  return objAddress;
}

function _ViewAddress(recCustomer, AddressType, iAddressIndex) {


  if (!iAddressIndex){
      iAddressIndex = _FindAddressIndex(recCustomer, AddressType);
  }
  if (iAddressIndex != null) {
      recCustomer.selectLineItem('addressbook', iAddressIndex);
      var recAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
      if (stAddIndex) {
          objAddress = {
              Index: iAddressIndex,
              Address1: recAddress.getFieldValue('addr1'),
              Address2: recAddress.getFieldValue('addr2'),
              City: recAddress.getFieldValue('city'),
              State: {'Id': recAddress.getFieldValue('statedropdown'),
                      'Abbrev' : '',
                      'Name': recAddress.getFieldText('statedropdown')},
              Country: {'Id': '',
                        'Name': recAddress.getFieldText('country'),
                        'Enumeration': recAddress.getFieldValue('country'),
                        'Abbrev': '',
                        'DialCode': ''},
              PostalCode: recAddress.getFieldValue('zip'),
              IsShipping: recAddress.getFieldValue('is_default_ship_address'),
              IsBilling: recAddress.getFieldValue('is_default_bill_address'),

          }
      }
  }
  return objAddress;
};

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


function _GetUserExt(objRequest, objResponse) {
  E$.logAudit('GetUser initPortal', '=====START=====');
  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
    Id: '',
    FirstName: '',
    MiddleName: '',
    LastName: '',
    FullName: '',
    BACBID: '',
    Phone: '',
    Email: '',
    Addresses: [],
    Applications: [],
    Certifications: []
  };

  try {
    if (objSession.isLoggedIn2() && objSession.isRecognized()) {
      objDataResponse.isLoggedIn = true;
      var objCustomer = objSession.getCustomer();
      objDataResponse.Id = objSession.getCustomer().getFieldValues().internalid;
      var CustomerData = _getCustomerData(objCustomer);

      E$.logAudit('GetUser initPortal', 'Customer Data: ' + JSON.stringify(CustomerData));
      objDataResponse.FirstName = CustomerData.firstname;
      objDataResponse.MiddleName = CustomerData.middlename;
      objDataResponse.LastName = CustomerData.lastname;
      objDataResponse.FullName = CustomerData.firstname + ' ' + CustomerData.lastname;
      objDataResponse.BACBID = CustomerData.entityid;
      objDataResponse.Phone = CustomerData.phone;
      objDataResponse.Email = CustomerData.email;

      var Address = { 'Address1': '',
                      'Address2': '',
                      'City': '',
                      'State': {'Id': '', 'Abbrev': '','Name': ''},
                      'Country': {'Id': '', 'Name': '', 'Enumeration': '', 'Abbrev': '', 'DialCode': ''},
                      'PostalCode': '',
                      'IsShipping': '',
                      'IsBilling' : '' };
      Address = _FindAddress(objCustomer,'Shipping');
      if (Address.IsBilling == 'F') {
        objDataResponse.Addresses.push(Address);
        objDataResponse.Addresses.push(_FindAddress(objCustomer, 'Billing'));
      }
      E$.logAudit('GetUser initPortal', 'Returned Data: ' + JSON.stringify(objDataResponse));
    }
  } catch (ex) {
    throw nlapiCreateError('ERROR', 'GetUser failed. ' + _parseError(ex) );
  }
  E$.logAudit('GetUser initPortal', '=====END=====');
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
};
