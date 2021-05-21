var ES_ACTIONS = {
  Read: _Read,
  Create: _Create,
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

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ ContinuingEducation', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  var objDataResponse = {
    'Array': []
  };

  nlapiLogExecution('AUDIT', 'READ ContinuingEducation', 'READ function in ContinuingEducation executed.');

  var arrFilters = new Array();
  arrFilters[0] = new nlobjSearchFilter('internalid', 'custrecord_ceact_certification_cycle', 'is', objRxData.Id);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalid', 'custrecord_ceact_certification_cycle');
  arrColumns[1] = new nlobjSearchColumn('name', 'custrecord_ceact_ace_provider');
  arrColumns[2] = new nlobjSearchColumn('custrecord_ceact_type');
  arrColumns[3] = new nlobjSearchColumn('custrecord_ceact_provider');
  arrColumns[4] = new nlobjSearchColumn('custrecord_es_ceact_start_date');
  arrColumns[5] = new nlobjSearchColumn('custrecord_es_ceact_end_date');
  arrColumns[6] = new nlobjSearchColumn('custrecord_es_ceact_course_number');
  arrColumns[7] = new nlobjSearchColumn('custrecord_ceact_course_credit_hr');
  arrColumns[8] = new nlobjSearchColumn('custrecord_ceact_course_grade');
  arrColumns[9] = new nlobjSearchColumn('custrecord_ceact_title');
  arrColumns[10] = new nlobjSearchColumn('custrecord_ceact_event_format');

  arrColumns[11] = new nlobjSearchColumn('custrecord_ceact_general_hours');
  arrColumns[12] = new nlobjSearchColumn('custrecord_ceact_ethics_hours');
  arrColumns[13] = new nlobjSearchColumn('custrecord_ceact_supervision_hours');

  // arrColumns[14] = new nlobjSearchColumn('custrecord_cert_cyc_status','custrecord_ceact_certification_cycle');
  // arrColumns[15] = new nlobjSearchColumn('custrecord_cert_cyc_cert_type','custrecord_ceact_certification_cycle');
  // arrColumns[16] = new nlobjSearchColumn('custrecord_name_formula','custrecord_ceact_certification_cycle');
  // arrColumns[17] = new nlobjSearchColumn('custrecord_cert_cyc_start_date','custrecord_ceact_certification_cycle');
  // arrColumns[18] = new nlobjSearchColumn('custrecord_cert_cyc_end_date','custrecord_ceact_certification_cycle');
  var searchResults = nlapiSearchRecord('customrecord_es_ce_activity', null, arrFilters, arrColumns);
  nlapiLogExecution('AUDIT', 'CE READ', JSON.stringify(searchResults));
  if ( searchResults !== null ) {
    if ( !(searchResults instanceof Array && searchResults.length) ) {
      searchResults = [searchResults]
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].id,
        CertCycle: {
          Id: searchResults[stIndex].getValue(arrColumns[0]),
          // Status: searchResults[stIndex].getValue(arrColumns[14]),
          // Type: searchResults[stIndex].getValue(arrColumns[15]),
          // Name: searchResults[stIndex].getValue(arrColumns[16]),
          // StartDate: searchResults[stIndex].getValue(arrColumns[17]),
          // EndDate: searchResults[stIndex].getValue(arrColumns[18]),
        },
        // If there is an ACE Provider, we want it to toss the name here for DOM output
        Provider: searchResults[stIndex].getValue(arrColumns[3]) == '' ? searchResults[stIndex].getValue(arrColumns[1]) : searchResults[stIndex].getValue(arrColumns[3]),
        ProviderId: searchResults[stIndex].getValue(arrColumns[1]),
        Type: {
          Id: searchResults[stIndex].getValue(arrColumns[2]),
          Value: searchResults[stIndex].getText(arrColumns[2]),
        },
        stInitialDate: searchResults[stIndex].getValue(arrColumns[4]),
        stCompletionDate: searchResults[stIndex].getValue(arrColumns[5]),
        CourseId: searchResults[stIndex].getValue(arrColumns[6]),
        Title: searchResults[stIndex].getValue(arrColumns[9]),
        CourseCreditHours: searchResults[stIndex].getValue(arrColumns[7]),
        CourseGrade: searchResults[stIndex].getValue(arrColumns[8]),
        EventFormat: searchResults[stIndex].getValue(arrColumns[10]),
        stGeneralUnits: searchResults[stIndex].getValue(arrColumns[11]),
        stEthicsUnits: searchResults[stIndex].getValue(arrColumns[12]),
        stSupervisionUnits: searchResults[stIndex].getValue(arrColumns[13]),
      });
    }
  }
  nlapiLogExecution('AUDIT', 'CE OUTPUT', JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT','READ ContinuingEducation', '======END======');
  return (JSON.stringify(objDataResponse));
}

function _Create(objRequest) {
  nlapiLogExecution('AUDIT', 'CREATE ContinuingEducation', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'CREATE ContinuingEducation', JSON.stringify(objRxData));
  var objDataResponse = {
    Response: 'F',
    Message: ''
  };

  nlapiLogExecution('AUDIT', 'CREATE ContinuingEducation', 'CREATE function in ContinuingEducation executed.');

  try {
      // Like Always, create the record, set field values, and then submit the record
    var recCE = nlapiCreateRecord('customrecord_es_ce_activity');

    recCE.setFieldValue('custrecord_ceact_certification_cycle', objRxData.CycleId);
    recCE.setFieldValue('custrecord_ceact_general_hours', request.stGeneralUnits);
    recCE.setFieldValue('custrecord_ceact_ethics_hours', request.stEthicsUnits);
    recCE.setFieldValue('custrecord_ceact_supervision_hours', request.stSupervisionUnits);
    recCE.setFieldValue('custrecord_ceact_provider', request.Provider);
    if ( request.ProviderId !== undefined ) {
      var aceFilters = new Array();
      aceFilters[0] = new nlobjSearchFilter('custrecord_bacb_ace_number', null, 'is', request.ProviderId);
      var aceResults = nlapiSearchRecord('customrecord_bacb_ace', null, aceFilters, null);
      nlapiLogExecution('DEBUG', 'ACE RESULTS', JSON.stringify(aceResults));
      recCE.setFieldValue('custrecord_ceact_ace_provider', aceResults[0].id);
    }
    recCE.setFieldValue('custrecord_ceact_type', request.Type.Id);
    if ( request.stInitialDate != undefined ) {
      recCE.setFieldValue('custrecord_es_ceact_start_date', request.stInitialDate);
    }
    recCE.setFieldValue('custrecord_es_ceact_end_date', request.stCompletionDate);
    if ( request.CourseId != undefined ) {
      recCE.setFieldValue('custrecord_es_ceact_course_number', request.CourseId);
    }
    recCE.setFieldValue('custrecord_ceact_title', request.Title);
    if ( request.CreditHours != undefined ) {
      recCE.setFieldValue('custrecord_ceact_course_credit_hr', request.CreditHours);
    }
    if ( request.Grade !== undefined ) {
      recCE.setFieldValue('custrecord_ceact_course_grade', request.Grade.Id);
    }
    if ( request.EventFormat !== undefined ) {
      recCE.setFieldValue('custrecord_ceact_event_format', request.EventFormat);
    }


    var responseId = nlapiSubmitRecord(recCE, true);
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Continuing Education Record Created: ' + responseId;
  }
  catch (ex) {
    nlapiLogExecution("ERROR", 'CREATE Continuing Education', 'The attempt to write a Continuing Education Failed: ' + ex.message);
  }


  nlapiLogExecution('AUDIT', 'CE OUTPUT', JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT', 'CREATE ContinuingEducation', '======END======');
  return (JSON.stringify(objDataResponse));
}
