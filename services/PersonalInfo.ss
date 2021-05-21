var ES_ACTIONS = {
    Check: _Check,
    Create: _Create,
    Delete: _Delete,
    Read: _Read,
//    Update: _Update,
   Update: _SubrecordWontDeleteTest,
    Load: _GetCountries,
    ChangeNameRequest: _ChangeName,
    ReadNameChanges: _ReadNameChanges,
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ES_ACTIONS[stParam]) {
		ES_ACTIONS[stParam](objRequest, objResponse);
	}

};

function _SubrecordWontDeleteTest(objRequest, objResponse){
   var customerIdz = 589
  nlapiLogExecution('AUDIT', "testdeploy", 'START');
  var testCustomer = nlapiLoadRecord("customer", customerIdz, {recordmode: 'dynamic'});
  // hardcoded value is programmatically populated in actual use case
  testCustomer.selectLineItem('addressbook', 1);
  testCustomer.removeCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
  testCustomer.commitLineItem('addressbook');
  var res = nlapiSubmitRecord(testCustomer);
  nlapiLogExecution('AUDIT', "testdeploy", res)

}
function _Check(objRequest, objResponse) {
    // E$.logAudit('CHECK PersonalInfo', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
        var recCustomer = nlapiLoadRecord('customer', stCustId);

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'objSession_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    // nlapiLogExecution('AUDIT', 'CHECK_CALLED', 'CHECK function in PersonalInfo executed.');

    var objDataResponse = {
		'Response': 'F',
		'Message': ''
    };

    var objShippingAddress = _FindAddressIndex(recCustomer, "Shipping");
    E$.logAudit('Check PersonalInfo', "ShippingObject: " + JSON.stringify(objShippingAddress));
    if (objShippingAddress.isShipping === 'T') {
        objDataResponse.Response = 'T';
    }

    // E$.logAudit('CHECK PersonalInfo', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Create(objRequest, objResponse) {
    // E$.logAudit('CREATE PersonalInfo', '=====START=====');

    // E$.logAudit('CREATE PersonalInfo', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Delete(objRequest, objResponse) {
    // E$.logAudit('DELETE PersonalInfo', '=====START=====');

    // E$.logAudit('DELETE PersonalInfo', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Read(objRequest, objResponse) {
	// E$.logAudit('READ PersonalInfo', '=====START=====');


    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'READ PersonalInfo', 'The call to get the current web session failed.:' + ex.message)
    }
    var recCustomer = nlapiLoadRecord("customer", stCustId);
    nlapiLogExecution("DEBUG", "Read PersonalInfo", "CustomerObj: " + JSON.stringify(recCustomer));

    // nlapiLogExecution('AUDIT', 'READ PersonalInfo', 'READ function in PersonalInfo executed.');
    try{
    var recCustomer = nlapiLoadRecord('customer', stCustId);
    } catch(ex) {
      nlapiLogExecution('ERROR', 'Read Personal Info', "Customer load failed:" + ex.message)
    }

    try{
      var recProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId))
    } catch (ex){
      nlapiLogExecution("ERROR", "Read PersonalInfo", "Profile Load failed: " + ex.message);
    }


    // nlapiLogExecution('AUDIT', 'READ PersonalInfo', 'READ: Customer ID =' + stCustId);

    var objDataResponse = {
      Id:'',
      BACBID:'',
      FullName: '',
      FirstName:'',
      MiddleName:'',
      LastName:'',
      Email:'',
      AltEmail:'',
      Prefix:{},
      Suffix:{},
      Addresses:[],
      Phone:{},
      AltPhone:{},
      Mobile:{},
      Birthdate:'',
      Gender:{},
      GenderOther:{},
      Ethnicity:{}
     };
    // Get User Specifics
    objDataResponse.Id = stCustId;
    objDataResponse.BACBID = (recCustomer.getFieldValue('entityid'));
    // Do full name responsibly

    objDataResponse.FullName  = (recCustomer.getFieldValue('middlename') && recCustomer.getFieldValue('middlename') != '')
    ? recCustomer.getFieldValue('firstname') + ' ' + recCustomer.getFieldValue('middlename') + ' ' + recCustomer.getFieldValue('lastname')
    : recCustomer.getFieldValue('firstname') + ' ' + recCustomer.getFieldValue('lastname');
    // Let's also do the prefix/suffix
    if ( _GetListValue(recProfile, 'custrecord_profile_prefix' ).Value != '') {
      objDataResponse.FullName = _GetListValue(recProfile, 'custrecord_profile_prefix').Value + ' ' + objDataResponse.FullName;
    }
    if ( _GetListValue(recProfile, 'custrecord_profile_suffix' ).Value != '') {
      objDataResponse.FullName = objDataResponse.FullName +  ' ' + _GetListValue(recProfile, 'custrecord_profile_prefix').Value;
    }
    objDataResponse.FirstName = '' + recCustomer.getFieldValue('firstname');
    objDataResponse.MiddleName = recCustomer.getFieldValue('middlename') ? '' + recCustomer.getFieldValue('middlename') : '';
    objDataResponse.LastName = '' + recCustomer.getFieldValue('lastname');
    objDataResponse.Email = recCustomer.getFieldValue('email');
    objDataResponse.AltEmail = recCustomer.getFieldValue('altemail');
    objDataResponse.Prefix =  _GetListValue(recProfile, 'custrecord_profile_prefix');
    objDataResponse.Suffix = _GetListValue(recProfile, 'custrecord_profile_suffix');
    try{
      objDataResponse.Addresses = function (Customer) {
        var ArrAddress = [];
        ArrAddress.push(_ViewAddress(Customer, "Shipping"));
        if (ArrAddress[0].isBilling !== 'T') {
            ArrAddress.push(_ViewAddress(Customer, "Billing"));
        }
        return ArrAddress;
      }(recCustomer);
    } catch (error) {
      E$.logAudit('PersonalInfo_Read', _parseError(error));
      objDataResponse.Addresses = [];
    }

    objDataResponse.Phone = {
        Country: _GetCountry(recProfile.getFieldValue('custrecord_primary_phone_country_code')),
        Number: '' + recCustomer.getFieldValue('phone'),
        Ext: recProfile.getFieldValue('custrecord_profile_primary_ext'),
        IsMobile: (recCustomer.getFieldValue('phone') == recCustomer.getFieldValue('mobilephone')) ? 'T' : 'F'
    };
    objDataResponse.AltPhone = {
        Country: _GetCountry(recProfile.getFieldValue('custrecord_secondary_phone_country_code')),
        Number: recCustomer.getFieldValue('altphone'),
        Ext: recProfile.getFieldValue('custrecord_profile_secondary_ext'),
        IsMobile: (recCustomer.getFieldValue('altphone') == recCustomer.getFieldValue('mobilephone')) ? 'T' : 'F'
    } ;
    // E$.logAudit('Read PersonalInfo', 'AltPhone: ' + JSON.stringify(objDataResponse.AltPhone));
    objDataResponse.Mobile = function (Customer, Profile) {
        var MobilePhone = {'Country' : '',
                            'Number' : '',
                            'Ext' : '',
                            'IsMobile': 'T'};
        if (Customer.getFieldValue('phone') == Customer.getFieldValue('mobilephone')) {
          E$.logAudit('PersonalInfo_Read', 'primary mobile');
            MobilePhone = {
                Country: _GetCountry(recProfile.getFieldValue('custrecord_primary_phone_country_code')),
                Number: Customer.getFieldValue('phone'),
                Ext: Profile.getFieldValue('custrecord_profile_primary_ext'),
                IsMobile: 'T'
            }
        }
        // Cool so we kind of need to do a null check here
        else if ((Customer.getFieldValue('altphone') != null) && (Customer.getFieldValue('altphone') == Customer.getFieldValue('mobilephone'))) {
          E$.logAudit('PersonalInfo_Read', 'secondary mobile: ' + JSON.stringify(Customer.getFieldValue('altphone')) );
            MobilePhone = {
                Country: _GetCountry(recProfile.getFieldValue('custrecord_secondary_phone_country_code')),
                Number: Customer.getFieldValue('altphone'),
                Ext: Profile.getFieldValue('custrecord_profile_secondary_ext'),
                IsMobile:  'T'
            }
        }
        return MobilePhone;
    } (recCustomer, recProfile);
    objDataResponse.Birthdate = recProfile.getFieldValue('custrecord_profile_birth_date');
    objDataResponse.Gender = _GetListValue(recProfile, 'custrecord_profile_gender');
    objDataResponse.GenderOther = recProfile.getFieldValue('custrecord_profile_gender_other');
    objDataResponse.Ethnicity = _GetListValue(recProfile, 'custrecord_profile_ethnity');

    E$.logAudit('READ PersonalInfo','Response: ' + JSON.stringify(objDataResponse));
    // E$.logAudit('READ PersonalInfo', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};


function _DEV_testDeleteAddress(objRequest, objResponse){

}


function _Update(objRequest, objResponse) {
  E$.logAudit("UPDATE PersonalInfo", "=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "The call to get the current web session failed.:" + ex.message);
  }
  nlapiLogExecution("DEBUG", "UPDATE PersonalInfo", "UPDATE function in PersonalInfo executed. Customer ID:" + stCustId
  );

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    nlapiLogExecution("DEBUG", "UPDATE PersonalInfo", "Object: " + JSON.stringify(objRxData));
  } else {
    nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Response: "F",
    Message: ""
  };

  if (stCustId) {
    try{
    var recCustomer = nlapiLoadRecord("customer", stCustId, {recordmode: 'dynamic'});
    } catch(ex){
      nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "Customer load failed: " + ex.message);
    }
    if (objRxData.AltEmail) {
      recCustomer.setFieldValue("altemail", objRxData.AltEmail);
    }
    recCustomer.setFieldValue("phone", objRxData.Phone.Number);
    // recCustomer.setFieldValue("custrecord_primary_phone_country_code")
    if (objRxData.AltPhone.Number) {
      recCustomer.setFieldValue("altphone", objRxData.AltPhone.Number);
    }
    if (objRxData.MobilePhone.Number) {
      recCustomer.setFieldValue("mobilephone", objRxData.MobilePhone.Number);
    }

    // Refresh the Customer data before managing addresses

    var CustomerId = stCustId;
    if (objRxData.Addresses instanceof Array && objRxData.Addresses.length) {
      var objShippingIndex = _FindAddressIndex(recCustomer, "Shipping");
      var objBillingIndex = _FindAddressIndex(recCustomer, "Billing");
      if (!objShippingIndex.Index) {
        // No Address for shipping
        // _CreateAddress(CustomerId, objRxData.Addresses[0])

      } else {
        if (objRxData.Addresses[0].isShipping == "T") {
          // If Shipping Address is no longer also billing, this should be updated here
          _EditAddress(CustomerId, objShippingIndex, objRxData.Addresses[0]);
        }
      }

      if (objRxData.Addresses.length > 1 ) {
        if (objRxData.Addresses[1].isBilling == "T") {
          if (!objBillingIndex.Index || (objShippingIndex.Index == objBillingIndex.Index)) {
          // No Address for billing
          //  _CreateAddress(CustomerId, objRxData.Addresses[1]);

          } else {
            _EditAddress(CustomerId, objBillingIndex, objRxData.Addresses[1])
          }
        }
      } else if(objRxData.Addresses[0].isBilling == "T") {  // Try catch this
        if(objShippingIndex.Index != objBillingIndex.Index){
          nlapiLogExecution('ERROR', 'UPDATE PERSONAL', 'We are getting here ' + JSON.stringify(objBillingIndex) + JSON.stringify(objShippingIndex) );
          try{
            var testCustomer = nlapiLoadRecord("customer", stCustId, {recordmode: 'dynamic'});
          } catch(ex){
            nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "Customer Record load failed: " + ex.message);
          }
          testCustomer.selectLineItem('addressbook', objBillingIndex.Index);
          testCustomer.removeCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
          testCustomer.commitLineItem('addressbook');

          try{
            nlapiSubmitRecord(testCustomer);
          } catch(ex){
            nlapiLogExecution('ERROR', 'Update PersonalInfo.ss', 'Record submission failed' + ex.message);
          }

        }
      }
    }
    try {
      var recOldProfile = nlapiLoadRecord("customrecord_profile", _GetProfile(stCustId));
    } catch (ex) {
      nlapiLogExecution('ERROR',"UPDATE PersonalInfo", "Load record failed." + _parseError(ex));
    }

      if (objRxData.Prefix.Id) {
        recOldProfile.setFieldValue("custrecord_profile_prefix", objRxData.Prefix.Id);
        nlapiLogExecution("DEBUG", "UPDATE PersonalInfo", "Prefix");
      }
      else {
        recOldProfile.setFieldValue("custrecord_profile_prefix", '');
      }
      if (objRxData.Suffix.Id) {
        recOldProfile.setFieldValue("custrecord_profile_suffix", objRxData.Suffix.Id);
        nlapiLogExecution("DEBUG", "UPDATE PersonalInfo", "Suffix");
      }
      else {
        recOldProfile.setFieldValue("custrecord_profile_suffix", '');
      }
      if (objRxData.Phone.Country.DialCode) {
        recOldProfile.setFieldValue("custrecord_primary_phone_country_code",  objRxData.Phone.Country.Id);
        nlapiLogExecution("DEBUG", "UPDATE PersonalInfo", "Primary Country Code");
      }
      recOldProfile.setFieldValue("custrecord_profile_primary_ext", objRxData.Phone.Ext);
      if (objRxData.AltPhone.Country.DialCode) {
        recOldProfile.setFieldValue("custrecord_secondary_phone_country_code", objRxData.AltPhone.Country.Id);
      }
      recOldProfile.setFieldValue("custrecord_profile_secondary_ext",objRxData.AltPhone.Ext);
      if (objRxData.Birthdate) {
        nlapiLogExecution('AUDIT', 'UPDATE PROFILE', 'HAS BIRTHDATE');
        recOldProfile.setFieldValue("custrecord_profile_birth_date", objRxData.Birthdate);
      }
      if (objRxData.Gender.Id) {
        recOldProfile.setFieldValue("custrecord_profile_gender", objRxData.Gender.Id);
      }
      recOldProfile.setFieldValue("custrecord_profile_gender_other", objRxData.GenderOther);
      if (objRxData.Ethnicity.Id) {
        recOldProfile.setFieldValue("custrecord_profile_ethnity", objRxData.Ethnicity.Id);
      }
    try{
      var ProfileId = nlapiSubmitRecord(recOldProfile, true);
    } catch (ex) {
      nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "Update profile record failed." + _parseError(ex));
    }
    if (CustomerId && ProfileId) {
      objDataResponse.Response = "T";
      objDataResponse.Message = "Profile updated.  Profile ID: " + ProfileId;
    }
  } else {
    nlapiLogExecution("ERROR", "UPDATE PersonalInfo", "Application ID is invalid." );
  }

  E$.logAudit("UPDATE PersonalInfo", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
};

function _GetListValue(ParamRecord, ListName) {
    var objList = {'Id' : '', 'Value' : ''};

    if (ParamRecord.getFieldValue(ListName)) {
        objList = {
            Id: ParamRecord.getFieldValue(ListName),
            Value: ParamRecord.getFieldText(ListName)
        }
    }

    return objList;
}

function _GetProfile(CustomerID) {
    var ReturnID = 0;
    var arrFilters = [];

    // E$.logAudit('GetProfile PersonalInfo', 'CustomerID: ' + CustomerID);

    arrFilters[0] = new nlobjSearchFilter('custrecord_customer',null,'anyof', CustomerID);

    try {
        var searchResults = nlapiSearchRecord('customrecord_profile',null, arrFilters, null);
    }
    catch (ex) {
        E$.logAudit('GetProfile PersonalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'CustomerID: ' + CustomerID);
        return 0;
    }
    // E$.logAudit('GetProfile PersonalInfo After', 'CustomerID: ' + CustomerID + ' Result: ' + JSON.stringify(searchResults));

    if (searchResults instanceof Array && searchResults.length) {
        ReturnID = searchResults[0].getId();
    }
    else if (searchResults) {
        ReturnID = searchResults.getId();
    }
    else {
        E$.logAudit('GetProfile PersonalInfo inside', 'CustomerID: ' + CustomerID);
        var recNewProfile = nlapiCreateRecord('customrecord_profile', {recordmode: 'dynamic'});
        recNewProfile.setFieldValue('custrecord_customer', CustomerID);
        ReturnID = nlapiSubmitRecord(recNewProfile, true, true);
    }

    // E$.logAudit('GetProfile PersonalInfo bottom', 'CustomerID: ' + CustomerID + ' and ProfileID: ' + ReturnID);
    return ReturnID;
};

function _FindAddressIndex(recCustomer, AddressType) {

    var objReturn = {'Index' : '', 'isShipping' : 'F', 'isBilling' : 'F'};
    try{
      for (var stCount=recCustomer.getLineItemCount('addressbook'); stCount > 0; stCount--) {
        if (AddressType == "Shipping" && recCustomer.getLineItemValue('addressbook', 'defaultshipping', stCount) == 'T') {
            objReturn.Index = stCount;
            objReturn.isShipping = 'T';
            objReturn.isBilling = recCustomer.getLineItemValue('addressbook', 'defaultbilling', stCount);
        }
        if (AddressType == "Billing" && recCustomer.getLineItemValue('addressbook', 'defaultbilling', stCount) == 'T') {
            objReturn.Index = stCount;
            objReturn.isBilling = 'T';
        }
      }
    }
    catch (error) {
      E$.logAudit('PersonalProfile.ss/_FindAddressIndex', 'A user (' + recCustomer.FullName + ') without addresses has tried to get a list of addresses and an error was thrown... obviously. ' + _parseError(error));
    }

    return objReturn;
};

function _ViewAddress(recCustomer, AddressType, iAddressIndex) {
    var objAddress = {
        Index: '',
        Address1: '',
        Address2: '',
        City: '',
        State: {'Id': '', 'Abbrev' : '', 'Value': ''},
        Country: {},
        PostalCode: '',
        isShipping: 'F',
        isBilling: 'F'
    };

    var objAddressLineItem;
    // E$.logAudit('ViewAddress PersonalInfo', 'Customer: ' + JSON.stringify(recCustomer) + "Before AddressIndex: " + iAddressIndex);
    if (!iAddressIndex){
        objAddressLineItem = _FindAddressIndex(recCustomer, AddressType);
        iAddressIndex = objAddressLineItem.Index;
        //E$.logAudit('ViewAddress PersonalInfo', "AddressIndex: " + iAddressIndex);
    }
    // E$.logAudit('ViewAddress PersonalInfo', 'Customer: ' + JSON.stringify(recCustomer) + "After AddressIndex: " + iAddressIndex);
    if (iAddressIndex != null) {
        recCustomer.selectLineItem('addressbook', iAddressIndex);
        var recAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
        //E$.logAudit('ViewAddress PersonalInfo','Address for index: ' + iAddressIndex + ' is: ' + JSON.stringify(recAddress));
        if (recAddress) {
            objAddress = {
                Index: iAddressIndex,
                Address1: recAddress.getFieldValue('addr1'),
                Address2: recAddress.getFieldValue('addr2'),
                City: recAddress.getFieldValue('city'),
                Country: _GetCountry(_GetCountryId(recAddress.getFieldValue('country'))),
                State: {'Id': recAddress.getFieldValue('dropdownstate'), 'Abbrev' : recAddress.getFieldValue('dropdownstate'), 'Value': recAddress.getFieldText('dropdownstate')},
                PostalCode: recAddress.getFieldValue('zip'),
                isShipping: objAddressLineItem.isShipping,
                isBilling: objAddressLineItem.isBilling
            }
        }
    }
    return objAddress;
};

function _EditAddress(CustomerID, objAddressIndex, objAddress) {

  try {
  var recCustomer = nlapiLoadRecord("customer", CustomerID, {recordmode: "dynamic"});
  } catch(ex){
    nlapiLogExecution("ERROR", "_EditAddress PersonalInfo.ss", "Customer load failed: " + ex.message);
  }
    recCustomer.selectLineItem('addressbook', objAddressIndex.Index);

    var subrecord = recCustomer.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
    nlapiLogExecution('DEBUG', 'EditAddress From', JSON.stringify(subrecord));
    nlapiLogExecution('DEBUG', 'EditAddress using', JSON.stringify(objAddress));
    subrecord.setFieldValue('country', objAddress.Country.Abbrev);  // Country field must go first in order to update an address
    if (objAddress.State) {
      subrecord.setFieldValue('dropdownstate', objAddress.State.Abbrev);
      subrecord.setFieldValue('state', objAddress.State.Abbrev);
    } else {
        recCustomer.setFieldValue('state', '');
    }
    subrecord.setFieldValue('label', objAddress.Address1);
    subrecord.setFieldValue('addr1', objAddress.Address1);
    subrecord.setFieldValue('addr2', objAddress.Address2);
    subrecord.setFieldValue('city', objAddress.City);
    subrecord.setFieldValue('zip', objAddress.PostalCode);
    subrecord.setFieldValue('defaultshipping', objAddress.isShipping);
    subrecord.setFieldValue('defaultbilling', objAddress.isBilling);
    nlapiLogExecution('DEBUG', 'EditAddress To', JSON.stringify(subrecord));
    try{
      subrecord.commit();
      recCustomer.commitLineItem('addressbook');
    } catch(ex){
      nlapiLogExecution('ERROR', "_EditAddress PersonalInfo.ss", "committing subrecord/lineitems failed: "+ ex.message);
    }
    try{
      var returnValue = nlapiSubmitRecord(recCustomer);
    } catch(ex){
      nlapiLogExecution('ERROR', "_EditAddress PersonalInfo.ss", "record submission failed: " +  ex.message);
    }
    return returnValue;
};

function _CreateAddress(CustomerID, ObjAddress) {
    try{
    var recCustomer = nlapiLoadRecord("customer", CustomerID, {recordmode: "dynamic"});
    } catch(ex){
      nlapiLogExecution('ERROR', "PersonalInfo.ss _CreateAddress", "Load failed: "+ ex.message);
    }

    var recNewAddress = recCustomer.createCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
    recNewAddress.setFieldValue('country', ObjAddress.Country.Abbrev); // Country field must go first in order to create an address
    recNewAddress.setFieldValue('isresidential', 'F');
    recNewAddress.setFieldValue('attention','');
    recNewAddress.setFieldValue('NetSuite Inc.', '');
    recNewAddress.setFieldValue('addressee', '');
    recNewAddress.setFieldValue('label', ObjAddress.Address1);
    recNewAddress.setFieldValue('addr1', ObjAddress.Address1);
    recNewAddress.setFieldValue('addr2', ObjAddress.Address2);
    recNewAddress.setFieldValue('city', ObjAddress.City);
    recNewAddress.setFieldValue('dropdownstate', ObjAddress.State.Abbrev);
    recNewAddress.setFieldValue('zip', ObjAddress.PostalCode);
    recNewAddress.setFieldValue('defaultshipping', ObjAddress.isShipping);
    recNewAddress.setFieldValue('defaultbilling', ObjAddress.isBilling);

    // recNewAddress.commit();
    nlapiLogExecution(
      "AUDIT",
      "_Create",
      JSON.stringify(recNewAddress)
    );
    try{
    recNewAddress.commit();
    recCustomer.commitLineItem('addressbook');
    var returnValue =  nlapiSubmitRecord(recCustomer);
    } catch (ex) {
      nlapiLogExecution('ERROR', "PersonalInfo.ss _CreateAddress", "Record submission failed: " + ex.message)
    }
    return returnValue;
};

function _GetCountries(objRequest, objResponse) {
    // E$.logAudit('GetCountries PersonalInfo', '=====START=====');
    var objCountries = [];

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('name');

    var searchResults = nlapiSearchRecord('countries', null, null, arrColumns);
    if (searchResults) {
        for (var objEachResult in searchResults) {
            objCountries.push({Id: objEachResult.getId(),
                                Name: objEachResult.getValue(arrColumns[0])
            });
        }
    }

    // E$.logAudit('GetCountries PersonalInfo', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objCountries));
};

function _GetCountryId(Abbrev) {
    var ReturnID = 0;
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_country_code',null,'is', Abbrev);

    try {
        var searchResults = nlapiSearchRecord('customrecord_countries',null, arrFilters, null);
    }
    catch (ex) {
        E$.logAudit('GetProfile PersonalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'Country Code: ' + Abbrev);
        return 0;
    }

    // E$.logAudit('GetProfile PersonalInfo GetCountryId', 'Abbrev: ' + Abbrev + ' Result: ' + JSON.stringify(searchResults));

    if (searchResults instanceof Array && searchResults.length) {
        ReturnID = searchResults[0].getId();
    }
    else if (searchResults) {
        ReturnID = searchResults.getId();
    }
    return ReturnID;
}

function _GetCountry(CountryId) {
    // E$.logAudit('GetCountry PersonalInfo', '====START====');
    if (CountryId == null) {
      E$.logAudit('GetCountry PersonalInfo', 'Returned null because Country ID was null ==End==');
      return {};
    }
    // E$.logAudit('GetCountry PerosnalInfo','Country ID: ' + CountryId);
    try {
    var recCountry = nlapiLoadRecord('customrecord_countries', CountryId);
    } catch(ex){
        nlapiLogExecution('ERROR', 'PersonalInfo.SS _GetCountry', 'Load record failed: ' + ex.message)
    }
    var ReturnCountry = { 'Id': CountryId,
                          'Name' : recCountry.getFieldValue('custrecord_country_name'),
                          'Abbrev' : recCountry.getFieldValue('custrecord_country_code'),
                          'Enumeration' : recCountry.getFieldValue('custrecord_country_enumeration'),
                          'Discount' : recCountry.getFieldValue('custrecord_country_discount'),
                          'DialCode' : recCountry.getFieldValue('custrecord_country_dialcode')};

    // E$.logAudit('GetCountry PersonalInfo', '====End====');
    return ReturnCountry;
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

function _ChangeName(objRequest, objResponse) {
  nlapiLogExecution('AUDIT', "CHANGENAME PersonalInfo", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "CHANGENAME PersonalInfo", "The call to get the current web session failed.:" + ex.message);
  }
  nlapiLogExecution("DEBUG", "CHANGENAME PersonalInfo", "CHANGENAME function in PersonalInfo executed. Customer ID:" + stCustId);
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    nlapiLogExecution("DEBUG", "CHANGENAME PersonalInfo", "Object: " + JSON.stringify(objRxData));
  } else {
    nlapiLogExecution("ERROR", "CHANGENAME PersonalInfo", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Response: "F",
    Message: "",
    ReturnID: '',
  };

  try {
    var record = nlapiCreateRecord('customrecord_name_change');
    record.setFieldValue('custrecord_name_change_og_first_name', objRxData.current.FirstName);
    record.setFieldValue('custrecord_name_change_og_middle_name', objRxData.current.MiddleName);
    record.setFieldValue('custrecord_name_change_og_last_name', objRxData.current.LastName);
    record.setFieldValue('custrecord_name_change_new_first_name', objRxData.requested.FirstName);
    record.setFieldValue('custrecord_name_change_new_middle_name', objRxData.requested.MiddleName);
    record.setFieldValue('custrecord_name_change_new_last_name', objRxData.requested.LastName);
    record.setFieldValue('custrecord_name_change_customer', stCustId);
    objDataResponse.ReturnID = nlapiSubmitRecord(record, false);
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Submitted name change successfully';
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'CHANGENAME PersonalInfo', _parseError(ex))
    objDataResponse.Message = _parseError(ex)
  }
  nlapiLogExecution('AUDIT', 'CHANGENAME PersonalInfo', '======END======');
  objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
}

function _ReadNameChanges(objRequest, objResponse) {
  nlapiLogExecution('AUDIT', "READCHANGENAME PersonalInfo", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "READCHANGENAME PersonalInfo", "The call to get the current web session failed.:" + ex.message);
  }
  nlapiLogExecution("DEBUG", "READCHANGENAME PersonalInfo", "READCHANGENAME function in PersonalInfo executed. Customer ID:" + stCustId);

  var objDataResponse = {
    Array: []
  };
  try {
    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_name_change_new_first_name');
    arrColumns[1] = new nlobjSearchColumn('custrecord_name_change_new_middle_name');
    arrColumns[2] = new nlobjSearchColumn('custrecord_name_change_new_last_name');
    arrColumns[3] = new nlobjSearchColumn('custrecord_name_change_og_first_name');
    arrColumns[4] = new nlobjSearchColumn('custrecord_name_change_og_middle_name');
    arrColumns[5] = new nlobjSearchColumn('custrecord_name_change_og_last_name');
    arrColumns[6] = new nlobjSearchColumn('custrecord_entity_status_int_name','custrecord_name_change_status');

    var arrFilters = new Array();
    arrFilters[0] = new nlobjSearchFilter('custrecord_name_change_customer', null, 'is', stCustId);

    var searchResults = nlapiSearchRecord('customrecord_name_change', null, arrFilters, arrColumns);
    if ( searchResults !== null ) {
      nlapiLogExecution('DEBUG', 'RNC SEARCHRESULTS', JSON.stringify(searchResults));
      if ( !(searchResults instanceof Array && searchResults.length) ) {
        searchResults = [searchResults];
      }
      for (stIndex in searchResults) {
        objDataResponse.Array.push({
          OriginalFirstName:  searchResults[stIndex].getValue(arrColumns[3]),
          OriginalMiddleName: searchResults[stIndex].getValue(arrColumns[4]),
          OriginalLastName: searchResults[stIndex].getValue(arrColumns[5]),
          RequestedFirstName: searchResults[stIndex].getValue(arrColumns[0]),
          RequestedMiddleName: searchResults[stIndex].getValue(arrColumns[1]),
          RequestedLastName: searchResults[stIndex].getValue(arrColumns[2]),
          Status: searchResults[stIndex].getValue(arrColumns[6]),
        })
      }
    }
  }

  catch (ex) {
    nlapiLogExecution('ERROR', 'READCHANGENAME ERROR', _parseError(ex))
  }

  nlapiLogExecution('AUDIT', 'READCHANGENAME PersonalInfo', '======END======');
  objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
}
