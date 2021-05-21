var ACTIONS = {
    Create: _Create,
   // Delete: _Delete,
   // Read: _Read,
    Update: _Update
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}

};

function _Create(objRequest, objResponse) {
    E$.logAudit('CREATE Departments', '=====START=====');
    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Create Departments', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Create Departments', 'CREATE function in Departments executed.');
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Create Departments', 'Body of the request is not defined.');
    }

    var objDataResponse = {
        "Response" : 'F',
        "Message" : '',
        "ReturnId" : 0
    }

    // Get the customer specific records, starting by determining customer information
    var arrContactFilters = new Array();
    arrContactFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);

    var ContactSearchResults = nlapiSearchRecord('customrecord_rc_contact', null, arrContactFilters, null);
    E$.logAudit('GetContactDepartments Utility','ContactSearchResults: ' + JSON.stringify(ContactSearchResults));

    // We should only ever have one result, but for continuity, we perform this action
    if (!(ContactSearchResults instanceof Array)) {
    ContactSearchResults = [ContactSearchResults];
    }
    if (ContactSearchResults) {
        if (objRxData.Name) {
            try {
                var recNewDepartment = nlapiCreateRecord('customrecord_rc_department');

                recNewDepartment.setFieldValue('custrecord_rc_depart_institution', objRxData.InstitutionId);
                recNewDepartment.setFieldValue('custrecord_rc_depart_name', objRxData.Name);
                // This next line is necessary because if you have a 'Name' field, NS creates ANOTHER field called 'includename'
                // which is controlled by a radio button on the netsuite record type page. If you click that radio button it changes whether the includename field is needed
                recNewDepartment.setFieldValue('name', objRxData.Name);
                recNewDepartment.setFieldValue('custrecord_rc_depart_website', objRxData.Website);
                recNewDepartment.setFieldValue('custrecord_rc_depart_contact', ContactSearchResults[0].getId());
                // Since additional stuff is needed
                objDataResponse.ReturnId = nlapiSubmitRecord(recNewDepartment, true);
            }
            catch (ex) {
                nlapiLogExecution('ERROR', 'CREATE Departments', 'The attempt to write to the RC Department record type failed:' + ex.message);
                objDataResponse.Message = ex.message;
                objResponse.setContentType('PLAINTEXT');
                objResponse.write(JSON.stringify(objDataResponse));
            }

            if (objDataResponse.ReturnId) {
                objDataResponse.Response = 'T';
                objDataResponse.Message = 'Department created successfully.'
            }
        }
        else {
            throw nlapiCreateError('Create Departments', 'Department name is invalid.');
        }
    }
    else {
        throw nlapiCreateError('Create Departments', 'No valid contact record found.');
    }



    E$.logAudit('CREATE Departments', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
}

function _Update(objRequest, objResponse){
  E$.logAudit('Departments.ss UPDATE', '=====START=====');
  try {
      var objSession = nlapiGetWebContainer().getShoppingSession();
      var stCustId = objSession.getCustomer().getFieldValues().internalid;

  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Create Departments', 'The call to get the current web session failed.:' + ex.message)
  }
  nlapiLogExecution('AUDIT', 'Create Departments', 'CREATE function in Departments executed.');

  var stBody = objRequest.getBody();
if (stBody) {
      objRxData = JSON.parse(stBody);
  }
  else {
      nlapiLogExecution('ERROR', 'Create Departments', 'Body of the request is not defined.');
  }

  var objDataResponse = {
      "Response" : 'F',
      "Message" : '',
      "ReturnId" : 0
  }

  // Get the customer specific records, starting by determining customer information
  var arrContactFilters = new Array();
  arrContactFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);

  var ContactSearchResults = nlapiSearchRecord('customrecord_rc_contact', null, arrContactFilters, null);
  E$.logAudit('GetContactDepartments Utility','ContactSearchResults: ' + JSON.stringify(ContactSearchResults));

  // We should only ever have one result, but for continuity, we perform this action
  if (!(ContactSearchResults instanceof Array)) {
  ContactSearchResults = [ContactSearchResults];
  }
  if (ContactSearchResults) {
      if (objRxData.Name) {
          try {
              var recNewDepartment = nlapiLoadRecord('customrecord_rc_department', objRxData.Id);

              recNewDepartment.setFieldValue('custrecord_rc_depart_institution', objRxData.InstitutionId);
              recNewDepartment.setFieldValue('custrecord_rc_depart_name', objRxData.Name);
              // This next line is necessary because if you have a 'Name' field, NS creates ANOTHER field called 'includename'
              // which is controlled by a radio button on the netsuite record type page. If you click that radio button it changes whether the includename field is needed
              recNewDepartment.setFieldValue('name', objRxData.Name);
              recNewDepartment.setFieldValue('custrecord_rc_depart_website', objRxData.Website);
              recNewDepartment.setFieldValue('custrecord_rc_depart_contact', ContactSearchResults[0].getId());
              // Since additional stuff is needed
              objDataResponse.ReturnId = nlapiSubmitRecord(recNewDepartment, true);
          }
          catch (ex) {
              nlapiLogExecution('ERROR', 'UPDATE Departments', 'The attempt to write to the RC Department record type failed:' + ex.message);
              objDataResponse.Message = ex.message;
              objResponse.setContentType('PLAINTEXT');
              objResponse.write(JSON.stringify(objDataResponse));
          }

          if (objDataResponse.ReturnId) {
              objDataResponse.Response = 'T';
              objDataResponse.Message = 'Department updated successfully.'
          }
      }
      else {
          throw nlapiCreateError('UPDATE Departments', 'Department name is invalid.');
      }
  }
  else {
      throw nlapiCreateError('UPDATE Departments', 'No valid contact record found.');
  }



  E$.logAudit('UPDATE Departments', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
}
