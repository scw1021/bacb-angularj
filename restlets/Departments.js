var ACTIONS = {
  Create: _Create,
 // Delete: _Delete,
 // Read: _Read,
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

function _Create(objRequest) {
  nlapiLogExecution('AUDIT','CREATE Departments', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Create Departments', 'CREATE function in Departments executed.');

  var objDataResponse = {
      "Response" : 'F',
      "Message" : '',
      "ReturnId" : 0
  }

  // Get the customer specific records, starting by determining customer information
  var arrContactFilters = new Array();
  arrContactFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);

  var ContactSearchResults = nlapiSearchRecord('customrecord_rc_contact', null, arrContactFilters, null);
  nlapiLogExecution('AUDIT','GetContactDepartments Utility','ContactSearchResults: ' + JSON.stringify(ContactSearchResults));

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



  nlapiLogExecution('AUDIT','CREATE Departments', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _Update(objRequest){
nlapiLogExecution('AUDIT','Departments.ss UPDATE', '=====START=====');
var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'Create Departments', 'CREATE function in Departments executed.');

var objDataResponse = {
    "Response" : 'F',
    "Message" : '',
    "ReturnId" : 0
}

// Get the customer specific records, starting by determining customer information
var arrContactFilters = new Array();
arrContactFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);

var ContactSearchResults = nlapiSearchRecord('customrecord_rc_contact', null, arrContactFilters, null);
nlapiLogExecution('AUDIT','GetContactDepartments Utility','ContactSearchResults: ' + JSON.stringify(ContactSearchResults));

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



nlapiLogExecution('AUDIT','UPDATE Departments', '======END======');
  return (JSON.stringify(objDataResponse));
}
