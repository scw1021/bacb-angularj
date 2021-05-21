var ACTIONS = {
  //test: _Test,
  // login: _Login,
  // logout: _Logout,
  // getUser: _GetUser,
  // resendActivation: _ResendActivation,
  // retrievalEmail: _RetrievalEmail,
  // heartbeat: _Heartbeat,
  // getPayMethods: _GetPayMethods,
  // resetPassword: _ResetPassword,
  // isPasswordReset: _IsPasswordReset,
  Test: _Test,
  // isLoggedIn: _IsLoggedIn
};

function service(objRequest, objResponse) {

  var stParam = objRequest.getParameter('param');

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }

}
function _Test( objRequest, objResponse ) {
  var stBody = objRequest.getBody();
  if (stBody) {
    var objBody = JSON.parse(stBody);
  }
  const SCRIPT_NAME = 'customrecord_' + objBody.Record;
  objDataResponse = {
    Response: 'T',
    Message: 'Record found',
    Data: {}
  }
  try{
    var testSearch = nlapiSearchRecord( SCRIPT_NAME);
    if ( !testSearch ) {
      objDataResponse.Data = 'No records found for ' +  SCRIPT_NAME;
    }
    var testRecord = nlapiLoadRecord(SCRIPT_NAME, testSearch[0].getId());
    var fields = testRecord.getAllFields();
    var results = [];
    // DYK there's like, DOZENS of random fields that we can't see or specify?
    var regex = new RegExp(/^custrecord_.+/);
    for (var i in fields) {
      if ( regex.test(fields[i])){
        results.push(fields[i]);
      }
    }
    objDataResponse.Data = results.sort();
  }
  catch ( ex ) {
    objDataResponse.Response = 'F';
    objDataResponse.Message = 'Failed to get a record';
    objDataResponse['ErrorMessage'] = ex;
  }
  objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
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

// function _Login(objRequest, objResponse) {
//   E$.logAudit('Login initPortal.ss', '=====START=====');
//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     Response: false,
//     Message: ''
//   };

//   E$.logAudit('Login initPortal.ss', 'got here: ' + JSON.stringify(objDataResponse));
//   var stBody = objRequest.getBody();
//   if (stBody) {
//     var objBody = JSON.parse(stBody);
//     E$.logAudit('Login initPortal.ss', 'body defined: ' + JSON.stringify(objBody));
//     if (objSession.isLoggedIn2() && objSession.isRecognized()) {
//       objDataResponse.Response = true;
//       objDataResponse.Message = 'Username already logged in.';
//       E$.logAudit('Login initPortal.ss', 'already logged in: ' + JSON.stringify(objDataResponse));
//     }
//     else {
//       E$.logAudit('Login initPortal.ss', 'NOT - already logged in: ' + JSON.stringify(objBody));
//       // email for login coming from translateUsername in elevatedPortal.ss
//       if (objBody.Email) {
//         try {
//           var objLoginResult = objSession.login(objBody);

//           if (objLoginResult.customerid > 0) {
//             objDataResponse.Response = true;
//             objDataResponse.Message = 'Login Successful, CustomerID = ' + objLoginResult.customerid.toString;
//             E$.logAudit('Login initPortal.ss', 'Login Successful: ' + JSON.stringify(objLoginResult));
//           }
//         } catch (ex) {
//           nlapiLogExecution('ERROR', 'LOGIN FAILED', 'The attempt to login failed: ' + ex.message);
//           objDataResponse.Message = 'The attempt to login failed: ' + ex.message;
//         }
//       }
//     }
//   } else {
//     nlapiLogExecution('ERROR', 'LOGIN FAILED', 'Bad body: ' + ex.message);
//     objDataResponse.Message = 'Bad body: ' + ex.message;
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
//   E$.logAudit('Login initPortal.ss', '=====END=====');
// };

// function _Logout(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     Response: false,
//     Message: ''
//   };

//   try {
//     objSession.logout();
//   }
//   catch (ex) {
//     objDataResponse.Response = true;
//     objDataResponse.Message = _parseError(ex);
//   }

//   if (!objDataResponse.Response) {
//     objDataResponse.Message = 'Logout Successful';
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// };

// function _GetUser(objRequest, objResponse) {
//   E$.logAudit('GetUser initPortal', '=====START=====');
//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     Id: '',
//     FullName: '',
//     BACBID: '',
//     Phone: '',
//     Email: '',
//     Addresses: [],
//     Applications: [],
//     Certifications: []
//   };

//   try {
//     if (objSession.isLoggedIn2() && objSession.isRecognized()) {
//       objDataResponse.isLoggedIn = true;
//       var objCustomer = objSession.getCustomer();
//       objDataResponse.Id = objSession.getCustomer().getFieldValues().internalid;
//       var CustomerData = _getCustomerData(objCustomer);
//       objDataResponse.FullName = CustomerData.altname;
//       objDataResponse.BACBID = CustomerData.entityid;
//       objDataResponse.Phone = CustomerData.phone;
//       objDataResponse.Email = CustomerData.email;

//       var Address = { 'Address1': '',
//                       'Address2': '',
//                       'City': '',
//                       'State': {'Id': '', 'Abbrev': '','Name': ''},
//                       'Country': {'Id': '', 'Name': '', 'Enumeration': '', 'Abbrev': '', 'DialCode': ''},
//                       'PostalCode': '',
//                       'IsShipping': '',
//                       'IsBilling' : '' };
//       Address = _ViewAddress(objDataResponse.Id,'Shipping');
//       if (Address.IsBilling == 'F') {
//         objDataResponse.Addresses.push(Address);
//         objDataResponse.Addresses.push(_ViewAddresses(ObjdataResponse.Id, 'Billing'));
//       }
//     }
//   } catch (ex) {
//     throw nlapiCreateError('ERROR', 'GetUser failed. ' + _parseError(ex) );
//   }
//   E$.logAudit('GetUser initPortal', '=====END=====');
//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// };

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

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// };

// function _RetrievalEmail(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {
//       user: {}
//     }
//   };

//   var stBody = objRequest.getBody();
//   if (stBody) {
//     var objBody = JSON.parse(stBody);
//   }

//   try {
//     objSession.sendPasswordRetrievalEmail2(objBody.email);
//   } catch (ex) {
//     objDataResponse.hasError = true;
//     objDataResponse.message = _parseError(ex);
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// }

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

// function _ResetPassword(objRequest, objResponse) {

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     hasError: false,
//     message: '',
//     data: {
//       user: {}
//     }
//   };

//   var stBody = objRequest.getBody();
//   if (stBody) {
//     var objBody = JSON.parse(stBody);

//     try {
//       var bChanged = objSession.doChangePassword(objBody.QueryString, objBody.password);

//       if (bChanged) {
//         var objCustomer = objSession.getCustomer();
//         objDataResponse.data.user = _getCustomerData(objCustomer);
//       } else {
//         objDataResponse.hasError = true;
//         objDataResponse.message = 'Password change failed.';
//       }
//     } catch (ex) {

//       objDataResponse.hasError = true;
//       objDataResponse.message = 'Password change failed.';
//     }
//   } else {

//     objDataResponse.hasError = true;
//     objDataResponse.message = 'Login failed.';
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));
// }

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

// function _getCustomerData(objCustomer) {

//   var objUser = (function (standard) {
//     var retVal = {};
//     // get standard customer fields
//     for (var standardKey in standard) {
//       retVal[standardKey] = standard[standardKey];
//     }
//     // get custom customer fields - currently no custom fields exsist in customer
//     // for (var indexCustom=0; indexCustom < custom.length; indexCustom++) {
//     //   retVal[custom[indexCustom].name] = custom[indexCustom].value;
//     // }

//     return retVal;
//   } (objCustomer.getFieldValues()));

//   return objUser;
// }

// function _IsLoggedIn(objRequest, objResponse) {
//   E$.logAudit('IsLoggedIn initPortal.ss', '=====START=====');

//   var objSession = nlapiGetWebContainer().getShoppingSession();

//   var objDataResponse = {
//     Response: false,
//     Message: ''
//   };

//   if (objSession.isLoggedIn2() && objSession.isRecognized()) {
//     objDataResponse.Response = true;
//     objDataResponse.Message = "Customer is logged in.";
//   }
//   else {
//     objDataResponse.Response = false;
//     objDataResponse.Message = "Customer not logged in.";
//   }

//   objResponse.setContentType('PLAINTEXT');
//   objResponse.write(JSON.stringify(objDataResponse));

//   E$.logAudit('IsLoggedIn initPortal.ss', '=====END=====');
// };

// function _FindAddressIndex(recCustomer, AddressType) {
//   for (var stCount=(recCustomer.getLineItemCount('addressbook')-1); stCount >= 0; stCount--) {
//       if (AddressType == "Shipping" && recCustomer.getLineItemValue('addressbook', 'is_default_ship_address', stCount) == 'T') {
//           return stCount;
//       }
//       if (AddressType == "Billing" && recCustomer.getLineItemValue('addressbook', 'is_default_bill_address', stCount) == 'T') {
//           return stCount;
//       }
//   }
//   return null;
// };

// function _ViewAddress(recCustomer, AddressType, iAddressIndex=0) {
//   var objAddress = {
//       Index: '',
//       Address1: '',
//       Address2: '',
//       City: '',
//       'State': {'Id': '', 'Abbrev': '','Name': ''},
//       'Country': {'Id': '', 'Name': '', 'Enumeration': '', 'Abbrev': '', 'DialCode': ''},
//       PostalCode: '',
//       IsShipping: 'F',
//       IsBilling: 'F'
//   };
//   if (iAddressIndex === 0){
//       iAddressIndex = _FindAddressIndex(recCustomer, AddressType);
//   }
//   if (iAddressIndex != null) {
//       recCustomer.selectLineItem('addressbook', iAddressIndex);
//       var recAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
//       if (stAddIndex) {
//           objAddress = {
//               Index: iAddressIndex,
//               Address1: recAddress.getFieldValue('addr1'),
//               Address2: recAddress.getFieldValue('addr2'),
//               City: recAddress.getFieldValue('city'),
//               State: {'Id': recAddress.getFieldValue('statedropdown'),
//                       'Abbrev' : '',
//                       'Name': recAddress.getFieldText('statedropdown')},
//               Country: {'Id': '',
//                         'Name': recAddress.getFieldText('country'),
//                         'Enumeration': recAddress.getFieldValue('country'),
//                         'Abbrev': '',
//                         'DialCode': ''},
//               PostalCode: recAddress.getFieldValue('zip'),
//               IsShipping: recAddress.getFieldValue('is_default_ship_address'),
//               IsBilling: recAddress.getFieldValue('is_default_bill_address'),

//           }
//       }
//   }
//   return objAddress;
// };

// function _parseError (ErrorObj) {

//   var errorText = '';

//   if (ErrorObj instanceof nlobjError)
//   {
//       errorText = 'UNEXPECTED ERROR: ' + '\n\n';
//       errorText += 'Script Name: ' + ErrorObj.getUserEvent() + '\n';
//       errorText += 'Error Code: ' + ErrorObj.getCode() + '\n';
//       errorText += 'Error Details: ' + ErrorObj.getDetails() + '\n\n';
//       errorText += 'Stack Trace: ' + ErrorObj.getStackTrace();
//   }
//   else
//   {
//       errorText = 'UNEXPECTED ERROR: ' + '\n\n';
//       errorText += 'Error Details: ' + ErrorObj.toString();
//   }

//   return errorText;
// };
