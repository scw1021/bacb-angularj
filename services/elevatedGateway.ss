/**
 *
 * Project :: BACB - Customer Portal
 * Filename :: elevatedGateway.ss
 * Created :: 08-08-18
 * Author :: Anthony OConnor
 *
 * Notes ::
 * 08/08/2018 : New service created to use elevated permissions for customer registration
 * 
 *
 */

var ES_ACTIONS = {
  register: register
};

function service(objRequest, objResponse) {

  var stAx = objRequest.getParameter('esAx');

  if (ES_ACTIONS[stAx]) {
    ES_ACTIONS[stAx](objRequest, objResponse);
  }

}

function register(objRequest, objResponse) {

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

    var filters = [  new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                     new nlobjSearchFilter('companyname', null, 'is', objLoginDtl.username)
                  ];    
    var customers = nlapiSearchRecord('customer', null, filters, null);
    if(!customers){

      try {

        var objLoginResult = webSession.registerCustomer({
          companyname: objLoginDtl.username,
          firstname: objLoginDtl.firstname,
          lastname: objLoginDtl.lastname,
          email: objLoginDtl.email,
          password: objLoginDtl.password,
          password2: objLoginDtl.password2
        });

        if (objLoginResult.customerid) {
          webSession = nlapiGetWebContainer().getShoppingSession();
          var webCustomer = webSession.getCustomer();

          // Create profile record
          var recProfile = nlapiCreateRecord('customrecord_profile', {recordmode: 'dynamic'});
          recProfile.setFieldValue('custrecord_customer', objLoginResult.customerid);
          recProfile.setFieldValue('custrecord_profile_prefix', objLoginDtl.prefix);
          recProfile.setFieldValue('custrecord_profile_suffix', objLoginDtl.suffix);
          recProfile.setFieldValue('custrecord_primary_phone_country_code', objLoginDtl.primarycountrycode);
          recProfile.setFieldValue('custrecord_secondary_phone_country_code', objLoginDtl.secondarycountrycode);
          recProfile.setFieldValue('custrecord_profile_primary_ext', objLoginDtl.primaryext);
          recProfile.setFieldValue('custrecord_profile_secondary_ext', objLoginDtl.secondaryext);
          var intProfileId = nlapiSubmitRecord(recProfile, true, true);

          // Update customer record
          var recCustomer = nlapiLoadRecord('customer', objLoginResult.customerid);
          recCustomer = setFieldValue('middlename',objLoginDtl.middlename);
          recCustomer = setFieldValue('phone', objLoginDtl.primaryphone);
          recCustomer = setFieldValue('altphone', objLoginDtl.secondaryphone);
          recCustomer = setFieldValue('mobilephone', objLoginDtl.mobilephone);
          recCustomer = setFieldValue('fax', objLoginDtl.faxnumber);
          var intCustomerId = nlapiSubmitRecord(recCustomer, true, true);
 
          objDataResponse.data.user = getCustomerData(webCustomer);
          webSession.logout();
        } else {
          objDataResponse.hasError = true;
          objDataResponse.message = 'Registration failed - No Customer ID returned';
        }
      } catch (ex) {
        objDataResponse.hasError = true;
        objDataResponse.message = _parseError(ex);
      }
    } else { //customer username already found!
      objDataResponse.hasError = true;
      objDataResponse.message = 'An account already exists for that username.';
    }
  } else {

    objDataResponse.hasError = true;
    objDataResponse.message = 'Registration failed - Bad Body.';
  }

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}

function getCustomerData(webCustomer) {

  var objUser = (function (standard, custom) {
    var retVal = {};
    // get standard customer fields
    for (var standardKey in standard) {
      retVal[standardKey] = standard[standardKey];
    }
    // get custom customer fields
    for (var indexCustom=0; indexCustom < custom.length; indexCustom++) {
      retVal[custom[indexCustom].name] = custom[indexCustom].value;
    }

    return retVal;
  } (webCustomer.getFieldValues(), webCustomer.getCustomFieldValues()));

  return objUser;
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