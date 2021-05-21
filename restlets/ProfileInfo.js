var ES_ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Update: _Update,
  AltUpdate: AltUpdate
};

function service(objRequest) {
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest));

	var stParam = objRequest['param'];
	if (ACTIONS[stParam]) {
		return ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};

function Create(objRequest) {

};

function Delete(objRequest) {

};

function Read(objRequest) {
nlapiLogExecution('AUDIT','Read Personal Information', '=====START=====');

var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;

  var recApp = nlapiLoadRecord('customrecord_es_application', objRxData.AppId, {recordmode: dynamic});
  var recCust = nlapiLoadRecord('customer', stCustId, {recordmode: dynamic});

  var objDataResponse = {
  hasError: false,
  message: '',
  data: {
    isLoggedIn: true,
    user: getUser(stCustId),
    applicationData: {
              fullName: recCust.getFieldValue('altName'),
              email: recCust.getFieldValue('email'),
              altEmail: recCust.getFieldValue('altEmail'),
      prefix: function (recCust) {
        var objPrefix = {};

        if (recCust.getFieldValue('custrecord_profile_prefix')) {
          objPrefix = {
            id: recCust.getFieldValue('custrecord_profile_prefix'),
            name: recCust.getFieldText('custrecord_profile_prefix')
          }
        }

                  return objPrefix;
      }(recCust),
      suffix: function (recCust) {
        var objSuffix = {};

        if (recCust.getFieldValue('custrecord_profile_suffix')) {
          objSuffix = {
            id: recCust.getFieldValue('custrecord_profile_suffix'),
            name: recCust.getFieldText('custrecord_profile_suffix')
          }
        }

        return objSuffix;
              }(recCust),
              phone1: recCust.getFieldValue('phone'),
              phone2: recCust.getFieldValue('altPhone'),
              mobile: recCust.getFieldValue('mobilePhone'),
              PhysicalAddress: function (recCust) {
                  var objPhysicalAddress = {};
                  var stPhyAddIndex = recApp.getFieldValue('custRecord_applicatin_ship_index') ? _FindAddressIndex(recCust, "Shipping") : recApp.getFieldValue('custRecord_application_ship_index');
                  recCust.selectLineItem('addressbook', stPhyAddIndex);
                  var recPhysicalAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
                  if (stPhysAddIndex) {
                      objPhysicalAddress = {
                          Address1: recPhysicalAddress.getFieldValue('addr1'),
                          Address2: recPhysicalAddress.getFieldValue('addr2'),
                          City: recPhysicalAddress.getFieldValue('city'),
                          State: recPhysicalAddress.getFieldValue('state'),
                          Country: recPhysicalAddress.getFieldValue('country'),
                          PostalCode: recPhysicalAddress.getFieldValue('zip')
                      }
                  }
              }(recCust),
              MailingAddress: function (recCust) {
                  var objMailingAddress = {};
                  var stMailAddIndex = recApp.getFieldValue('custRecord_applicatin_ship_index') ? _FindAddressIndex(recCust, "Mailing") : recApp.getFieldValue('custRecord_application_mail_index');
                  recCust.selectLineItem('addressbook', stMailAddIndex);
                  var recMailingAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
                  var stMailAddId = recCust.getFieldValue('MailingAddressId');
                  if (stMailAddIndex) {
                      var recMailingAddress = nlapiLoadRecord('address', stMailAddId);
                      objMailingAddress = {
                          Address1: recMailingAddress.getFieldValue('addr1'),
                          Address2: recMailingAddress.getFieldValue('addr2'),
                          City: recMailingAddress.getFieldValue('city'),
                          State: recMailingAddress.getFieldValue('state'),
                          Country: recMailingAddress.getFieldValue('country'),
                          PostalCode: recMailingAddress.getFieldValue('zip')
                      }
                  }
              }(recCust),
          }
      }
  }

  nlapiLogExecution('AUDIT','Read Personal Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {
  nlapiLogExecution('AUDIT','Update Personal Information', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var objDataResponse = {
  hasError: false,
  message: '',
  data: {
    isLoggedIn: true,
    AppId: objRxData.AppId,
          NewDegreeId: ''
      }
  }

  if (objRxData.AppId) {
      var recOldCustomer = nlapiLoadRecord('customer', stCustId);
      recOldCustomer.setFieldValue('phone', objRxData.Phone);
      recOldCustomer.setFieldValue('altphone', objRxData.AltPhone);
      recOldCustomer.setFieldValue('mobilephone', objRxData.MobilePhone);
      if (objRxData.address) {

          var iTotalAddressBookEntries = recCustomer.getLineItemCount('addressbook');
          var iDefaultBillingAddressIndex = -1;

          for (var iCount=1; iCount <= iTotalAddressBookEntries; iCount++) {
              var bBillAddr = recCustomer.getLineItemValue('addressbook', 'defaultbilling', iCount) == 'T';
              if (bBillAddr) {
                  iDefaultBillingAddressIndex = iCount;
              }
          }

          if (objRxData.address.address1) {
              if (iDefaultBillingAddressIndex == -1) {
                  recCustomer.selectNewLineItem('addressbook');
                  recCustomer.setCurrentLineItemValue('addressbook', 'defaultbilling', 'T');
                  recCustomer.setCurrentLineItemValue('addressbook', 'defaultshipping', 'T');

                  //create address subrecord
                  var subrecord = recCustomer.createCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
              } else {
                  recCustomer.selectLineItem('addressbook', iDefaultBillingAddressIndex);

                  //load address subrecord
                  var subrecord = recCustomer.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
              }

              subrecord.getFieldValue('country');
              //set subrecord fields
              if (objRxData.address.country) {
                  if (objRxData.address.country.name) {
                      subrecord.setFieldText('country', objRxData.address.country.name); //Country must be set before setting the other address fields
                  }
              }
              if (objRxData.address.state) {
                  if (objRxData.address.state.id) {
                      subrecord.setFieldValue('dropdownstate', objRxData.address.state.id);
                  } else {
                      subrecord.setFieldValue('state', objRxData.address.state);
                  }
              } else {
                  recCustomer.setFieldValue('state', '');
              }
              subrecord.setFieldValue('addr1', objRxData.address.address1);
              subrecord.setFieldValue('addr2', objRxData.address.address2);
              subrecord.setFieldValue('city', objRxData.address.city);
              subrecord.setFieldValue('zip', objRxData.address.postalCode);

              //commit subrecord and line item
              subrecord.commit();
              recCustomer.commitLineItem('addressbook');

          } else {
              if (iDefaultBillingAddressIndex > 0) {
                  recCustomer.removeLineItem('addressbook', iDefaultBillingAddressIndex);
              }
          }
      }
      objDataResponse.data.CustomerId = nlapiSubmitRecord(recOldCustomer, true);

      var recOldProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId));
      recOldProfile.setFileValue('custrecord_primary_phone_country_code', objRxData.primaryCountryCode);
      recOldProfile.setFileValue('custrecord_primary_ext', objRxData.primaryExt);
      recOldProfile.setFileValue('custrecord_secondary_phone_country_code', objRxData.secondaryCountryCode);
      recOldProfile.setFileValue('custrecord_secondary_ext', objRxData.secondaryExt);
      objDataResponse.data.ProfileId = nlapiSubmitRecord(recOldProfile, true);
  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','Update Personal Information', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _GetProfile(CustomerID) {
  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('customrecord_profile','custrecord_customer','is', CustomerID);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalid','customrecord_profile');

  var searchResults = nlapiSearchRecord('customrecord_profile','null', arrFilters, arrColumns);

  return searchResults[0].getValue(columns[0]);
};

function _CreateAddress(ObjAddress, CustomerID, $DefaultShipping = 0, $DefaultBilling = 0) {

  var recCustomer = nlapiLoadRecord('customer', CustomerID, {recordmode: 'dynamic'});

  var recNewAddress = recCustomer.createCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
  recNewAddress.setFieldValue('country', ObjAddress.Country);
  recNewAddress.setFieldValue('addr1', ObjAddress.Address1);
  recNewAddress.setFieldValue('addr2', ObjAddress.Address2);
  recNewAddress.setFieldValue('city', ObjAddress.City);
  recNewAddress.setFieldValue('dropdownstate', ObjAddress.State);
  recNewAddress.setFieldValue('zip', ObjAddress.PostalCode);
  if($DefaultShipping) {
      recNewAddress.setFieldValue('is_default_ship_address', 'T');
  }
  if($DefaultBilling) {
      recNewAddress.setFieldValue('is_default_bill_address', 'T');
  }
  recNewAddress.commit();
  recCustomer.commitLineItem('addressbook');

  return nlapiSubmitRecord(recCustomer);

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
  return 0;
}

function AltUpdate(objRequest) {
nlapiLogExecution('AUDIT','Alt Update Personal Information', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;

var objDataResponse = {
hasError: false,
message: '',
data: {
  isLoggedIn: true,
  AppId: objRxData.AppId,
        NewDegreeId: ''
    }
}
if (objRxData.AppId) {
    // Get Customet Details
    var recOldCustomer = nlapiLoadRecord('customer', stCustId);
    // Update Required Fields
    recOldCustomer.setFieldValue('firstname', objRxData.FirstName);
    recOldCustomer.setFieldValue('middlename', objRxData.MiddleName);
    recOldCustomer.setFieldValue('lastname', objRxData.LastName);
    recOldCustomer.setFieldValue('email', objRxData.Email);
    // Submit the new, updated record
    objDataResponse.data.CustomerId = nlapiSubmitRecord(recOldCustomer, true);
}
else {
    throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
}

nlapiLogExecution('AUDIT','Alt Update Personal Information', '======END======');
  return (JSON.stringify(objDataResponse));
};
