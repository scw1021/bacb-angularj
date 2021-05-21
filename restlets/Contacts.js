var ACTIONS = {
  Create :  _Create,
  Read :  _Read,
  Update :  _Update,
  Delete :  _Delete,
  CreateContactLink :  _CreateContactLink,
  ReadContactLink : _ReadContactLink,

  DeleteContactLink : _DeleteContactLink,
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
  nlapiLogExecution('AUDIT','Contacts.ss Create', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  var objDataResponse = {Response: 'F', Message: 'Default', ReturnId:'' }
  try {
    var newContact =  nlapiCreateRecord('customrecord_rc_contact');
    newContact.setFieldValue('custrecord_rc_contact_customer', stCustId);
    objDataResponse.ReturnId = nlapiSubmitRecord(newContact);
    objDataResponse.Message = 'Contact.SS create successeded'
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'Contact.ss Create', ex.message)
    objDataResponse.Message = ex.message;
    objDataResponse.Response = 'F'
  }
  nlapiLogExecution('AUDIT','Contacts.ss Create', "=====END=====");
  return (JSON.stringify(objDataResponse));
}

function _Read(objRequest){
  nlapiLogExecution('AUDIT','Contacts.ss Read', "=====START=====");
  nlapiLogExecution('AUDIT','Contacts.ss Read', "=====END=====");
  return 'not implemented'
}
function _Update(objRequest){
  nlapiLogExecution('AUDIT','Contacts.ss Update', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT','Contacts.ss Update', "=====END=====");
}
function _Delete(objRequest){
  nlapiLogExecution('AUDIT','Contacts.ss Delete', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT','Contacts.ss Delete', "=====END=====");
}




function _CreateContactLink(objRequest){
  nlapiLogExecution('AUDIT','Contacts.ss CreateContactLink', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

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
  nlapiLogExecution('AUDIT','Contacts.ss CreateContactLink', "=====END=====");
  return (JSON.stringify(objDataResponse));
}
 // Read all contact
 function _ReadContactLink(objRequest){
   // nlapiLogExecution('AUDIT','Contacts.ss ReadContactLink', "=====START=====");
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

   // nlapiLogExecution('AUDIT','Contacts.ss ReadContactLink', "=====END====");
 }

function _DeleteContactLink(objRequest){
  nlapiLogExecution('AUDIT','Contacts.ss DeleteContactLink', "=====START=====");
  var objDataResponse = {Response: 'F', Message: 'Default', ReturnId:'' };
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  try{
    nlapiDeleteRecord('customrecord_rc_contact_link', objRxData.ContactLinkId );
    objDataResponse.Response = "T";
    objDataResponse.Message = "contact link deletion successful";
  } catch(ex){
    nlapiLogExecution('ERROR', 'Contact.ss DeleteContactLink', 'Deletion Failed');
  }

  nlapiLogExecution('AUDIT','Contacts.ss DeleteContactLink', "=====END=====");
  return JSON.stringify(objDataResponse)
}
