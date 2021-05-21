var ACTIONS = {
 Create :  _Create,
 Read :  _Read,
 Update :  _Update,
 Delete :  _Delete,
 CreateContactLink :  _CreateContactLink,
 ReadContactLink : _ReadContactLink,

 DeleteContactLink : _DeleteContactLink,
};

function service(objRequest, objResponse) {
	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}
};

function _Create(objRequest,objResponse){
  E$.logAudit('Contacts.ss Create', "=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Contacts.ss Create', 'The call to get the current web session failed.:' + ex.message)
  }
  var objRxData;
  var stBody = objRequest.getBody()
  if(stBody){
    objRxData = JSON.parse(stBody)
  } else {
    nlapiLogExecution('ERROR', 'Contact.ss Create', 'HTTP body failed to parse')
  }
  var objDataResponse = {Response: 'F', Message: 'Default', ReturnId:'' }
  try{
   var newContact =  nlapiCreateRecord('customrecord_rc_contact');
   newContact.setFieldValue('custrecord_rc_contact_customer', stCustId);
   objDataResponse.ReturnId = nlapiSubmitRecord(newContact);
   objDataResponse.Message = 'Contact.SS create successeded'
  } catch(ex){
    nlapiLogExecution('ERROR', 'Contact.ss Create', ex.message)
    objDataResponse.Message = ex.message;
    objDataResponse.Response = 'F'
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit('Contacts.ss Create', "=====END=====");
}

function _Read(objRequest,objResponse){
  E$.logAudit('Contacts.ss Read', "=====START=====");
  E$.logAudit('Contacts.ss Read', "=====END=====");
}
function _Update(objRequest,objResponse){
  E$.logAudit('Contacts.ss Update', "=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Contacts.ss Update', 'The call to get the current web session failed.:' + ex.message)
  }
  E$.logAudit('Contacts.ss Update', "=====END=====");
}
function _Delete(objRequest,objResponse){
  E$.logAudit('Contacts.ss Delete', "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Contacts.ss Delete', 'The call to get the current web session failed.:' + ex.message)
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit('Contacts.ss Delete', "=====END=====");
}




function _CreateContactLink(objRequest,objResponse){
  E$.logAudit('Contacts.ss CreateContactLink', "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Contact.ss CreateContactLink', 'The call to get the current web session failed.:' + ex.message)
  }
  var objRxData;
  var stBody = objRequest.getBody()
  if(stBody){
    objRxData = JSON.parse(stBody)
  } else {
    nlapiLogExecution('ERROR', 'Contact.ss CreateContactLink', 'HTTP body failed to parse')
  }
  var objDataResponse = {Response: 'F', Message: 'Default', ReturnId:'' };
  var contactId = '';
  try{
    var searchFilter = [];
    searchFilter[0] = nlapiSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);
    var searchResult = nlapiSearchRecord('customrecord_rc_contact', null, searchFilter, null);
    if(searchResult !== null){
      if(!(searchResult instanceof Array && searchResult.length)){
        searchResult = [searchResult];
      }
      if(searchResult.length > 1){
        nlapiLogExecution('ERROR', 'Contact.ss CreateContactLink', 'Customer' + stCustId + 'has more than one contact' );
      }
      contactId = searchResult[0].getId();

    } else {
      try{
      var newContact = nlapiCreateRecord('customrecord_rc_contact');
      newContact.setFieldValue('custrecord_rc_contact_customer', stCustId);
      contactId = nlapiSubmitRecord(newContact);
      } catch(ex){
        nlapiLogExecution('ERROR', 'Contact.ss CreateContactLink', 'Contact record submission failed: ' + ex.message );
      }
    }

  }catch(ex){
    nlapiLogExecution('ERROR', "Contact.ss CreateContactLink", 'Search for customer:' + stCustId + ' failed' );
  }
  try{
    var newContactLink = nlapiCreateRecord('customrecord_rc_contact_link');
    newContactLink.setFieldValue('custrecord_contact_link_dept',objRxData.DepartmentId);
    newContactLink.setFieldValue('custrecord_contact_link_contact', contactId);
    objDataResponse.ReturnId = nlapiSubmitRecord(newContactLink);
    if(objDataResponse.ReturnId){
      objDataResponse.Response = "T";
      objDataResponse.Message = "New Contact Link creation was successful";
    }
  }   catch (ex) {
    nlapiLogExecution('ERROR', 'Contacts.ss CreateContactLink', 'The call to get the current web session failed.:' + ex.message);
}
  E$.logAudit('Contacts.ss CreateContactLink', "=====END=====");
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
}
// Read all contact
function _ReadContactLink(objRequest,objResponse){
  // E$.logAudit('Contacts.ss ReadContactLink', "=====START=====");
  // try {
  //   var objSession = nlapiGetWebContainer().getShoppingSession();
  //   var stCustId = objSession.getCustomer().getFieldValues().internalid;
  // }
  // catch (ex) {
  //     nlapiLogExecution('ERROR', 'Contact.ss ReadContactLink', 'The call to get the current web session failed.:' + ex.message)
  // }
  // var objDataResponse = {Array: []};
  // try{
  //   var searchFilters = [];
  //   searchFilters[0] = nlapiSearchFilter('custrecord_rc_contact_customer', 'custrecord_rc_contact_link_contact', 'is', stCustId );
  //   var searchColumns = [];
  //   searchColumns[0] = nlapiSearchColumn('custrecord_rc_')
  // }

  // E$.logAudit('Contacts.ss ReadContactLink', "=====END====");
}

function _DeleteContactLink(objRequest,objResponse){
  E$.logAudit('Contacts.ss DeleteContactLink', "=====START=====");
  var objDataResponse = {Response: 'F', Message: 'Default', ReturnId:'' };
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Contact.ss DeleteContactLink', 'The call to get the current web session failed.:' + ex.message);
  }
  if(stBody){
    objRxData = JSON.parse(stBody)
  } else {
    nlapiLogExecution('ERROR', 'Contact.ss DeleteContactLink', 'HTTP body failed to parse')
  }
  try{
    nlapiDeleteRecord('customrecord_rc_contact_link', objRxData.ContactLinkId );
    objDataResponse.Response = "T";
    objDataResponse.Message = "contact link deletion successful";
  } catch(ex){
    nlapiLogExecution('ERROR', 'Contact.ss DeleteContactLink', 'Deletion Failed');
  }

  E$.logAudit('Contacts.ss DeleteContactLink', "=====END=====");
}
