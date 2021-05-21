var ACTIONS = {
  GetAll: _GetAll,
  GetCountries: _GetCountries,
  GetAllStates: _GetAllStates,
  GetCertTypes: _GetCertTypes,
  GetInstitutions: _GetInstitutions,
  GetInstructions: _GetInstructions,
  GetFirstCourseStartDate: _GetFirstCourseStartDate,
  GetExpTypes: _GetExpTypes,
  GetDepartments: _GetDepartments,
  GetContactDepartments: _GetContactDepartments,
  GetRegisteredCourses: _GetRegisteredCourses,
};

function service(objRequest, objResponse) {

var stParam = objRequest.getParameter('param');

if (ACTIONS[stParam]) {
  ACTIONS[stParam](objRequest, objResponse);
}

};

function _GetAll(objRequest, objResponse) {
E$.logAudit('UTILITY', '=====START=====');



var objDataResponse = {
  Array: {
    // Garbage: '10',
    Prefix: getList('customlist_bacb_prefix'),
    Suffix: getList('customlist_bacb_suffix'),
    Countries: _GetCountries(),
    AllStates: _GetAllStates(),
    Institutions: _GetInstitutions(),
    DegreeTypes: getList('customlist_degree_clasfctn_list'),
    ExperienceTypes: _GetExpTypes(),
    CertTypes: _GetCertTypes(),
    AppTypes: getList('customlist_application_type'),
    OtherCredType: getList('customlist_es_professional_credentials'),
    GenderTypes: getList('customlist_es_gender'),
    EthnicityTypes: getList('customlist_ethnicity'),
    ProfessionalEmphasisTypes: getList('customlist_prof_emphasis_types'),
    AgesOfClientele: getList('customlist_ages_of_clientele'),
    RolesInBA: getList('customlist_role_in_ba'),
    RepresentationType: getList('customlist_expnc_reprsentn_type_list'),
    Semesters: getList('customlist_global_semesters'),
    Quarters: getList('customlist_global_quarters'),

  }
}
E$.logAudit('UTILITY', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
}

function getList(listName) {
var objDataResponse = {
  "Array": []
}

var arrColumns = new Array();
arrColumns[0] = new nlobjSearchColumn('internalId');
arrColumns[1] = new nlobjSearchColumn('name');

var searchResults = nlapiSearchRecord(listName, null, null, arrColumns);

if (searchResults !== null) {
  if (!( searchResults instanceof Array ) ) {
    searchResults = [searchResults];
  }
  for (var stIndex in searchResults) {
    objDataResponse.Array.push({
      Id: searchResults[stIndex].getValue(arrColumns[0]),
      Value: searchResults[stIndex].getValue(arrColumns[1])
    });
  }
}
return objDataResponse;
}


function _GetCountries() {
  // E$.logAudit('GetCountries Utility', '=====START=====');

  var objDataResponse = {
      "Array" : []
  }

  objDataResponse.Array = _GetAllCountries();

  // E$.logAudit('GetCountries Utility', '======END======');
// objResponse.setContentType('PLAINTEXT');
// objResponse.write(JSON.stringify(objDataResponse));
return objDataResponse;
};

function _GetAllCountries() {
  var arrReturn = [];

  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('custrecord_country_disabled',null,'is','F');

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_country_name').setSort(false);
  arrColumns[1] = new nlobjSearchColumn('custrecord_country_code');
  arrColumns[2] = new nlobjSearchColumn('custrecord_country_enumeration');
  arrColumns[3] = new nlobjSearchColumn('custrecord_country_dialcode');
  arrColumns[4] = new nlobjSearchColumn('custrecord_country_discount');

  var searchResults = nlapiSearchRecord('customrecord_countries',null, arrFilters, arrColumns);
  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          arrReturn.push({    Id: searchResults[stIndex].getId(),
                              Name: searchResults[stIndex].getValue(arrColumns[0]),
                              Abbrev: searchResults[stIndex].getValue(arrColumns[1]),
                              Enumeration: searchResults[stIndex].getValue(arrColumns[2]),
                              DialCode: searchResults[stIndex].getValue(arrColumns[3])
                          });
      }
  }
  else if (searchResults !== null){
      arrReturn.push({    Id: searchResults.getId(),
                          Name: searchResults.getValue(arrColumns[0]),
                          Abbrev: searchResults.getValue(arrColumns[1]),
                          Enumeration: searchResults.getValue(arrColumns[2]),
                          DialCode: searchResults.getValue(arrColumns[3]),
                          Discount: searchResults.getValue(arrColumns[4])
                      });
  }
  return arrReturn;
}

function _GetAllStates() {
  // E$.logAudit('GetStates Utility', '=====START=====');

  var objSession = nlapiGetWebContainer().getShoppingSession();

  var objDataResponse = {
      "Array": []
  }
  var Countries = _GetAllCountries();
  var objCountries = {}
  for (var stCountryIndex = 0; stCountryIndex < Countries.length; stCountryIndex++) {
      objCountries[Countries[stCountryIndex].Abbrev] = Countries[stCountryIndex];
  }

  //E$.logAudit('GetStates Utility', 'Countries: ' + JSON.stringify(objCountries));

  var objStates = objSession.getStates();

  //TODO: Modify objDataResponse to match IStateSet interface
  // E$.logAudit('GetStates Utility', 'Data Out: ' + JSON.stringify(objStates));
   for (var stCountryIndex=0; stCountryIndex < objStates.length; stCountryIndex++) {
       objDataResponse.Array.push({'Country' : objCountries[objStates[stCountryIndex].countrycode], 'States' : []});
       for (var stStateIndex=0; stStateIndex < objStates[stCountryIndex].states.length; stStateIndex++) {
           objDataResponse.Array[stCountryIndex].States.push({'Id' : objStates[stCountryIndex].states[stStateIndex].code,
                                                              'Abbrev' : objStates[stCountryIndex].states[stStateIndex].code,
                                                              'Name' : objStates[stCountryIndex].states[stStateIndex].name});
       }
   }

  // E$.logAudit('GetStates Utility', 'Data Out: ' + JSON.stringify(objDataResponse));


  // E$.logAudit('GetStates Utility', '======END======');
// objResponse.setContentType('PLAINTEXT');
// objResponse.write(JSON.stringify(objDataResponse));
return objDataResponse;
};


function _GetCertTypes() {
  // E$.logAudit('GetCertType Utility', '=====START=====');

  var objDataResponse = {
      "Array": []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_cert_type_name');
  arrColumns[1] = new nlobjSearchColumn('custrecord_cert_type_abbrev');

  var searchResults = nlapiSearchRecord('customrecord_cert_type',null, null, arrColumns);

  if (searchResults !== null) {
    if (!( searchResults instanceof Array ) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].getId(),
        Name: searchResults[stIndex].getValue(arrColumns[0]),
        Abbrev: searchResults[stIndex].getValue(arrColumns[1])
      });
    }
  }

  // E$.logAudit('GetCertType Utility', '======END======');
// objResponse.setContentType('PLAINTEXT');
// objResponse.write(JSON.stringify(objDataResponse));
return objDataResponse;
};

function _GetInstitutions () {
  // E$.logAudit('GetInstitutions Utility', '=====START=====');

  try {
      var objSession = nlapiGetWebContainer().getShoppingSession();
      var stCustId = objSession.getCustomer().getFieldValues().internalid;

  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Utility - GetInstitutions', 'The call to get the current web session failed.:' + ex.message)
  }
  // nlapiLogExecution('AUDIT', 'Utility - GetInstitutions', 'READ function in Institutions executed.');

  var objDataResponse = {
       "Array": []
  }
  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('CustRecord_rc_inst_approved',null,'is','T');

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_rc_inst_name').setSort(false);
  arrColumns[1] = new nlobjSearchColumn('custrecord_rc_inst_website');

  var searchResults = nlapiSearchRecord('customrecord_rc_institution', null, null, arrColumns);

  if ( searchResults !== null ) {
    if ( !(searchResults instanceof Array) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        "Id": searchResults[stIndex].getId(),
        "Name": searchResults[stIndex].getValue(arrColumns[0]),
        "Website": searchResults[stIndex].getValue(arrColumns[1]),
        "Address":{
          "Index": '',
          "Address1": '',
          "Address2": '',
          "City": '',
          "State": {
            "Id": '',
            "Abbrev": '',
            "Name": ''
          },
          "Country": {
            "Id": '',
            "Name": '',
            "Abbrev": '',
            "Enumeration": '',
            "Discount": '',
            "DialCode": ''
          },
          "PostalCode": '',
           "isShipping": 'F',
           "isBilling": 'F'
          }
        }
      );
    }
  }

  // E$.logAudit('GetInstitutions Utility', '======END======');
// objResponse.setContentType('PLAINTEXT');
// objResponse.write(JSON.stringify(objDataResponse));
return objDataResponse;
};

function _GetInstructions(objRequest, objResponse) {
  // E$.logAudit('GetInstructions Utility', '=====START=====');

  var objDataResponse = {
      "Array": []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_instructions_cert_type');
  arrColumns[1] = new nlobjSearchColumn('custrecord_instructions_app_type');
  arrColumns[2] = new nlobjSearchColumn('custrecord_instructions_title');
  arrColumns[3] = new nlobjSearchColumn('custrecord_instructions_text');

  var searchResults = nlapiSearchRecord('customrecord_instructions',null, null, arrColumns);
  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Array.push({Id: searchResults[stIndex].getId(),
                                      CertTypeId: searchResults[stIndex].getValue(arrColumns[0]),
                                      AppTypeId: searchResults[stIndex].getValue(arrColumns[1]),
                                      Title: searchResults[stIndex].getValue(arrColumns[2]),
                                      Text: searchResults[stIndex].getValue(arrColumns[3])
                                      });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Array.push({Id: searchResults.getId(),
                                  CertTypeId: searchResults.getValue(arrColumns[0]),
                                  AppTypeId: searchResults.getValue(arrColumns[1]),
                                  Title: searchResults.getValue(arrColumns[2]),
                                  Text: searchResults.getValue(arrColumns[3])
                                  });
  }

  // E$.logAudit('GetInstructions Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
}



function _GetFirstCourseStartDate(objRequest, objResponse) {
  E$.logAudit('GetFirstCourseStartDate Utility', '=====START=====');

  var stBody = objRequest.getBody();
if (stBody) {
      objRxData = JSON.parse(stBody);
  }
  else {
      nlapiLogExecution('ERROR', 'GetFirstCourseStartDate Utility', 'Body of the request is not defined.');
  }

  var objDataResponse = {
      "Date": ''
  }

  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('internalid',null,'is',objRxData.AppId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_app_first_course_start_date');

  var searchResults = nlapiSearchRecord('customrecord_applications',null, arrFilters, arrColumns);
  if (searchResults instanceof Array && searchResults.length) {
      objDataResponse.Date = searchResults[0].getValue(arrColumns[0])
  }
  else if (searchResults !== null){
      objDataResponse.Data = searchResults.getValue(arrColumns[0])
  }

  E$.logAudit('GetFirstCourseStartDate Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
};

function _GetExpTypes() {
  // E$.logAudit('GetExpType Utility', '=====START=====');

  var objDataResponse = {
      "Array": []
  }

  try {
      var arrColumns = new Array();
      arrColumns[0] = new nlobjSearchColumn('custrecord_exptype_name');
      arrColumns[1] = new nlobjSearchColumn('custrecord_exptype_hours_multiplier');

      var searchResults = nlapiSearchRecord('customrecord_exp_type',null, null, arrColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'GetExpType Failed', 'Search result failed:' + ex.message)
  }

  if (searchResults !== null) {
    if (!( searchResults instanceof Array ) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].getId(),
        Name: searchResults[stIndex].getValue(arrColumns[0]),
        HourModifier: searchResults[stIndex].getValue(arrColumns[1])
      });
    }
  }
return objDataResponse;
};

function _GetDepartments(objRequest, objResponse) {
  E$.logAudit('GetDepartments Utility', '=====START=====');

  var stBody = objRequest.getBody();
if (stBody) {
      objRxData = JSON.parse(stBody);
  }
  else {
      nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
  }

  var objDataResponse = {
      "Array": []
  }

  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('custrecord_rc_depart_institution', null, 'is', objRxData.InstitutionId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_rc_depart_name');
  arrColumns[1] = new nlobjSearchColumn('custrecord_rc_depart_website');

  var searchResults = nlapiSearchRecord('customrecord_rc_department',null, arrFilters, arrColumns);
  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Array.push({
                                      // MM 12.6.18 I added this, and it may or may not be problematic
                                      'InstitutionId': objRxData.InstitutionId,
                                      'Id': searchResults[stIndex].getId(),
                                      'Name': searchResults[stIndex].getValue(arrColumns[0]),
                                      'Website': searchResults[stIndex].getValue(arrColumns[1]),
                                      });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Array.push({
                                  // MM 12.6.18 I added this, and it may or may not be problematic
                                  'InstitutionId': objRxData.InstitutionId,
                                  'Id' : searchResults.getId(),
                                  'Name' : searchResults.getValue(arrColumns[0]),
                                  'Website' : searchResults.getValue(arrColumns[1]),
                                  });
  }

  E$.logAudit('GetDepartments Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
};

function _GetContactDepartments(objRequest, objResponse) {
E$.logAudit('Utility.ss GetContactDepartments', '=====START=====');

try {
  var objSession = nlapiGetWebContainer().getShoppingSession();
  var stCustId = objSession.getCustomer().getFieldValues().internalid;
}
catch (ex) {
    nlapiLogExecution('ERROR', 'objSession_INVALID', 'The call to get the current web session failed.:' + ex.message)
}

var objDataResponse = {
    "Array": []
}

// Get the customer specific records, starting by determining customer information
var arrContactFilters = new Array();
arrContactFilters[0] = new nlobjSearchFilter('custrecord_rc_contact_customer', null, 'is', stCustId);

var ContactSearchResults = nlapiSearchRecord('customrecord_rc_contact', null, arrContactFilters, null);


// We should only ever have one result, but for continuity, we perform this action
if (!(ContactSearchResults instanceof Array)) {
  ContactSearchResults = [ContactSearchResults];
}

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
    if ( !(searchResults instanceof Array) ) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      // var arrayInstitutionFilters = new Array();
      // var arrayInstitutionColumns = new Array();
      // arrayInstitutionFilters[0] = new nlobjSearchFilter('internalid', null, 'is', searchResults[stIndex].getValue(arrColumns[3]));
      // arrayInstitutionColumns[0] = new nlobjSearchColumn('custrecord_rc_inst_name');
      // var searchInstitutionRecords = nlapiSearchRecord('customrecord_rc_institution', null, arrayInstitutionFilters, arrayInstitutionColumns)

      objDataResponse.Array.push({
        // I added this to my branch
        'Id': searchResults[stIndex].getValue(arrColumns[0]),
        'Name': searchResults[stIndex].getValue(arrColumns[1]),
        'Website': searchResults[stIndex].getValue(arrColumns[2]),
        'InstitutionId': searchResults[stIndex].getValue(arrColumns[3]),
        'RegisteredCourses': [],
      });
      var registeredCourseFilters = new Array();
      var registeredCourseColumns = new Array();
      registeredCourseFilters[0] = new nlobjSearchFilter('custrecord_rc_reg_course_department', null, 'is', searchResults[stIndex].getValue(arrColumns[0]));
      registeredCourseColumns[0] = new nlobjSearchColumn('custrecord_rc_reg_course_name');
      registeredCourseColumns[1] = new nlobjSearchColumn('custrecord_rc_reg_course_type');
      registeredCourseColumns[2] = new nlobjSearchColumn('custrecord_rc_reg_course_approval_level');
      registeredCourseColumns[3] = new nlobjSearchColumn('custrecord_rc_reg_course_academic_struct');
      var registeredCourseSearchResults = nlapiSearchRecord('customrecord_rc_registered_courses', null, registeredCourseFilters, registeredCourseColumns);
      if(registeredCourseSearchResults !== null){
        if(!(registeredCourseSearchResults instanceof Array)){
          registeredCourseSearchResults = [registeredCourseSearchResults];
        }
        for(rcIndex in registeredCourseSearchResults){
          nlapiLogExecution('AUDIT', 'Utitlty.ss GetContactDepartments', "inrcloop" + JSON.stringify(registeredCourseSearchResults[rcIndex]))
          objDataResponse.Array[objDataResponse.Array.length - 1].RegisteredCourses.push({
           'Id': registeredCourseSearchResults[rcIndex].getId(),
           'DepartmentId': searchResults[stIndex].getValue(arrColumns[0]),
           'Name': registeredCourseSearchResults[rcIndex].getValue(registeredCourseColumns[0]),
           'ApprovalLevel': registeredCourseSearchResults[rcIndex].getValue(registeredCourseColumns[2]),
           'AcademicStructure': registeredCourseSearchResults[rcIndex].getValue(registeredCourseColumns[3]),
           'Type' : registeredCourseSearchResults[rcIndex].getValue(registeredCourseColumns[1]),
          });
        }

      }

    }
  }

}
E$.logAudit('Utility.ss GetContactDepartments Utility', JSON.stringify(objDataResponse));

E$.logAudit('Utility.ss GetContactDepartments Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
};

function _GetRegisteredCourses(objRequest, objResponse) {
E$.logAudit('GetRegisteredCourses Utility', '=====START=====');

var stBody = objRequest.getBody();
if (stBody) {
  objRxData = JSON.parse(stBody);
}
else {
  nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
}

var objDataResponse = {
  "Array": []
}

var arrRCFilters = new Array();
arrRCFilters[0] = new nlobjSearchFilter('custrecord_rc_reg_course_department', null, 'is', objRxData.DepartmentId);

var arrRCColumns = new Array();
arrRCColumns[0] = new nlobjSearchColumn('custrecord_rc_reg_course_department');
arrRCColumns[1] = new nlobjSearchColumn('custrecord_rc_reg_course_name');
arrRCColumns[2] = new nlobjSearchColumn('custrecord_rc_reg_course_approval_level');
arrRCColumns[3] = new nlobjSearchColumn('custrecord_rc_reg_course_academic_struct');
arrRCColumns[4] = new nlobjSearchColumn('custrecord_rc_reg_course_type');

var RCSearchResults = nlapiSearchRecord('customrecord_rc_registered_courses',null, arrRCFilters, arrRCColumns);
if (RCSearchResults !== null) {
  if ( !(RCSearchResults instanceof Array && RCSearchResults.length) ) {
    RCSearchResults = [RCSearchResults];
  }
  for (var stIndex in RCSearchResults) {
    objDataResponse.Array.push( {
      'Id': RCSearchResults[stIndex].getId(),
      'DepartmentId': RCSearchResults[stIndex].getValue(arrRCColumns[0]),
      'Name': RCSearchResults[stIndex].getValue(arrRCColumns[1]),
      'ApprovalLevel': RCSearchResults[stIndex].getValue(arrRCColumns[2]),
      'AcademicStruct': RCSearchResults[stIndex].getValue(arrRCColumns[3]),
      'Type': RCSearchResults[stIndex].getValue(arrRCColumns[4]),
      'Courses' : []
    });
  }
}

for (var stRCIndex in objDataResponse.Array) {
  var arrCourseFilters = new Array();
  var arrHourFilters = new Array();
  var arrAreaHourFilters = new Array();
  arrCourseFilters[0] = new nlobjSearchFilter('custrecord_rc_course_reg_course', null, 'is', objDataResponse.Array[stRCIndex].Id);

  var arrCourseColumns = new Array();


  arrCourseColumns[0] = new nlobjSearchColumn('custrecord_rc_course_reg_course');
  arrCourseColumns[1] = new nlobjSearchColumn('custrecord_rc_course_title');
  arrCourseColumns[2] = new nlobjSearchColumn('custrecord_rc_course_number').setSort(false);
  arrCourseColumns[3] = new nlobjSearchColumn('custrecord_rc_course_credit_level');
  arrCourseColumns[4] = new nlobjSearchColumn('custrecord_rc_course_credit_hours');
  arrCourseColumns[5] = new nlobjSearchColumn('custrecord_rc_course_syllabi_name');
  arrCourseColumns[6] = new nlobjSearchColumn('custrecord_rc_course_instruction_mode');
  arrCourseColumns[7] = new nlobjSearchColumn('custrecord_rc_course_title_on_transcript');


  var CourseSearchResults = nlapiSearchRecord('customrecord_rc_course',null, arrCourseFilters, arrCourseColumns);
  var HourSearchResults = [];
  if ( CourseSearchResults !== null ) {
    if ( !(CourseSearchResults instanceof Array && CourseSearchResults.length) ) {
      CourseSearchResults = [CourseSearchResults];
    }
    for (var stCourseIndex in CourseSearchResults) {
      objDataResponse.Array[stRCIndex].Courses.push({
        'Id': CourseSearchResults[stCourseIndex].getId(),
        'RegisteredCourseId': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[0]),
        'Title': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[1]),
        'Number': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[2]),
        'CreditLevel': {
          'Id' : CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[3]),
          'Value' : CourseSearchResults[stCourseIndex].getText(arrCourseColumns[3])
        },
        'CreditHours': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[4]),
        'SyllabiName': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[5]),
        'InstructionMode': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[6]),
        'NameOnTranscript': CourseSearchResults[stCourseIndex].getValue(arrCourseColumns[7]),
        'CourseHours' : []
      });
      arrHourFilters[0] = new nlobjSearchFilter('custrecord_rc_content_hr_course', null, 'is', CourseSearchResults[stCourseIndex].getId());

      var arrHourColumns = new Array();
      arrHourColumns[0] = new nlobjSearchColumn('custrecord_rc_content_hr_course');
      arrHourColumns[1] = new nlobjSearchColumn('custrecord_rc_content_hr_edition');
      arrHourColumns[2] = new nlobjSearchColumn('custrecord_rc_content_hr_start_date');
      arrHourColumns[3] = new nlobjSearchColumn('custrecord_rc_content_hr_end_date');
      arrHourColumns[4] = new nlobjSearchColumn('custrecord_rc_content_hr_start_sem');
      arrHourColumns[5] = new nlobjSearchColumn('custrecord_rc_content_hr_end_sem');
      arrHourColumns[6] = new nlobjSearchColumn('custrecord_rc_content_hr_start_qtr');
      arrHourColumns[7] = new nlobjSearchColumn('custrecord_rc_content_hr_end_qtr');
      arrHourColumns[8] = new nlobjSearchColumn('custrecord_rc_content_hr_start_year');
      arrHourColumns[9] = new nlobjSearchColumn('custrecord_rc_content_hr_end_year');

      HourSearchResults = nlapiSearchRecord('customrecord_rc_content_hours',null, arrHourFilters, arrHourColumns);
      if (HourSearchResults !== null) {
        if ( !(HourSearchResults instanceof Array && HourSearchResults.length) ) {
          HourSearchResults = [HourSearchResults]
        }
        for (var stHourIndex in HourSearchResults) {
          objDataResponse.Array[stRCIndex].Courses[stCourseIndex].CourseHours.push({'Id': HourSearchResults[stHourIndex].getId(),
          'CourseId': HourSearchResults[stHourIndex].getValue(arrHourColumns[0]),
          'Edition': {
            'Id': HourSearchResults[stHourIndex].getValue(arrHourColumns[1]),
            'Value': HourSearchResults[stHourIndex].getText(arrHourColumns[1])
          },
          'Date' : {
            'Start' : HourSearchResults[stHourIndex].getValue(arrHourColumns[2]),
            'End' : HourSearchResults[stHourIndex].getValue(arrHourColumns[3]),
          },
          'Semester': {
            'Start': {
              'Id': HourSearchResults[stHourIndex].getValue(arrHourColumns[4]),
              'Value': HourSearchResults[stHourIndex].getText(arrHourColumns[4])
            },
            'End': {
              'Id': HourSearchResults[stHourIndex].getValue(arrHourColumns[5]),
              'Value': HourSearchResults[stHourIndex].getText(arrHourColumns[5])
            },
            'Range': []
          },
          'Quarter':  {
            'Start': {
              'Id': HourSearchResults[stHourIndex].getValue(arrHourColumns[6]),
              'Value': HourSearchResults[stHourIndex].getText(arrHourColumns[6])
            },
              'End': {
                'Id': HourSearchResults[stHourIndex].getValue(arrHourColumns[7]),
                'Value': HourSearchResults[stHourIndex].getText(arrHourColumns[7])
              },
              'Range': []
            },
            'Year': {
              'Start': HourSearchResults[stHourIndex].getValue(arrHourColumns[8]),
              'End': HourSearchResults[stHourIndex].getValue(arrHourColumns[9])
            },
            'Hours': []
          });

          arrAreaHourFilters[0] = new nlobjSearchFilter('custrecord_rc_hr_alloc_content_hours', null, 'is', HourSearchResults[stHourIndex].getId());

          var arrAreaHourColumns = new Array();
          arrAreaHourColumns[0] = new nlobjSearchColumn('custrecord_rc_hr_alloc_content_hours');
          arrAreaHourColumns[1] = new nlobjSearchColumn('custrecord_rc_hr_alloc_type');
          arrAreaHourColumns[2] = new nlobjSearchColumn('custrecord_content_area_hour_type_abbrev','custrecord_rc_hr_alloc_type');
          arrAreaHourColumns[3] = new nlobjSearchColumn('custrecord_content_area_hour_type_name','custrecord_rc_hr_alloc_type');
          arrAreaHourColumns[4] = new nlobjSearchColumn('custrecord_content_area_hour_type_value','custrecord_rc_hr_alloc_type');
          arrAreaHourColumns[5] = new nlobjSearchColumn('custrecord_rc_hr_alloc_value');

          var searchAreaHourResults = nlapiSearchRecord('customrecord_rc_hour_allocation',null, arrAreaHourFilters, arrAreaHourColumns);
          if (searchAreaHourResults !== null) {
            if ( !(searchAreaHourResults instanceof Array && searchAreaHourResults.length) ) {
              searchAreaHourResults = [searchAreaHourResults];
            }
            for (var stAreaHourIndex in searchAreaHourResults) {
              objDataResponse.Array[stRCIndex].Courses[stCourseIndex].CourseHours[stHourIndex].Hours.push({
                'Id': searchAreaHourResults[stAreaHourIndex].getId(),
                'CourseHourId': searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[0]),
                'Type' : {
                  'Id' : searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[1]),
                  'Abbrev' : searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[2]),
                  'Name' : searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[3]),
                  'Display' : searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[4])
                },
                'Value': searchAreaHourResults[stAreaHourIndex].getValue(arrAreaHourColumns[5])

              });
            }
          }
        }
      }
    }
  }
}
E$.logAudit('GetRegisteredCourses Utility', 'RC Courses: ' + JSON.stringify(objDataResponse));
E$.logAudit('GetRegisteredCourses Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
}

function _GetCoursesClean(objRequest, objResponse) {
E$.logAudit('GetCoursesClean Utility', '=====START=====');

var stBody = objRequest.getBody();
if (stBody) {
    objRxData = JSON.parse(stBody);
}
else {
    nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
}

var objDataResponse = {
    "Array": []
}

var arrFilters = new Array();
var arrHourFilters = new Array();
arrFilters[0] = new nlobjSearchFilter('custrecord_rc_reg_course_department','custrecord_rc_course_reg_course', null, 'is', objRxData.DepartmentId);

var arrColumns = new Array();
var arrHourColumns = new Array();
arrColumns[0] = new nlobjSearchColumn('custrecord_rc_course_reg_course');
arrColumns[1] = new nlobjSearchColumn('custrecord_rc_course_title');
arrColumns[2] = new nlobjSearchColumn('custrecord_rc_course_number');
arrColumns[3] = new nlobjSearchColumn('custrecord_rc_course_credit_level');
arrColumns[4] = new nlobjSearchColumn('custrecord_rc_course_credit_hours');
arrColumns[5] = new nlobjSearchColumn('custrecord_rc_course_syllabi_name');
arrColumns[6] = new nlobjSearchColumn('custrecord_rc_course_instruction_mode');

var searchResults = nlapiSearchRecord('customrecord_rc_course',null, arrFilters, arrColumns);
var hourSearchResults = [];

if (searchResults !== null) {
  if (!(searchResults instanceof Array && searchResults.length)) {
    searchResults = [searchResults];
  }
  for (var stIndex in searchResults) {
    objDataResponse.Array.push({
      'Id': searchResults[stIndex].getId(),
      'RegisteredCourseId': searchResults[stIndex].getValue(arrColumns[0]),
      'Title': searchResults[stIndex].getValue(arrColumns[1]),
      'Number': searchResults[stIndex].getValue(arrColumns[2]),
      'CreditLevel': searchResults[stIndex].getValue(arrColumns[3]),
      'CreditHours': searchResults[stIndex].getValue(arrColumns[4]),
      'SyllabiName': searchResults[stIndex].getValue(arrColumns[5]),
      'InstructionMode': searchResults[stIndex].getValue(arrColumns[6]),
      'Hours' : []
    });

    arrHourFilter[0] = new nlobjSearchFilter('custrecord_rc_content_hr_course', null, 'is', searchResults[stIndex].getId());

    arrHourColumns[0] = new nlobjSearchColumn('custrecord_rc_content_hr_course');
    arrHourColumns[1] = new nlobjSearchColumn('custrecord_rc_content_hr_edition');
    arrHourColumns[2] = new nlobjSearchColumn('custrecord_rc_content_hr_start_date');
    arrHourColumns[3] = new nlobjSearchColumn('custrecord_rc_content_hr_end_date');
    arrHourColumns[4] = new nlobjSearchColumn('custrecord_rc_content_hr_start_sem');
    arrHourColumns[5] = new nlobjSearchColumn('custrecord_rc_content_hr_end_sem');
    arrHourColumns[6] = new nlobjSearchColumn('custrecord_rc_content_hr_start_qtr');
    arrHourColumns[7] = new nlobjSearchColumn('custrecord_rc_content_hr_end_qtr');
    arrHourColumns[8] = new nlobjSearchColumn('custrecord_rc_content_hr_start_year');
    arrHourColumns[9] = new nlobjSearchColumn('custrecord_rc_content_hr_end_year');

    hourSearchResults = nlapiSearchRecord('customrecord_rc_content_hours',null, arrHourFilters, arrHourColumns);

    if (hourSearchResults !== null) {
      if (!(hourSearchResults instanceof Array && hourSearchResults.length) ) {
        hourSearchResults = [hourSearchResults];
      }
      for (var stHourIndex in hourSearchResults) {
        objDataResponse.Array[stIndex].Hours.push({
          Id: hourSearchResults[stHourIndex].getId(),
          CourseId: hourSearchResults[stHourIndex].getValue(arrHourColumns[0]),
          Edition: hourSearchResults[stHourIndex].getValue(arrHourColumns[1]),
          StartDate: hourSearchResults[stHourIndex].getValue(arrHourColumns[2]),
          EndDate: hourSearchResults[stHourIndex].getValue(arrHourColumns[3]),
          Semester: {
            Start: {
              Id: hourSearchResults[stHourIndex].getValue(arrHourColumns[4]),
              Value: hourSearchResults[stHourIndex].getText(arrHourColumns[4])
            },
            End: {
              Id: hourSearchResults[stHourIndex].getValue(arrHourColumns[5]),
              Value: hourSearchResults[stHourIndex].getText(arrHourColumns[5] )
            },
            Range: []
          },
          Quarter: {
            Start: {
              Id: hourSearchResults[stHourIndex].getValue(arrHourColumns[6]),
              Value: hourSearchResults[stHourIndex].getText(arrHourColumns[6])
            },
            End: {
              Id: hourSearchResults[stHourIndex].getValue(arrHourColumns[7]),
              Value: hourSearchResults[stHourIndex].getText(arrHourColumns[7])
            },
            Range: []
          },
          Year: {
            Start: hourSearchResults[stHourIndex].getValue(arrHourColumns[8]),
            End: hourSearchResults[stHourIndex].getValue(arrHourColumns[9])
          }
        });
      }
    }
  }
}
E$.logAudit('GetCoursesClean Utility', '======END======');
objResponse.setContentType('PLAINTEXT');
objResponse.write(JSON.stringify(objDataResponse));
}
