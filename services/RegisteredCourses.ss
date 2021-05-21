// To avoid waiting 24HRS, getactionitem is being tossed in here for now.
// as of 1.29.20, should all be moved over
var ACTIONS = {
  // GetAll: _GetAll,
  // PersistCourseChange: _PersistCourseChange,
  // PersistNewDepartment: _PersistNewDepartment,
  Create: _Create,
  DeleteDepartmentContactLink: _DeleteDepartmentContactLink,
  CreateDepartmentContactLink: _CreateDepartmentContactLink,
  GetContactDepartmentsAndInstitutionNames: _GetContactDepartmentsAndInstitutionNames,
  GetContentAreaHoursAllocationMetaData: _GetContentAreaHoursAllocationMetaData,
  ReadActionItem: _ReadActionItem
};

function service(objRequest, objResponse) {

  var stParam = objRequest.getParameter('param');

// We are mapping 'some string' sent as 'param' to a given function
  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }

};

// Should not be here long term atoll, if you're seeing past february 2020, is missed steak
function _ReadActionItem(objRequest, objResponse){
  var ssAndFnName = 'ActionItem.ss ReadActionItem';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", ssAndFnName, "The call to get the current web session failed.:" + ex.message);
  }
  // Kill this on read
  var objDataResponse = {
    "Array": []
  };
  //{'Response': 'F','Message': '', 'ReturnId': 'default'}
  var stBody = objRequest.getBody();
  if (stBody) {
    var httpBody = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", ssAndFnName, "Body of the request is not defined.");
  }
  var testBody = {'certificationCycleId' : '204'};
  var actionItemFilters = [];
  var actionItemColumns = [];
  actionItemFilters[0] = new nlobjSearchFilter('custrecord_action_item_cert_cycle', null, 'is', testBody.certificationCycleId);
  actionItemColumns[0] = new nlobjSearchColumn('custrecord_action_item_abstract');
  actionItemColumns[1] = new nlobjSearchColumn('custrecord_action_item_custom_text');
  actionItemColumns[2] = new nlobjSearchColumn('custrecord_action_item_due_date');
  actionItemColumns[3] = new nlobjSearchColumn('custrecord_action_item_document_required');
  actionItemColumns[4] = new nlobjSearchColumn('custrecord_action_item_date_submitted');
  actionItemColumns[5] = new nlobjSearchColumn('custrecord_action_item_status');
  actionItemColumns[6] = new nlobjSearchColumn('custrecord_action_item_source');
  actionItemColumns[7] = new nlobjSearchColumn('custrecord_action_item_type');
  actionItemColumns[8] = new nlobjSearchColumn('custrecord_action_item_cert_cycle');
  try{
    var searchResults = nlapiSearchRecord('customrecord_action_item', null, actionItemFilters, actionItemColumns);
    if(! searchResults instanceof Array){
      searchResults = [searchResults];
    }
    //nlapiLogExecution('AUDIT', ssAndFnName, JSON.stringify(nlapiLoadRecord(searchResults)));
    for(index in searchResults){
      //var sourceSerchCols = [];
      //var typeFilter = new nlobjSearchFilter('custom');
      var statusFilter = new nlobjSearchFilter('internalid', null, 'is', searchResults[index].getValue(actionItemColumns[5]));
      var statusColumn = new nlobjSearchColumn('custrecord_entity_status_ext_name');
      var statusSearch = nlapiSearchRecord('customrecord_entity_status', null, statusFilter, statusColumn);
      var sourceFilter = new nlobjSearchFilter('internalid', null, 'is', searchResults[index].getValue(actionItemColumns[6]));
      //var sourceColumn = new nlobjSearchColumn('customlist_')
      if(!statusSearch instanceof Array){
        statusSearch = [statusSearch];
      }
      objDataResponse.Array.push({
        'id': searchResults[index].getId(),
        'abstract' : searchResults[index].getValue(actionItemColumns[0]),
        'customText' : searchResults[index].getValue(actionItemColumns[1]),
        'dueDate' : searchResults[index].getValue(actionItemColumns[2]),
        'documentRequired' : searchResults[index].getValue(actionItemColumns[3]),
        'dateSubmitted' : searchResults[index].getValue(actionItemColumns[4]),
         'status' : {
           'Id': searchResults[index].getValue(actionItemColumns[5]),
           'Value': statusSearch[0].getValue(statusColumn),
         },
        'source' : {
          'Id': searchResults[index].getValue(actionItemColumns[6]),
          'Value':searchResults[index].getText(actionItemColumns[6]),
        },
        'type' : {
          'Id' : searchResults[index].getValue(actionItemColumns[7]),
          'Value': searchResults[index].getText(actionItemColumns[7])},
        'certCycle' : searchResults[index].getValue(actionItemColumns[8]),
      });
    }
  }catch(ex){
    nlapiLogExecution('ERROR', ssAndFnName, 'Search for action item failed'+ ex) ;
  }
  objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
  nlapiLogExecution("AUDIT", ssAndFnName, "=====END=====");
}


function _Create(objRequest, objResponse){
  var ssAndFunctionString = 'RegisteredCourses.ss Create';
  E$.logAudit(ssAndFunctionString, '=====START=====');
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', ssAndFunctionString, 'The call to get the current web session failed.:' + ex.message)
  }

  var stBody = objRequest.getBody();
	if (stBody) {
    var httpBody = JSON.parse(stBody);
  }
  var objDataResponse = {"Message":'Default', "Response": "F", "ReturnId": "" }
  try{
    var createdRecord = nlapiCreateRecord("customrecord_rc_registered_courses");
    createdRecord.setFieldValue('custrecord_rc_reg_course_department', httpBody.DepartmentId);
    createdRecord.setFieldValue('custrecord_reg_course_name', httpBody.Name);
    createdRecord.setFieldValue('custrecord_reg_course_approval_level', httpBody.ApprovalLevel);
    createdRecord.setFieldValue('custrecord_reg_course_academic_struct', httpBody.AcademicStructure.Id);
    createdRecord.setFieldValue('custrecord_reg_course_type', httpBody.Type);
    objDataResponse.ReturnId = nlapiSubmitRecord(createdRecord, true);
    if(objDataResponse.ReturnId){
      objDataResponse.Response = "T";
      objDataResponse.Message = "Registered Course Record Created Successfully";
    }
  }
  catch(ex){
    nlapiLogExecution('ERROR', ssAndFunctionString, 'Record creation failed:' + ex.message)
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit(ssAndFunctionString, '=====END=====');
}
function _DeleteDepartmentContactLink(objRequest, objResponse){
  var ssAndFunctionString = 'RegisteredCourses.ss DeleteDepartmentContactLink';
  E$.logAudit(ssAndFunctionString, '=====START=====');
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', ssAndFunctionString, 'The call to get the current web session failed.:' + ex.message)
  }

  var stBody = objRequest.getBody();
	if (stBody) {
    var httpBody = JSON.parse(stBody);
  }
  var objDataResponse = {Response: 'F', Message: 'No Id found, please contact support'};
  var searchFiltersArr = [];
  var searchColumnsArr = [];
  try{
    searchFiltersArr[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', 'custrecord_rc_contact_link_contact', 'is', stCustId);
    searchColumnsArr[0] = new nlobjSearchColumn('custrecord_rc_contact_link_dept');
    searchColumnsArr[1] = new nlobjSearchColumn('custrecord_rc_contact_link_contact');
    var searchResults = nlapiSearchRecord('customrecord_rc_contact_link', null, searchFiltersArr, searchColumnsArr);
  }catch(ex){
    nlapiLogExecution('ERROR', ssAndFunctionString, 'The call to get the current web session failed.:' + ex.message);
  }
  if(!(searchResults instanceof Array)){
    searchResults = [searchResults];
  }
  try{
  for(index in searchResults){
    if(searchResults[index].getValue(searchColumnsArr[0]) == httpBody.Id){
      nlapiDeleteRecord('customrecord_rc_contact_link', searchResults[index].getId());
      objDataResponse.Message = "Success"
      objDataResponse.Response = "T"
      nlapiLogExecution('AUDIT', ssAndFunctionString,  'valinloop' + searchResults[index].getValue(searchColumnsArr[0]));
    }
  }
  } catch(ex){
    objDataResponse.Message = ex.Message;
    nlapiLogExecution('ERROR', ssAndFunctionString, 'deletion failed: ' + ex.message)
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit(ssAndFunctionString, '=====END=====');


}

function _CreateDepartmentContactLink(objRequest, objResponse) {
  var ssAndFunctionString = 'RegisteredCourses.ss CreateDepartmentContactLink';
  E$.logAudit(ssAndFunctionString, '=====START=====');
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', ssAndFunctionString, 'The call to get the current web session failed.:' + ex.message)
  }
  var stBody = objRequest.getBody();
	if (stBody) {
    var  httpBody = JSON.parse(stBody);
  }
  var objDataResponse = {'Message': 'Default', 'Response': 'F', 'ReturnId': '0'}
  var searchFilters = [];
  //Add trycatch
  try{
  searchFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);
  var searchResults = nlapiSearchRecord('customrecord_rc_contact', null, searchFilters, null);
  }catch(ex){
    nlapiLogExecution('ERROR', ssAndFunctionString, 'Contact search failed:' + ex.message);
  }
  if(!(searchResults instanceof Array )){
    searchResults = [searchResults];
  }
  if(searchResults.length){
    try{
      var newRecord = nlapiCreateRecord('customrecord_rc_contact_link')
      newRecord.setFieldValue('custrecord_rc_contact_link_dept', httpBody.DepartmentId)
      newRecord.setFieldValue('custrecord_rc_contact_link_contact', searchResults[0].getId())
      objDataResponse.ReturnId = nlapiSubmitRecord(newRecord);
      if(objDataResponse.ReturnId){
        objDataResponse.Message = 'Contact Link Successfully Created'
        objDataResponse.Response = "T";
      }
    } catch(ex){
      nlapiLogExecution('ERROR', ssAndFunctionString, 'Record submission failed:' + ex.message)
    }
  } else {
    nlapiLogExecution('ERROR', ssAndFunctionString, 'No contact found:' + ex.message)
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit(ssAndFunctionString, '=====END=====');
}

function _GetContactDepartmentsAndInstitutionNames(objRequest, objResponse){
    E$.logAudit('RegisteredCourses.ss GetContactDepartmentsAndInstitutionNames', '=====START=====');

    try {
      var objSession = nlapiGetWebContainer().getShoppingSession();
      var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'RegisteredCourses.ss GetContactDepartmentsAndInstitutionNames', 'The call to get the current web session failed.:' + ex.message)
    }

    var objDataResponse = {
        "Array": []
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
    try{
    for (var stContactIndex in ContactSearchResults) {
      var arrFilters = new Array();
      arrFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_link_contact',null,'is', ContactSearchResults[stContactIndex].getId());
      var arrColumns = new Array();
      arrColumns[0] = new nlobjSearchColumn('custrecord_rc_contact_link_dept');
      arrColumns[1] = new nlobjSearchColumn('custrecord_rc_depart_name','custrecord_rc_contact_link_dept');
      arrColumns[2] = new nlobjSearchColumn('custrecord_rc_depart_website','custrecord_rc_contact_link_dept');
      arrColumns[3] = new nlobjSearchColumn('custrecord_rc_depart_institution','custrecord_rc_contact_link_dept');

      var searchResults = nlapiSearchRecord('customrecord_rc_contact_link',null, arrFilters, arrColumns);
      if ( searchResults !== null ) {
        if ( !(searchResults instanceof Array && searchResults.length) ) {
          searchResults = [searchResults]
        }
        for (var stIndex in searchResults) {
          var arrayInstitutionFilters = new Array();
          var arrayInstitutionColumns = new Array();
          arrayInstitutionFilters[0] = new nlobjSearchFilter('internalid', null, 'is', searchResults[stIndex].getValue(arrColumns[3]));
          arrayInstitutionColumns[0] = new nlobjSearchColumn('custrecord_rc_inst_name');
          var searchInstitutionRecords = nlapiSearchRecord('customrecord_rc_institution', null, arrayInstitutionFilters, arrayInstitutionColumns)
//            nlapiLogExecution('AUDIT', 'utilityinstitutionsorsomethinglastline', JSON.stringify(searchInstitutionRecords[0].getValue(arrayInstitutionColumns[0])))
          objDataResponse.Array.push({
            'InstitutionId': searchInstitutionRecords[0].getId(),
            'InstitutionName' : searchInstitutionRecords[0].getValue(arrayInstitutionColumns[0]),
            'Id': searchResults[stIndex].getValue(arrColumns[0]),
            'Name': searchResults[stIndex].getValue(arrColumns[1]),
            'Website': searchResults[stIndex].getValue(arrColumns[2]),
          });
        }
      }
    }
  }
  catch(ex){
    nlapiLogExecution('ERROR', ex.message)
  }
    E$.logAudit('RegisteredCourses.ss GetContactDepartmentsAndInstitutionNames', '======END======');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
    };


function _GetContentAreaHoursAllocationMetaData(objRequest, objResponse){
  // In case the naming convention makes much more sense to present Matt than future Matt, Here is info on this service.
  // This service only returns the metadata for the table known as
  E$.logAudit('GetContentAllocationMetaData RegisteredCourses.ss', '=====START=====');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'GetContentAllocationMetaData RegisteredCourses.ss', 'The call to get the current web session failed.:' + ex.message)
  }
  var objDataResponse = {
      "Array": []
  }
  columnsArray = new Array();
  filtersArray = new Array();
  try{

  columnsArray[0] = new nlobjSearchColumn('custrecord_content_area_hour_type_abbrev');
  columnsArray[1] = new nlobjSearchColumn('custrecord_content_area_hour_type_name');
  columnsArray[2] = new nlobjSearchColumn('custrecord_content_area_hour_type_value');

  var searchResults = nlapiSearchRecord('customrecord_content_hour_alloc_type',null,null,columnsArray);
  } catch(ex){
    nlapiLogExecution('ERROR', 'GetContentAllocationMeta Failed', 'Search result failure' + ex.message)
  }
  if(!(searchResults instanceof Array || searchResults instanceof null)){
    searchResults = [searchResults]
  } else if (searchResults !== null && searchResults instanceof Array){
    for(index in searchResults){
      objDataResponse.Array.push({
        Id: searchResults[index].getId(),
        Abbrev: searchResults[index].getValue(columnsArray[0]),
        Name: searchResults[index].getValue(columnsArray[1]),
        Display: searchResults[index].getValue(columnsArray[2]),
      })
    }
  } else {
    objDataResponse.push({Abbrev: 'Default, null', Name: 'Default, null', Abbrev: 'Default, null'})
  }
  E$.logAudit('GetContentAllocationMetaData RegisteredCourses.ss', '=====END=====')
  objResponse.setContentType('PLAINTEXT')
  objResponse.write(JSON.stringify(objDataResponse))
}
