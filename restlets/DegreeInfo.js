var ACTIONS = {
  Check: _Check,
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
  Submit: _Submit,
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

/**
* Submit all degrees and prevent future deletions
* This confirms degrees as a permanent application element
* @param objRequest { AppId: `string`, Degrees: `[{id : string}]`}
* @param objResponse
*/
function _Submit(objRequest) {
nlapiLogExecution('AUDIT',"SUBMIT Coursework", "=====START=====");

// var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution(
  "AUDIT",
  "Submit Degrees",
  "SUBMIT function in Degrees executed."
);

var AppId = '';
if (objRxData) {
  AppId = objRxData.AppId;
  index = objRxData.NumDegrees;
  Degrees = objRxData.Degrees;
  nlapiLogExecution(
    "AUDIT",
    "Submit Degrees",
    JSON.stringify(Degrees)
  );
} else {
  nlapiLogExecution(
    "ERROR",
    "Submit Degrees",
    "Body of the request is not defined."
  );
}

var objDataResponse = {
  Response: "F",
  Message: "Results: "
};

// Update all degrees if the appId and Degrees are valid
if ( AppId && objRxData.Degrees && objRxData.Degrees.length > 0 ) {
  for ( var i=0; i < index; i++ ) {
    objDataResponse.Response = "T";
    try {
      var degree = nlapiLoadRecord('customrecord_degree', Degrees[i]);
      degree.setFieldValue('custrecord_degree_submitted', 'T');
      degree.setFieldValue('custrecord_deg_application', AppId);
      var response = nlapiSubmitRecord(degree, true);
      objDataResponse.Message += "{" + Degrees[i] + ":" + response + "}";
    }
    catch (ex) {
      objDataResponse.Response = "Failed on DegreeID: " + Degrees[i];
      nlapiLogExecution(
        "ERROR",
        "Submit Degrees",
        "Failed to update degree with ID:" + Degrees[i]
      );
    }
  }
}
else {
  nlapiLogExecution(
    "ERROR",
    "Submit Degrees",
    "AppId missing, or DegreesIds are missing from request. OBJ: " + JSON.stringify(objRxData)
  );
}
nlapiLogExecution('AUDIT',"SUBMIT Degrees", "======END======");
return (JSON.stringify(objDataResponse));
}


function _Check(objRequest) {
nlapiLogExecution('AUDIT','CHECK DegreeInfo', '=====START=====');

var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'Check DegreeInfo', 'CHECK function in DegreeInfo executed.');

var objDataResponse = {
  'Response' : 'F',
  'Message' : 'Default Value'
}

var arrFilters = [];
arrFilters[0] = new nlobjSearchFilter('custrecord_degree_customer',null,'is', stCustId);

var arrColumns = new Array();
arrColumns[0] = new nlobjSearchColumn('custrecord_degree_classification');

var searchResults = nlapiSearchRecord('customrecord_degree',null, arrFilters, arrColumns);
// Degree classification List (Custom NetSuite List - customlist_degree_clasfctn_lst)
// 1 = Bachelor's Degree
// 3 = Master's Degree
// 4 = Doctorate
// 8 = Specialist's Degree
// 9 = High School Deploma
if ( searchResults !== null ) {
  if ( !(searchResults instanceof Array && searchResults.length) ) {
    searchResults = [searchResults];
  }
  // Because any degree can satisfy this requirement, we start false and find a reason to return true.
  var _response = false;
  for (var stIndex in searchResults) {
    switch ( searchResults[stIndex].getValue(arrColumns[0]) ) {
      case '4':
        // Doctorate fullfills all requirements
        _response = true;
        break;
      case '3':
        // Master's works for all but BCBA-D
        if ( objRxData.IsDoctoral !== '1' ) { // FIXME - TODO - We currently don't hadle this at all
          _response = true;
        }
        break;
      case '1':
        // Bachelors works for non-BCBAs
        if ( objRxData.CertTypeId !== '1' ) {
          _response = true;
        }
        break;
      case '9':
        // HS diploma only works for RBT
        if ( objRxData.CertTypeId == '3' ) {
          _response = true;
        }
        break;
    }
  }
  if ( _response ) {
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Education Requirements Met';
  }
  else {
    objDataResponse.Message = 'Education requirements not met';
  }
}
// if (searchResults instanceof Array && searchResults.length) {

//     nlapiLogExecution('AUDIT', 'Check DegreeInfo', 'objRxData.CertTypeId: ' + objRxData.CertTypeId);
//     for (var stIndex in searchResults) {

//         nlapiLogExecution('AUDIT', 'Check DegreeInfo', 'Cert Type: ' + objRxData.CertTypeId);
//         nlapiLogExecution('AUDIT', 'Check DegreeInfo', 'Degree Type: ' + searchResults[stIndex].getValue(arrColumns[0]));
//         // This was such a gross method, but I wanted to leave the corpse here.
//         if (objRxData.CertTypeId === '1') {
//             if ( searchResults[stIndex].getValue(arrColumns[0]) === '3' ||  searchResults[stIndex].getValue(arrColumns[0]) === '4' ||  searchResults[stIndex].getValue(arrColumns[0]) === '8') {
//                 objDataResponse.Response = 'T';
//                 objDataResponse.Message = 'Required degree record has been submitted.';
//             }
//         }
//         else if (objRxData.CertTypeId === '2') {
//             if ( searchResults[stIndex].getValue(arrColumns[0]) === '1' || searchResults[stIndex].getValue(arrColumns[0]) === '3' ||  searchResults[stIndex].getValue(arrColumns[0]) === '4' ||  searchResults[stIndex].getValue(arrColumns[0]) === '8') {
//                 objDataResponse.Response = 'T';
//                 objDataResponse.Message = 'Required degree record has been submitted.';
//             }
//         }
//         else if (objRxData.CertTypeId === '3') {
//             if (searchResults[stIndex].getValue(arrColumns[0]) === '9' || searchResults[stIndex].getValue(arrColumns[1]) === '1' || searchResults[stIndex].getValue(arrColumns[1]) === '3' ||  searchResults[stIndex].getValue(arrColumns[1]) === '4' ||  searchResults[stIndex].getValue(arrColumns[1]) === '8') {
//                 objDataResponse.Response = 'T';
//                 objDataResponse.Message = 'Required degree record has been submitted.';
//             }
//         }
//     }
// }

// This is LITERALLY wrong and references the wrong column... This is why we DO NOT REPEAT CODE LOGIC
// else if (searchResults !== null){

//     // Degree classification List (Custom NetSuite List - customlist_degree_clasfctn_lst)
//     // 1 = Bachelor's Degree
//     // 3 = Master's Degree
//     // 4 = Doctorate
//     // 8 = Specialist's Degree
//     // 9 = High School Deploma
//     if (objRxData.CertTypeId === '1') {
//         if ( searchResults.getValue(arrColumns[1]) === '3' ||  searchResults.getValue(arrColumns[1]) === '4' ||  searchResults.getValue(arrColumns[1]) === '8') {
//             objDataResponse.Response = 'T';
//             objDataResponse.Message = 'Required degree record has been submitted.';
//         }
//     }
//     else if (objRxData.CertTypeId === '2') {
//         if ( searchResults.getValue(arrColumns[1]) === '1' || searchResults.getValue(arrColumns[1]) === '3' ||  searchResults.getValue(arrColumns[1]) === '4' ||  searchResults.getValue(arrColumns[1]) === '8') {
//             objDataResponse.Response = 'T';
//             objDataResponse.Message = 'Required degree record has been submitted.';
//         }
//     }
//     else if (objRxData.CertTypeId === '3') {
//         if (searchResults.getValue(arrColumns[1]) === '9' || searchResults.getValue(arrColumns[1]) === '1' || searchResults.getValue(arrColumns[1]) === '3' ||  searchResults.getValue(arrColumns[1]) === '4' ||  searchResults.getValue(arrColumns[1]) === '8') {
//             objDataResponse.Response = 'T';
//             objDataResponse.Message = 'Required degree record has been submitted.';
//         }
//     }
// }

nlapiLogExecution('AUDIT','CHECK DegreeInfo', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Create(objRequest) {
  nlapiLogExecution('AUDIT','CREATE DegreeInfo', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest['degree'];
  nlapiLogExecution('AUDIT', 'Create DegreeInfo', 'CREATE function in DegreeInfo executed.');

  var objDataResponse = {
    'Response' : 'F',
    'Message' : ''
  }

  if (objRxData.Institution.Id) {

      var recNewDegree = nlapiCreateRecord('customrecord_degree');
      recNewDegree.setFieldValue('custrecord_degree_customer', stCustId);
      recNewDegree.setFieldValue('custrecord_degree_classification', objRxData.Type.Id);
      recNewDegree.setFieldValue('custrecord_deg_major', objRxData.Major);
      recNewDegree.setFieldValue('custrecord_deg_date_conferred', nlapiDateToString(new Date(objRxData.DateConferred),'date'));
      recNewDegree.setFieldValue('custrecord_degree_institution', objRxData.Institution.Id);

      try {
          objDataResponse.DegreeId = nlapiSubmitRecord(recNewDegree, true);
          objDataResponse.Response = 'T';
      }
      catch (ex) {
          throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord failed.' + ex.message);
      }
  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Institution ID is invalid.');
  }

  nlapiLogExecution('AUDIT','CREATE DegreeInfo', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','DELETE DegreeInfo', '=====START=====');
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Delete DegreeInfo', 'Id: ' + JSON.stringify(objRxData));

  var objDataResponse = {
      'Response' : 'F',
      'Message' : 'Default Message'
  }

  if (objRxData) {
      var degree = nlapiLoadRecord('customrecord_degree', objRxData.Id);

      if ( !degree.getFieldValue('custrecord_degree_submitted') || degree.getFieldValue('custrecord_degree_submitted') === 'F') {
        nlapiDeleteRecord('customrecord_degree',objRxData.Id);
        objDataResponse.Response = 'T';
        objDataResponse.Message = 'Degree Record deleted successfully.'
      }
      else {
        objDataResponse.Response = 'F';
        objDataResponse.Message = 'Degree is submitted'
      }

  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Degree ID is invalid.');
  }

  nlapiLogExecution('AUDIT','DELETE DegreeInfo', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Read(objRequest) {
nlapiLogExecution('AUDIT','READ DegreeInfo', '=====START=====');

var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution('AUDIT', 'Read DegreeInfo', 'READ function in DegreeInfo executed.');

var objDataResponse = {
    Array: []
}
try {
  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('custrecord_degree_customer',null,'is', stCustId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_degree_classification');
  arrColumns[1] = new nlobjSearchColumn('custrecord_deg_major');
  arrColumns[2] = new nlobjSearchColumn('custrecord_deg_date_conferred');
  arrColumns[3] = new nlobjSearchColumn('custrecord_degree_institution');
  arrColumns[4] = new nlobjSearchColumn('custrecord_rc_inst_name', 'custrecord_degree_institution');

  var searchResults = nlapiSearchRecord('customrecord_degree',null, arrFilters, arrColumns);
}
catch (ex) {
  nlapiLogExecution('ERROR', 'Read DegreeInfo', 'READ function search failed: ' + ex.message);
}

if (!searchResults instanceof Array){
  searchResults = [searchResults];
}
if (searchResults.length) {
    for (var stIndex in searchResults) {
        objDataResponse.Array.push({'Type': { 'Id': searchResults[stIndex].getValue(arrColumns[0]),
                                            'Value': searchResults[stIndex].getText(arrColumns[0])},
                                    'Major':  searchResults[stIndex].getValue(arrColumns[1]),
                                    'DateConferred': searchResults[stIndex].getValue(arrColumns[2]),
                                    'Institution': {  "Id":   searchResults[stIndex].getValue(arrColumns[3]),
                                                    "Name": searchResults[stIndex].getValue(arrColumns[4]),
                                                    "Address": {}
                                    },
                                    'Id': searchResults[stIndex].getId()
        });
    }
}

nlapiLogExecution('AUDIT','READ DegreeInfo', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {
nlapiLogExecution('AUDIT',"UPDATE DegreeInfo", "=====START=====");

// var stCustId = objRequest['CustomerId'];
var objRxData = objRequest;
nlapiLogExecution("AUDIT", "Update DegreeInfo", "UPDATE function in DegreeInfo executed.");


var objDataResponse = {
  Response: "F",
  Message: "",
  ReturnId: ""
};

if (objRxData.Id) {
  try {
    var recOldDegree = nlapiLoadRecord("customrecord_degree", objRxData.Id);
    recOldDegree.setFieldValue("custrecord_degree_classification", objRxData.Type.Id);
    recOldDegree.setFieldValue("custrecord_deg_major", objRxData.Major);
    recOldDegree.setFieldValue("custrecord_deg_date_conferred", nlapiDateToString(new Date(objRxData.DateConferred), "date"));
    recOldDegree.setFieldValue("custrecord_degree_institution", objRxData.Institution.Id);
    objDataResponse.ReturnId = nlapiSubmitRecord(recOldDegree, true);
    objDataResponse.Response = "T";
  } catch (ex) {
    nlapiLogExecution("ERROR", "Update DegreeInfo", "The attempt to modify the degree record failed.:" + ex.message);
    objDataResponse.Message = ex.Message;
  }
} else {
  throw nlapiCreateError("Update DegreeInfo", "Application ID is invalid.");
}

nlapiLogExecution('AUDIT',"UPDATE DegreeInfo", "======END======");
return (JSON.stringify(objDataResponse));
};
