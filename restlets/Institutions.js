var ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Update: _Update
};

function service(objRequest) {
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest))

	var stParam = objRequest['param'];
	if (ACTIONS[stParam]) {
		return ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};

function _Create(objRequest){
  nlapiLogExecution('AUDIT','CREATE Institutions', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Institutions executed.');

  var objDataResponse = {
      "Response" : 'F',
      "Message" : '',
      "ReturnId" : 0
  }

  if (objRxData.Name) {
          var RCInstitutionId = 0;
          var InstitutionAddressId = 0;
          // Create RC Institution
          try {
              var recNewUniqueInstitution = nlapiCreateRecord('customrecord_rc_institution');

              recNewUniqueInstitution.setFieldValue('custrecord_rc_inst_name', objRxData.Name);
              recNewUniqueInstitution.setFieldValue('custrecord_rc_inst_website', objRxData.WebSite);
              recNewUniqueInstitution.setFieldValue('custrecord_rc_inst_requested_by', stCustId);

              RCInstitutionId = nlapiSubmitRecord(recNewUniqueInstitution, true);
          }
          catch (ex) {
              nlapiLogExecution('ERROR', 'CREATE Institutions', 'The attempt to write to the RC Institution record type failed:' + ex.message);
              objDataResponse.Message = ex.message;
              objResponse.setContentType('PLAINTEXT');
              objResponse.write(JSON.stringify(objDataResponse));
          }

          // Create Institution Address
          try {
              var recInstitutionAddress = nlapiCreateRecord('customrecord_rc_inst_address');

              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_inst', RCInstitutionId);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_address1', objRxData.Address1);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_address2', objRxData.Address2);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_city', objRxData.City);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_state', objRxData.State);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_country', objRxData.Country);
              recInstitutionAddress.setFieldValue('custrecord_rc_inst_add_postal_code')

              InstitutionAddressId = nlapiSubmitRecord(recInstitutionAddress, true);
          }
          catch (ex) {
              nlapiLogExecution('ERROR', 'CREATE Institutions', 'The attempt to write to the RC Institution Address record type failed:' + ex.message);
              objDataResponse.Message = ex.message;
              objResponse.setContentType('PLAINTEXT');
              objResponse.write(JSON.stringify(objDataResponse));
          }
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'New institution was created successfully.'
          objDataResponse.ReturnId = InstitutionId;
  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Institution name is invalid.');
  }

  nlapiLogExecution('AUDIT','CREATE Institutions', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {

};

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ Institutions', '=====START=====');
  nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in Institutions executed.');

  var objDataResponse = {
       Array: []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_rc_inst_name').setSort(false);
  arrColumns[1] = new nlobjSearchColumn('custrecord_rc_inst_website');

  var searchResults = nlapiSearchRecord('customrecord_rc_institution', null, null, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Array.push({ "Name": searchResults[stIndex].getValue(arrColumns[0]),
                                  "Id": searchResults[stIndex].getId(),
                                  "Website": searchResults[stIndex].getValue(arrColumns[1]),
                "Address":{"Index": '',
                       "Address1": '',
                      "Address2": '',
                      "City": '',
                      "State": {"Id": '',
                             "Abbrev": '',
                            "Name": ''},
                      "Country": {"Id": '',
                            "Name": '',
                            "Abbrev": '',
                            "Enumeration": '',
                            "Discount": '',
                            "DialCode": ''},
                      "PostalCode": '',
                      "isShipping": 'F',
                      "isBilling": 'F'
                      }
                              });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Array.push({"Name": searchResults.getValue(arrColumns[0]),
                                  "Id": searchResults.getId(),
                                  "Website": searchResults.getValue(arrColumns[1]),
                                  "Address":{"Index": '',
                                              "Address1": '',
                                              "Address2": '',
                                              "City": '',
                                              "State": {"Id": '',
                                                          "Abbrev": '',
                                                          "Name": ''},
                                              "Country": {"Id": '',
                                                          "Name": '',
                                                          "Abbrev": '',
                                                          "Enumeration": '',
                                                          "Discount": '',
                                                          "DialCode": ''},
                                              "PostalCode": '',
                                              "isShipping": 'F',
                                              "isBilling": 'F'
                                  }
                              });
  }

  nlapiLogExecution('AUDIT','READ Institutions', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {

};
