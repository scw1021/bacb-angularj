var ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Submit: _Submit,
  Update: _Update,
  PayApplication: _Pay,
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
  nlapiLogExecution('AUDIT','CREATE Applications', '=====START=====');
  nlapiLogExecution('DEBUG', 'CUSTOMERID', 'Customer ID: YEET');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var objDataResponse = {
    'Response' : 'F',
    'Message' : '',
    'ReturnId' : ''
  }

  try {
    // Create application record linked to current customer
    recApp = nlapiCreateRecord('customrecord_applications', {recordmode: 'dynamic'});
    recApp.setFieldValue('custrecord_app_applicant', stCustId);
    recApp.setFieldValue('custrecord_app_certification_type', objRxData.CertTypeId);
    recApp.setFieldValue('custrecord_exam_app_type', objRxData.AppTypeId);
    objDataResponse.ReturnId = nlapiSubmitRecord(recApp, true, true);
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Application record created successfully.'
  }
  catch (ex) {
      objDataResponse.Message = 'Error occured: ' + ex.message;
  }

  nlapiLogExecution('AUDIT','CREATE Applications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','DELETE Applications', '=====START=====');

  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;

  var objDataResponse = {
      'Response' : 'F',
      'Message' : ''
  }

  if (objRxData.AppId) {
      try {
          nlapiDeleteRecord('customrecord_applications',objRxData.AppId);
      }
      catch (ex) {
          nlapiLogExecution('ERROR', 'DELETE FAILED', 'The attempt to delete an application record failed.:' + ex.message)
          objDataResponse.Response = 'F';
          objDataResponse.Message = 'The attempt to delete an applicaiton record failed. : ' + ex.message;
      }
      if (objDataResponse.Message == '') {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Application deleted successfully.';
      }
  }
  else {
      objDataResponse.Message = 'Application ID is invalid.';
      throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','DELETE Applications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Read(objRequest) {
nlapiLogExecution('AUDIT','READ Applications', '=====START=====');

var stCustId = objRequest['CustomerId'];
// var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'READ Applications', 'READ function in Applications executed.');

var objDataResponse = {
'Array': []
}

try {
var arrFilters = [];
arrFilters[0] = new nlobjSearchFilter('custrecord_app_applicant',null,'is', stCustId);
arrFilters[1] = new nlobjSearchFilter('custrecord_exam_app_type',null,'anyof',['1','2','3','4','5','6','7']);

var arrColumns = new Array();
arrColumns[0] = new nlobjSearchColumn('custrecord_entity_status_ext_name','custrecord_exam_app_status');
arrColumns[1] = new nlobjSearchColumn('custrecord_exam_app_type');
arrColumns[2] = new nlobjSearchColumn('custrecord_app_certification_type');
arrColumns[3] = new nlobjSearchColumn('custrecord_cert_type_abbrev','custrecord_app_certification_type');
arrColumns[4] = new nlobjSearchColumn('custrecord_cert_type_name','custrecord_app_certification_type');
arrColumns[5] = new nlobjSearchColumn('custrecord_app_date_submitted');
arrColumns[6] = new nlobjSearchColumn('created');
arrColumns[7] = new nlobjSearchColumn('custrecord_app_first_course_start_date');
arrColumns[8] = new nlobjSearchColumn('custrecord_app_last_course_end_date');
arrColumns[9] = new nlobjSearchColumn('custrecord_app_invoices');


var searchResults = nlapiSearchRecord('customrecord_applications',null, arrFilters, arrColumns);
}
catch (ex) {
  nlapiLogExecution('ERROR', 'READ Applications', 'The attempt to read applications for current customer failed.:' + ex.message)
}

var MyAppList;
if (searchResults instanceof Array && searchResults.length) {
  nlapiLogExecution('AUDIT', 'READ Applications', 'READ results array: ' + JSON.stringify(searchResults));
  if ( searchResults !== null ) {
    if (!( searchResults instanceof Array && searchResults.length )) {
      searchResults = [searchResults]
    }
    for (var stIndex in searchResults) {
      MyAppList = _getList('customlist_application_type').Array[searchResults[stIndex].getValue(arrColumns[1])];
      objDataResponse.Array.push({
        'Id':  searchResults[stIndex].getId(),
        'Status': searchResults[stIndex].getValue(arrColumns[0]),
        'AppType':  {
          'Id' : MyAppList.Id,
          'Name' : MyAppList.Value
        },
        'CertType': {
          'Id' : searchResults[stIndex].getValue(arrColumns[2]),
          'Abbrev' : searchResults[stIndex].getValue(arrColumns[3]),
          'Name' : searchResults[stIndex].getText(arrColumns[4])
        },
        'DateSubmitted': searchResults[stIndex].getValue(arrColumns[5]),
        'DateCreated': searchResults[stIndex].getValue(arrColumns[6]),
        'FirstCourseStartDate': searchResults[stIndex].getValue(arrColumns[7]),
        'LastCourseEndDate': searchResults[stIndex].getValue(arrColumns[8]),
        'Invoice': searchResults[stIndex].getValue(arrColumns[9]),
      });
    }
  }
}
  nlapiLogExecution('AUDIT','READ Applications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Submit(objRequest) {
  nlapiLogExecution('AUDIT',"SUBMIT Applications", "=====START=====");
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  var DateSubmitted = objRxData.DateSubmitted;


  nlapiLogExecution(
    "AUDIT",
    "Submit Application",
    JSON.stringify(objRxData)
  )
  var objDataResponse = {
    Response: "F",
    Message: ""
  };
  // Update the application if the appId is valid

  try {
    var application = nlapiLoadRecord('customrecord_applications', objRxData.AppId);
    nlapiLogExecution(
      "AUDIT",
      "Submit Application",
      JSON.stringify(application)
    )
    application.setFieldValue('custrecord_app_date_submitted', DateSubmitted);
    // Set to 'Submitted - Awaiting Payment'
    application.setFieldValue('custrecord_exam_app_status', 5);
    application.setFieldValue('custrecord_app_invoices', objRxData.InvoiceId);
    var response = nlapiSubmitRecord(application, true);
    objDataResponse.Response = "T";
    objDataResponse.Message = "Application " + response + " Submitted: " + DateSubmitted;
  }
  catch (ex) {
    objDataResponse.Response = "Failed on AppID: " + objRxData.AppId;
    nlapiLogExecution(
      "ERROR",
      "Submit Application",
      "Failed to update application with ID:" + objRxData.AppId + JSON.stringify(ex)
    );
  }
  nlapiLogExecution('AUDIT','SUBMIT Applications', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _Update(objRequest) {
  nlapiLogExecution('AUDIT','UPDATE Applications', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'UPDATE_CALLED', 'UPDATE function in Applications executed.');

  var objDataResponse = {
    'Response' : 'F',
    'Message' : '',
    'ReturnId' : ''
  }

  if (objRxData.Id) {
    try {
      var recApplication = nlapiLoadRecord('customrecord_applications', objRxData.Id);
      recApplication.setFieldValue('custrecord_app_first_course_start_date', objRxData.FirstCourseStartDate);
      recApplication.setFieldValue('custrecord_app_last_course_end_date', objRxData.LastCourseEndDate);
      if ( objRxData.InvoiceId ) {
        recApplication.setFieldValue('custrecord_app_invoices', objRxData.InvoiceId);
      }

      objDataResponse.ReturnId = nlapiSubmitRecord(recApplication, true);
    }
    catch (ex) {
      nlapiLogExecution('ERROR', 'UPDATE_FAILED', 'The attempt to modify the application record failed.:' + ex.message);
      objDataResponse.Message = "The attempt to modify the application record failed: " + ex.message;
    }
    if (objDataResponse.ReturnId) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Application updated Successfully.'
    }
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','UPDATE Applications', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _getCustomerData(webCustomer) {

  var objUser = (function (standard, custom) {
    var retVal = {};
    // get standard customer fields
    for (var standardKey in standard) {
      retVal[standardKey] = standard[standardKey];
    }
    // get custom customer fields
    for (var indexCustom=0; indexCustom < custom.length; indexCustom++) {
      retVal[custom[indexCustom].name] = custom[indexCustom].value;
    }
    // get certification fields
    //getCertificartionData(retVal);

    return retVal;
  } (webCustomer.getFieldValues(), webCustomer.getCustomFieldValues()));

  return objUser;
}

function _getList(ListName) {
  var RetVal = {
      Array: []
  }
  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalId');
  arrColumns[1] = new nlobjSearchColumn('name');

  var searchResults = nlapiSearchRecord(ListName,null, null, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          RetVal.Array[searchResults[stIndex].getValue(arrColumns[0])] = {Id: searchResults[stIndex].getValue(arrColumns[0]),
                                                                          Value: searchResults[stIndex].getValue(arrColumns[1])};
      }
  }
  else if (searchResults !== null){
      RetVal.Array[searchResults.getValue(arrColumns[0])] = {Id: searchResults.getValue(arrColumns[0]),
                                                             Value: searchResults.getValue(arrColumns[1])};
  }
  return RetVal;
}
function _Pay(objRequest) {
  nlapiLogExecution('AUDIT','PAY Applications', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'PAY_APP_CALLED', 'PAY function in Applications executed.');


  var objDataResponse = {
    'Response' : 'F',
    'Message' : '',
  }

  if (objRxData.Id) {
    try {
      var recApplication = nlapiLoadRecord('customrecord_applications', objRxData.AppId);
      recApplication.setFieldValue('custrecord_app_paid', 'T');
      recApplication.setFieldValue('custrecord_app_payment_status', '2');
      objDataResponse.ReturnId = nlapiSubmitRecord(recApplication, true);
    }
    catch (ex) {
      nlapiLogExecution('ERROR', 'UPDATE_FAILED', 'The attempt to modify the application record failed.:' + ex.message);
      objDataResponse.Message = "The attempt to modify the application record failed: " + ex.message;
    }
    if (objDataResponse.ReturnId) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Application paid Successfully.'
    }
  }
  else {
    throw nlapiCreateError('INVALID_DATA', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','PAY Applications', '======END======');
  return (JSON.stringify(objDataResponse));
}
