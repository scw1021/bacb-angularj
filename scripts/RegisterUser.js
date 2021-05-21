/**
 * RegisterUser.js
 *
 * v1.0.0
 * 9/9/2019
 * Robert Imbler
 *
 * Test Case for implementing a Server-side script to Register New users and update permissions
 *
 */

/**
 * Take a user object and create Customer in NetSuite, and send back confirmation response
 * @param {nlobjRequest} objRequest
 * @param {nlobjResponse} objResponse
 */
function RegisterUser(objRequest, objResponse) {
  // nlapiGetWebContainer().getShoppingSession();
  var stBody = objRequest.getBody();
  var objRxData;
  if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  var objDataResponse = {
    hasError: false,
    message: "",
    data: {}
  };
  var newCustomer = nlapiCreateRecord("customer");
  var newProfile = nlapiCreateRecord("customrecord_profile");

  try {
    // Get variables from request
    var _firstname = objRequest.getParameter("firstname");
    var _middlename = objRequest.getParameter("middlename");
    var _lastname = objRequest.getParameter("lastname");
    var _email = objRequest.getParameter("email");
    var _password = objRequest.getParameter("password");
    var _password2 = objRequest.getParameter("password2");
    var _phone = objRequest.getParameter("phone");
    var _altphone = objRequest.getParameter("altphone");
    var _country = objRequest.getParameter("country");
    var _altcountry = objRequest.getParameter("altcountry");
    var _ext = objRequest.getParameter("ext");
    var _altext = objRequest.getParameter("altext");
    var _prefix = objRequest.getParameter("prefix");
    var _suffix = objRequest.getParameter("suffix");

    var _entityStatus = 17;
    var _giveAccess = "T";
    var _isPerson = "T";

    // check if email already used, because we can't stop if from executing twice?

    var arrFilters = [new nlobjSearchFilter("email", null, "is", _email)];

    var arrColumns = [new nlobjSearchColumn("email")];

    var customers = nlapiSearchRecord("customer", null, arrFilters, arrColumns);

    var registerCustomer = false;
    try {
      objDataResponse.Message = customers.shift().getValue(arrColumns[0]);
    } catch (noCustomerFound) {
      // If shift().getvalue() fails to find a customer, then the email is available and we proceed
      registerCustomer = true;
    }

    if (registerCustomer) {
      // Note - All values up to this point will be stringified. Null values are empty strings and we must handle them here
      // Register
      newCustomer.setFieldValue("firstname", _firstname);
      // Empty string middlename is fine, probably?
      newCustomer.setFieldValue("middlename", _middlename);
      newCustomer.setFieldValue("lastname", _lastname);
      newCustomer.setFieldValue("email", _email);
      newCustomer.setFieldValue("password", _password);
      newCustomer.setFieldValue("password2", _password2);
      newCustomer.setFieldValue("entitystatus", _entityStatus);
      newCustomer.setFieldValue("giveaccess", _giveAccess);
      newCustomer.setFieldValue("isPerson", _isPerson);
      newCustomer.setFieldValue("phone", _phone);
      if ( _altphone != "" ) {
        newCustomer.setFieldValue("altphone", _altphone);
      }
      // Set Profile Values as well
      if ( _prefix != "") {
        newProfile.setFieldValue("custrecord_profile_prefix", _prefix);
      }
      if ( _suffix != "" ) {
        newProfile.setFieldValue("custrecord_profile_suffix", _suffix);
      }

      newProfile.setFieldValue("custrecord_primary_phone_country_code", _country);
      if ( _altcountry != "undefined" ) {
        newProfile.setFieldValue("custrecord_secondary_phone_country_code", _altcountry);
      }
      if ( _ext != "" ) {
        newProfile.setFieldValue("custrecord_profile_primary_ext", _ext);
      }
      if ( _altext != "" ) {
        newProfile.setFieldValue("custrecord_profile_secondary_ext", _altext);
      }
      var custId = nlapiSubmitRecord(newCustomer, false);

      newProfile.setFieldValue("custrecord_customer", custId);
      newProfile.setFieldValue("Name", "Straight Bullshit, Straight 'USER ERROR' bullshit.");


      var profId = nlapiSubmitRecord(newProfile, false);

      // but now we need to update the customer with the customer and profile IDs
      // start by loading the freshly made customer record
      newCustomer = nlapiLoadRecord('customer', custId);
      // var newProfile = nlapiLoadRecord("customrecord_profile", newCustomer.);
      // newCustomer.setFieldValue("Name", custId);
      // newCustomer.setFieldValue("profile", profId);


      // var custId2 = nlapiSubmitRecord(newCustomer, false);

      objDataResponse.hasError = false;
      objDataResponse.message = "Customer Created Successfully";
      objDataResponse.data = { ID: custId, Email: JSON.stringify(newProfile) };
    }
  } catch (errorMessage) {
    objDataResponse.hasError = true;
    objDataResponse.message = JSON.stringify(errorMessage);
  }
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}
