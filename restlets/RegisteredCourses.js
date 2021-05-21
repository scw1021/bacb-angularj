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

function _Create(objRequest){
  var ssAndFunctionString = 'RegisteredCourses.ss Create';
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====START=====');
  var httpBody = objRequest;
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
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====END=====');
  return (JSON.stringify(objDataResponse));
}
function _DeleteDepartmentContactLink(objRequest){
  var ssAndFunctionString = 'RegisteredCourses.ss DeleteDepartmentContactLink';
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
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
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====END=====');
  return (JSON.stringify(objDataResponse));
}

function _CreateDepartmentContactLink(objRequest) {
  var ssAndFunctionString = 'RegisteredCourses.ss CreateDepartmentContactLink';
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
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
  nlapiLogExecution('AUDIT',ssAndFunctionString, '=====END=====');
  return (JSON.stringify(objDataResponse));
}

function _GetContactDepartmentsAndInstitutionNames(objRequest){
    nlapiLogExecution('AUDIT','RegisteredCourses.ss GetContactDepartmentsAndInstitutionNames', '=====START=====');
    var stCustId = objRequest['CustomerId'];
    var objRxData = objRequest;

    var objDataResponse = {
        "Array": []
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
  nlapiLogExecution('AUDIT','RegisteredCourses.ss GetContactDepartmentsAndInstitutionNames', '======END======');
  return (JSON.stringify(objDataResponse));
};


function _GetContentAreaHoursAllocationMetaData(objRequest){
  // In case the naming convention makes much more sense to present Matt than future Matt, Here is info on this service.
  // This service only returns the metadata for the table known as
  nlapiLogExecution('AUDIT','GetContentAllocationMetaData RegisteredCourses.ss', '=====START=====');
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
  nlapiLogExecution('AUDIT','GetContentAllocationMetaData RegisteredCourses.ss', '=====END=====')
  return JSON.stringify(objDataResponse);
}
