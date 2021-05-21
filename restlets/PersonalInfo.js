var ES_ACTIONS = {
  Check: _Check,
  Read: _Read,
  Update: _Update,
  Load: _GetCountries,
  ChangeNameRequest: _ChangeName,
  ReadNameChanges: _ReadNameChanges,
  GetAllCustomers: _GetAllCustomers,
};

function service(objRequest) {
  nlapiLogExecution('AUDIT', 'PersonalInfo.js', 'start')
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest))

	var stParam = objRequest['param'];
	if (ES_ACTIONS[stParam]) {
		return ES_ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};

function _GetAllCustomers(objRequest) {
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
  return JSON.stringify(objDataResponse);
}

function _Check(objRequest) {
  // nlapiLogExecution('AUDIT','CHECK PersonalInfo', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var recCustomer = nlapiLoadRecord("customer", stCustId);
  // nlapiLogExecution('AUDIT', 'CHECK_CALLED', 'CHECK function in PersonalInfo executed.');

  var objDataResponse = {
  'Response': 'F',
  'Message': ''
  };

  var objShippingAddress = _FindAddressIndex(recCustomer, "Shipping");
  nlapiLogExecution('AUDIT','Check PersonalInfo', "ShippingObject: " + JSON.stringify(objShippingAddress));
  if (objShippingAddress.isShipping === 'T') {
      objDataResponse.Response = 'T';
  }

  // nlapiLogExecution('AUDIT','CHECK PersonalInfo', '======END======');
  return JSON.stringify(objDataResponse);
};

function _Read(objRequest) {
  nlapiLogExecution("DEBUG", "Read PersonalInfo", "START");
    var stCustId = objRequest['CustomerId'];
    var recCustomer = nlapiLoadRecord("customer", stCustId);
    nlapiLogExecution("DEBUG", "Read PersonalInfo", "CustomerObj: " + JSON.stringify(recCustomer));

    // nlapiLogExecution('AUDIT', 'READ PersonalInfo', 'READ function in PersonalInfo executed.');

    var recProfile = nlapiLoadRecord('customrecord_profile', _GetProfile(stCustId));
    nlapiLogExecution("DEBUG", "Read PersonalInfo", "ProfileObj: " + JSON.stringify(recProfile));

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
      nlapiLogExecution('AUDIT','PersonalInfo_Read', _parseError(error));
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
    // nlapiLogExecution('AUDIT','Read PersonalInfo', 'AltPhone: ' + JSON.stringify(objDataResponse.AltPhone));
    objDataResponse.Mobile = function (Customer, Profile) {
        var MobilePhone = {'Country' : '',
                            'Number' : '',
                            'Ext' : '',
                            'IsMobile': 'T'};
        if (Customer.getFieldValue('phone') == Customer.getFieldValue('mobilephone')) {
          nlapiLogExecution('AUDIT','PersonalInfo_Read', 'primary mobile');
            MobilePhone = {
                Country: _GetCountry(recProfile.getFieldValue('custrecord_primary_phone_country_code')),
                Number: Customer.getFieldValue('phone'),
                Ext: Profile.getFieldValue('custrecord_profile_primary_ext'),
                IsMobile: 'T'
            }
        }
        // Cool so we kind of need to do a null check here
        else if ((Customer.getFieldValue('altphone') != null) && (Customer.getFieldValue('altphone') == Customer.getFieldValue('mobilephone'))) {
          nlapiLogExecution('AUDIT','PersonalInfo_Read', 'secondary mobile: ' + JSON.stringify(Customer.getFieldValue('altphone')) );
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

    nlapiLogExecution('AUDIT','READ PersonalInfo','Response: ' + JSON.stringify(objDataResponse));
    // nlapiLogExecution('AUDIT','READ PersonalInfo', '======END======');
  return JSON.stringify(objDataResponse);
};

function _GetProfile(CustomerID) {
  var ReturnID = 0;
  var arrFilters = [];

  // nlapiLogExecution('AUDIT','GetProfile PersonalInfo', 'CustomerID: ' + CustomerID);

  arrFilters[0] = new nlobjSearchFilter('custrecord_customer',null,'anyof', CustomerID);

  try {
      var searchResults = nlapiSearchRecord('customrecord_profile',null, arrFilters, null);
  }
  catch (ex) {
      nlapiLogExecution('AUDIT','GetProfile PersonalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'CustomerID: ' + CustomerID);
      return 0;
  }
  // nlapiLogExecution('AUDIT','GetProfile PersonalInfo After', 'CustomerID: ' + CustomerID + ' Result: ' + JSON.stringify(searchResults));

  if (searchResults instanceof Array && searchResults.length) {
      ReturnID = searchResults[0].getId();
  }
  else if (searchResults) {
      ReturnID = searchResults.getId();
  }
  else {
    nlapiLogExecution('AUDIT','GetProfile PersonalInfo inside', 'CustomerID: ' + CustomerID);
      var recNewProfile = nlapiCreateRecord('customrecord_profile', {recordmode: 'dynamic'});
      recNewProfile.setFieldValue('custrecord_customer', CustomerID);
      ReturnID = nlapiSubmitRecord(recNewProfile, true, true);
  }

  // nlapiLogExecution('AUDIT','GetProfile PersonalInfo bottom', 'CustomerID: ' + CustomerID + ' and ProfileID: ' + ReturnID);
  return ReturnID;
};


function _Update(objRequest) {
  nlapiLogExecution('AUDIT',"UPDATE PersonalInfo", "=====START=====");

  var stCustId = objRequest['CustomerId'];
  objRxData = objRequest['Profile'];
  var objDataResponse = {
    Response: "F",
    Message: ""
  };

  if (stCustId) {
    var recCustomer = nlapiLoadRecord("customer", stCustId, {recordmode: 'dynamic'});

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
    var CustomerId = nlapiSubmitRecord(recCustomer, true);

    if (objRxData.Addresses instanceof Array && objRxData.Addresses.length) {
      // nlapiLogExecution(
      //   "AUDIT",
      //   "Address Check",
      //   JSON.stringify(objRxData.Addresses[0])
      // );
      var objAddressIndex = _FindAddressIndex(recCustomer, "Shipping");
      // nlapiLogExecution(
      //   "DEBUG",
      //   "UPDATE - Shipping",
      //   "ObjectAddressIndex: " + JSON.stringify(objAddressIndex)
      // );
      if (!objAddressIndex.Index) {
        // nlapiLogExecution(
        //   "AUDIT",
        //   "Create Shipping Address",
        //   JSON.stringify(objRxData.Addresses[0])
        // );
        // No Address for shipping
        _CreateAddress(CustomerId, objRxData.Addresses[0])

      } else {
        if (objRxData.Addresses[0].isShipping == "T") {
          // nlapiLogExecution(
          //   "AUDIT",
          //   "Edit Shipping Address",
          //   JSON.stringify(objRxData.Addresses[0])
          // );
          // If Shipping Address is no longer also billing, this should be updated here
          _EditAddress(CustomerId, objAddressIndex, objRxData.Addresses[0]);
        }
      }
      // Well THERE YOU GO, if you never update the read objAI, then we never update billing
      // if (objAddressIndex.isBilling == "F"  && objRxData.Addresses[1]) {
      // So let's check for billing match on the objRequest and ensure there is another address to post
      if (objRxData.Addresses[0].isBilling ==  "F" && objRxData.Addresses[1] ) {
        objAddressIndex = _FindAddressIndex(recCustomer, "Billing");
        // nlapiLogExecution(
        //   "DEBUG",
        //   "UPDATE - Billing",
        //   "ObjectAddressIndex: " + JSON.stringify(objAddressIndex)
        // );
        if (!objAddressIndex.Index) {
          // No Address for billing
          if (objRxData.Addresses[1].isBilling == "T") {
            // nlapiLogExecution(
            //   "AUDIT",
            //   "Create Billing Address",
            //   JSON.stringify(objRxData.Addresses[1])
            // );
            _CreateAddress(CustomerId, objRxData.Addresses[1]);

          }
        } else {
          if (objRxData.Addresses[1].isBilling == "T") {
            // nlapiLogExecution(
            //   "AUDIT",
            //   "Edit Billing Address",
            //   JSON.stringify(objRxData.Addresses[1])
            // );
            objAddressIndex.Index  = 2;
            _EditAddress(CustomerId,objAddressIndex,objRxData.Addresses[1]);
          }
        }
      }
    }

    recCustomer = nlapiLoadRecord("customer", stCustId, {recordmode: 'dynamic'});

    try {
      var recOldProfile = nlapiLoadRecord("customrecord_profile", _GetProfile(stCustId));
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
      var ProfileId = nlapiSubmitRecord(recOldProfile, true);
    } catch (ex) {
      throw nlapiCreateError("UPDATE PersonalInfo", "Update profile record failed." + _parseError(ex));
    }
    if (CustomerId && ProfileId) {
      objDataResponse.Response = "T";
      objDataResponse.Message = "Profile updated.  Profile ID: " + ProfileId;
    }
  } else {
    throw nlapiCreateError("UPDATE PersonalInfo", "CustomerID is invalid.");
  }

  nlapiLogExecution('AUDIT',"UPDATE PersonalInfo", "======END======");
  return JSON.stringify(objDataResponse);
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
      nlapiLogExecution('AUDIT','PersonalProfile.ss/_FindAddressIndex', 'A user (' + recCustomer.FullName + ') without addresses has tried to get a list of addresses and an error was thrown... obviously. ' + _parseError(error));
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
    // nlapiLogExecution('AUDIT','ViewAddress PersonalInfo', 'Customer: ' + JSON.stringify(recCustomer) + "Before AddressIndex: " + iAddressIndex);
    if (!iAddressIndex){
        objAddressLineItem = _FindAddressIndex(recCustomer, AddressType);
        iAddressIndex = objAddressLineItem.Index;
        //nlapiLogExecution('AUDIT','ViewAddress PersonalInfo', "AddressIndex: " + iAddressIndex);
    }
    // nlapiLogExecution('AUDIT','ViewAddress PersonalInfo', 'Customer: ' + JSON.stringify(recCustomer) + "After AddressIndex: " + iAddressIndex);
    if (iAddressIndex != null) {
        recCustomer.selectLineItem('addressbook', iAddressIndex);
        var recAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
        //nlapiLogExecution('AUDIT','ViewAddress PersonalInfo','Address for index: ' + iAddressIndex + ' is: ' + JSON.stringify(recAddress));
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

function _GetCountryId(Abbrev) {
    var ReturnID = 0;
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_country_code',null,'is', Abbrev);

    try {
        var searchResults = nlapiSearchRecord('customrecord_countries',null, arrFilters, null);
    }
    catch (ex) {
        nlapiLogExecution('AUDIT','GetProfile PersonalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'Country Code: ' + Abbrev);
        return 0;
    }

    // nlapiLogExecution('AUDIT','GetProfile PersonalInfo GetCountryId', 'Abbrev: ' + Abbrev + ' Result: ' + JSON.stringify(searchResults));

    if (searchResults instanceof Array && searchResults.length) {
        ReturnID = searchResults[0].getId();
    }
    else if (searchResults) {
        ReturnID = searchResults.getId();
    }
    return ReturnID;
}

function _EditAddress(CustomerID, objAddressIndex, objAddress) {
  var recCustomer = nlapiLoadRecord("customer", CustomerID, {recordmode: "dynamic"});
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
    subrecord.commit();
    recCustomer.commitLineItem('addressbook');

    return nlapiSubmitRecord(recCustomer);
};

function _CreateAddress(CustomerID, ObjAddress) {
    var recCustomer = nlapiLoadRecord("customer", CustomerID, {recordmode: "dynamic"});
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
    recNewAddress.commit();
    recCustomer.commitLineItem('addressbook');
    return nlapiSubmitRecord(recCustomer);
};

function _GetCountries(objRequest) {
    // nlapiLogExecution('AUDIT','GetCountries PersonalInfo', '=====START=====');
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

    // nlapiLogExecution('AUDIT','GetCountries PersonalInfo', '======END======');
    return JSON.stringify(objDataResponse)
};

function _GetCountryId(Abbrev) {
    var ReturnID = 0;
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_country_code',null,'is', Abbrev);

    try {
        var searchResults = nlapiSearchRecord('customrecord_countries',null, arrFilters, null);
    }
    catch (ex) {
        nlapiLogExecution('AUDIT','GetProfile PersonalInfo Error', 'Message: ' + _parseError(ex) + ' ' + 'Country Code: ' + Abbrev);
        return 0;
    }

    // nlapiLogExecution('AUDIT','GetProfile PersonalInfo GetCountryId', 'Abbrev: ' + Abbrev + ' Result: ' + JSON.stringify(searchResults));

    if (searchResults instanceof Array && searchResults.length) {
        ReturnID = searchResults[0].getId();
    }
    else if (searchResults) {
        ReturnID = searchResults.getId();
    }
    return ReturnID;
}
function _GetCountry(CountryId) {
    // nlapiLogExecution('AUDIT','GetCountry PersonalInfo', '====START====');
    if (CountryId == null) {
      nlapiLogExecution('AUDIT','GetCountry PersonalInfo', 'Returned null because Country ID was null ==End==');
      return {};
    }
    // nlapiLogExecution('AUDIT','GetCountry PerosnalInfo','Country ID: ' + CountryId);

    var recCountry = nlapiLoadRecord('customrecord_countries', CountryId);
    var ReturnCountry = { 'Id': CountryId,
                          'Name' : recCountry.getFieldValue('custrecord_country_name'),
                          'Abbrev' : recCountry.getFieldValue('custrecord_country_code'),
                          'Enumeration' : recCountry.getFieldValue('custrecord_country_enumeration'),
                          'Discount' : recCountry.getFieldValue('custrecord_country_discount'),
                          'DialCode' : recCountry.getFieldValue('custrecord_country_dialcode')};

    // nlapiLogExecution('AUDIT','GetCountry PersonalInfo', '====End====');
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

  function _ChangeName(objRequest) {
    nlapiLogExecution('AUDIT', "CHANGENAME PersonalInfo", "=====START=====");
    var stCustId = objRequest['CustomerId'];
    nlapiLogExecution("DEBUG", "CHANGENAME PersonalInfo", "CHANGENAME function in PersonalInfo executed. Customer ID:" + stCustId);
    var objRxData = objRequest['Profile'];

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
    return JSON.stringify(objDataResponse)
  }

  function _ReadNameChanges(objRequest) {
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
    return JSON.stringify(objDataResponse)
  }
