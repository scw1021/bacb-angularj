var ACTIONS = {
    Check: _Check,
    Create: _Create,
    Delete: _Delete,
    DeleteAll: _Delete_All,
    Read: _Read,
    Submit: _Submit,
    Update: _Update
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}

};

/**
 * Submit all coursework and prevent future deletions
 * This confirms coursework as a permanent application element
 * @param objRequest { AppId: `string`, Coursework: `[{id : string}]`}
 * @param objResponse
 */
function _Submit(objRequest, objResponse) {
  E$.logAudit("SUBMIT Coursework", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution(
      "ERROR",
      "Submit Coursework",
      "The call to get the current web session failed.:" + ex.message
    );
  }
  nlapiLogExecution(
    "AUDIT",
    "Submit Coursework",
    "SUBMIT function in Coursework executed."
  );

  var stBody = objRequest.getBody();
  var AppId = '';
  if (stBody) {
    objRxData = JSON.parse(stBody);
    AppId = objRxData.AppId;
    index = objRxData.NumCourses;
    Coursework = objRxData.Coursework;
    nlapiLogExecution(
      "AUDIT",
      "Submit Coursework",
      JSON.stringify(Coursework)
    );
  } else {
    nlapiLogExecution(
      "ERROR",
      "Submit Coursework",
      "Body of the request is not defined."
    );
  }

  var objDataResponse = {
    Response: "F",
    Message: "Results: "
  };

  // Update all courses if the appId and coursework are valid
  if ( AppId && objRxData.Coursework && objRxData.Coursework.length > 0 ) {
    for ( var i=0; i < index; i++ ) {
      objDataResponse.Response = "T";
      try {
        var course = nlapiLoadRecord('customrecord_es_coursework', Coursework[i]);
        course.setFieldValue('custrecord_coursework_submitted', 'T');
        var response = nlapiSubmitRecord(course, true);
        objDataResponse.Message += "{" + Coursework[i] + ":" + response + "}";
      }
      catch (ex) {
        objDataResponse.Response = "Failed on CourseID: " + Coursework[i];
        nlapiLogExecution(
          "ERROR",
          "Submit Coursework",
          "Failed to update course with ID:" + Coursework[i]
        );
      }
    }
  }
  else {
    nlapiLogExecution(
      "ERROR",
      "Submit Coursework",
      "AppId missing, or CourseworkIds are missing from request. OBJ: " + JSON.stringify(objRxData)
    );
  }
  E$.logAudit("SUBMIT Coursework", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Check(objRequest, objResponse) {
  E$.logAudit('CHECK Coursework', '=====START=====');

  try {
      var objSession = nlapiGetWebContainer().getShoppingSession();
      var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'CHECK Coursework', 'The call to get the current web session failed.:' + ex.message)
  }

  var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
  }
  else {
      nlapiLogExecution('ERROR', 'CHECK Coursework', 'Body of the request is not defined.');
  }

  var objDataResponse = {
    'Response': 'F',
    'Message': 'Default Value'
  }

  try {
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_coursework_application',null,'is', objRxData.AppId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_app_certification_type','custrecord_coursework_application');
    arrColumns[1] = new nlobjSearchColumn('custrecord_coursework_content_hours');

    var searchResults = nlapiSearchRecord('customrecord_es_coursework',null, arrFilters, arrColumns);
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'CHECK Coursework', 'The search for content hours failed:' + ex.message)
  }

  var TotalHours = {
    'A1': 0,
    'B1': 0,
    'C1': 0,
    'C2': 0,
    'D1': 0,
    'D2': 0,
    'D3': 0,
    'D4': 0,
    'D5': 0,
    'E1': 0,
    'A': 0,
    'B': 0,
    'AB': 0,
    'CD': 0,
    'E': 0,
    'F': 0,
    'GH': 0,
    'I': 0
  };

  var CertificationType = 0;
  var FifthEditionTotal = 0;
  if (searchResults instanceof Array && searchResults.length) {
      CertificationType = searchResults[0].getValue(arrColumns[0]);

      var objCourseIdMap = {};
      for (var stIndex in searchResults) {
          var Result = _GetHourTotals(searchResults[stIndex].getValue(arrColumns[1]));
          if (!objCourseIdMap[Result.Id]) {
              for (var stCHourIndex in Result.CourseHours){
                  for (var stAllocHourIndex in Result.CourseHours[stCHourIndex].Hours) {
                      if (Result.CourseHours[stCHourIndex].Hours[stAllocHourIndex].Type.Abbrev) {
                          TotalHours[Result.CourseHours[stCHourIndex].Hours[stAllocHourIndex].Type.Abbrev] += (1 * Result.CourseHours[stCHourIndex].Hours[stAllocHourIndex].Value);
                          FifthEditionTotal += Result.CourseHours[stCHourIndex].Edition.Id === '5' ? 1 : 0;
                      }
                  }
              }
              objCourseIdMap[Result.ID] = 1;
          }

      var HybridTotals = {};
      if (CertificationType === '1') {
        if (FifthEditionTotal) {
          HybridTotals = _GetHybridTotals(CertificationType, TotalHours);
          if (HybridTotals.E >= 45 &&
              HybridTotals.AB >= 45 &&
              HybridTotals.CD >= 45 &&
              HybridTotals.F >= 30 &&
              HybridTotals.GHI >= 75 &&
              HybridTotals.Discretionary >= 30) {
                objDataResponse.Response = 'T';
                objDataResponse.Message = 'Coursework section is complete.'
              }
        }
        else {
          if (TotalHours.A1 >= 45 &&
              TotalHours.B1 >= 45 &&
              TotalHours.C1 >= 25 &&
              TotalHours.C2 >= 20 &&
              TotalHours.D1 >= 30 &&
              TotalHours.D2 >= 45 &&
              TotalHours.D3 >= 10 &&
              TotalHours.D4 >= 10 &&
              TotalHours.D5 >= 10 &&
              TotalHours.E1 >= 30) {
                objDataResponse.Response = 'T';
                objDataResponse.Message = 'Coursework section is complete.';
          }
          else {
              objDataResponse.Response = 'F';
              objDataResponse.Message = 'Coursework section total hours are not complete.';
          }

        }
      }
      else if (CertificationType === '2') {
        if (FifthEditionTotal) {
          HybridTotals = _GetHybridTotals(CertificationType, TotalHours);
          if (HybridTotals.E >= 15 &&
              HybridTotals.AB >= 45 &&
              HybridTotals.CD >= 15 &&
              HybridTotals.F >= 30 &&
              HybridTotals.GHI >= 60 &&
              HybridTotals.Discretionary >= 15) {
                objDataResponse.Response = 'T';
                objDataResponse.Message = 'Coursework section is complete.'
              }
        }
        else {
          if (TotalHours.A1 >= 15 &&
              TotalHours.B1 >= 45 &&
              TotalHours.C1 >= 10 &&
              TotalHours.C2 >= 05 &&
              TotalHours.D1 >= 30 &&
              TotalHours.D2 >= 45 &&
              TotalHours.D3 >= 05 &&
              TotalHours.D4 >= 05 &&
              TotalHours.D5 >= 05 &&
              TotalHours.E1 >= 15) {
                  // Math.abs(endDate.getTime() - startDate.getTime())*(1000 * 60 * 60 * 24 * 365) < 5
                  objDataResponse.Response = 'T';
                  objDataResponse.Message = 'Coursework section is complete';
          }
          else {
              objDataResponse.Response = 'F';
              objDataResponse.Message = 'Coursework section total hours are not complete.';
          }
        }
      }
    }
  }

  E$.logAudit('CHECK Coursework', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Create(objRequest, objResponse) {
    E$.logAudit('Coursework CREATE', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework CREATE', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Coursework CREATE', 'CREATE function in Coursework executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Coursework CREATE', 'Body of the request is not defined.');
    }

    var objDataResponse = {
      'Array': []
    }

    if (objRxData.Array[0].AppId) {
        for (var nIndex in objRxData.Array) {
            objDataResponse.Array.push({'Response': 'F', 'Message': 'Default Message.', 'ReturnId': ''});
            nlapiLogExecution('AUDIT', 'Coursework CREATE', 'Attempt to create coursework with course id: ' + objRxData.Array[nIndex].ContentHourId);
            try {
                var recNewCourse = nlapiCreateRecord('customrecord_es_coursework');
                recNewCourse.setFieldValue('custrecord_coursework_application',objRxData.Array[nIndex].AppId);
                recNewCourse.setFieldValue('custrecord_coursework_status', '4');
                recNewCourse.setFieldValue('custrecord_coursework_type', '1');
                if (objRxData.Array[nIndex].Semester != null) {
                    recNewCourse.setFieldValue('custrecord_coursework_semester', objRxData.Array[nIndex].Semester.Id);
                }
                if (objRxData.Array[nIndex].Quarter != null) {
                    recNewCourse.setFieldValue('custrecord_coursework_quarter', objRxData.Array[nIndex].Quarter.Id);
                }
                recNewCourse.setFieldValue('custrecord_coursework_year',objRxData.Array[nIndex].Year);
                recNewCourse.setFieldValue('custrecord_coursework_content_hours', objRxData.Array[nIndex].ContentHourId);

                objDataResponse.Array[objDataResponse.Array.length - 1].ReturnId = nlapiSubmitRecord(recNewCourse, true);
            }
            catch (ex) {
                objDataResponse.Array[objDataResponse.Array.length - 1].Message = 'Coursework record creation failed. ' + ex.message;
                nlapiLogExecution('ERROR', 'Coursework CREATE', 'The attempt to create multiple coursework record failed.:' + ex.message);
            };
            objDataResponse.Array[objDataResponse.Array.length - 1].Response = 'T';
            objDataResponse.Array[objDataResponse.Array.length - 1].Message = 'Coursework record created successfully.';
        }
    }
    else {
        objDataResponse.Array.push({'Response': 'F', 'Message': 'Default Message.'});
        objDataResponse.Array[0].Message = 'Coursework record creation failed. Application Id is invalid.';
    }

    E$.logAudit('Coursework CREATE', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
}

function _Delete(objRequest, objResponse) {
    E$.logAudit('Coursework DELETE', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework DELETE', 'The call to get the current web session failed.:' + ex.message)
    }

    nlapiLogExecution('AUDIT', 'Coursework DELETE', 'DELETE function in Coursework executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
    objRxData = JSON.parse(stBody);
  }
  else {
    nlapiLogExecution('ERROR', 'Coursework DELETE', 'Body of the request is not defined.');
  }

  var objDataResponse = {
    'Response': 'F',
    'Message': ''
  }

  if (objRxData.Id) {
    try {
      nlapiDeleteRecord('customrecord_es_coursework',objRxData.Id);
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Coursework record was deleted successfully.'
    }
    catch (ex) {
      nlapiLogExecution('ERROR', 'Coursework DELETE', 'The attempt to delete a coursework record failed.:' + ex.message)
    }
  }
  else {
    throw nlapiCreateError('Coursework DELETE', 'Coursework ID is invalid.');
  }

  E$.logAudit('Coursework DELETE', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Delete_All(objRequest, objResponse) {
    E$.logAudit('Coursework DELETE_ALL', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework DELETE_ALL', 'The call to get the current web session failed.:' + ex.message)
    }

    nlapiLogExecution('AUDIT', 'Coursework DELETE_ALL', 'DELETE_ALL function in Coursework executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Coursework DELETE_ALL', 'Body of the request is not defined.');
    }

    var objDataResponse = {
        'Response': 'F',
        'Message': ''
    }

    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('	custrecord_coursework_application',null,'is', objRxData.AppId);
    try {
        var searchResults = nlapiSearchRecord('customrecord_es_coursework',null, arrFilters, arrColumns);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework DELETE_ALL', 'The attempt to read the coursework records failed.: ' + ex.message);
    };

    if (searchResults instanceof Array && searchResults.length) {
        for (var stIndex in searchResults) {
            try {
            nlapiDeleteRecord('customrecord_es_coursework', searchResults[stIndex].getId());
            }
            catch (ex) {
                nlapiLogExecution('ERROR', 'Coursework DELETE_ALL', 'The attempt to delete a coursework record failed.:' + ex.message)
            }
        }
        objDataResponse.Response = 'T';
        objDataResponse.Message = 'All related coursework records were deleted successfully.';
    }
    else if (searchResults !== null){
        try {
            nlapiDeleteRecord('customrecord_es_coursework', searchResults.getId());
        }
        catch (ex) {
            nlapiLogExecution('ERROR', 'Coursework DELETE_ALL', 'The attempt to delete a coursework record failed.:' + ex.message)
        }
        objDataResponse.Response = true;
        objDataResponse.Message = 'All related coursework records were deleted successfully.';
    }

    E$.logAudit('Coursework DELETE_ALL', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Read(objRequest, objResponse) {
    E$.logAudit('Coursework READ', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework READ', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Coursework READ', 'READ function in Coursework executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Coursework READ', 'Body of the request is not defined.');
    }

    nlapiLogExecution('AUDIT', 'Coursework READ', 'App ID: ' + objRxData.AppId);

    var objDataResponse = {
        Array: []
    }

    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_coursework_application',null,'is', objRxData.AppId);
    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_coursework_content_hours');

    try {
        var searchResults = nlapiSearchRecord('customrecord_es_coursework',null, arrFilters, arrColumns);
        nlapiLogExecution('AUDIT', 'Coursework READ', JSON.stringify(searchResults));
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework READ', 'The attempt to read the coursework records failed.: ' + ex.message);
    };

    if (searchResults instanceof Array && searchResults.length) {
        for (var stIndex in searchResults) {
            objDataResponse.Array.push({'Id': searchResults[stIndex].getId(), 'ContentHour': _GetHourTotals(searchResults[stIndex].getValue(arrColumns[0]))});
        }
    }
    else if (searchResults !== null  && typeof searchResults !== 'undefined' ){
        objDataResponse.Array.push({'Id': searchResults[stIndex].getId(), 'ContentHour': _GetHourTotals(searchResults.getValue(arrColumns[0]))});
    }

    E$.logAudit('Coursework READ', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Update(objRequest, objResponse) {
    E$.logAudit('Coursework UPDATE', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Coursework UPDATE', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Coursework UPDATE', 'UPDATE function in Coursework executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Coursework UPDATE', 'Body of the request is not defined.');
    }

    var objDataResponse = {
		'Response': 'F',
        'Message': ''
    }
    // I for real wish any of this was commented for intent so I didn't have to consult `The Oracle` every time I try to figure out what a function does.
    if (objRxData.AppId) {
        try {
            var recOldCourse = nlapiLoadRecord('customrecord_es_coursework', objRxData.CourseworkId);
            recOldCourse.setFieldValue('custrecord_coursework_status', '4');
            recOldCourse.setFieldValue('custrecord_coursework_content_hours', objRxData.CourseHoursId);

            objDataResponse.CourseworkId = nlapiSubmitRecord(recOldCourse, true);
        }
        catch (ex) {
            nlapiLogExecution('ERROR', 'Coursework UPDATE', 'The attempt to modify the coursework record failed.:' + ex.message);
        };
    }
    else {
        throw nlapiCreateError('Coursework UPDATE', 'Coursework ID is invalid.');
    }

    E$.logAudit('UPDATE Coursework', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _GetHourTotals(ContentHoursId) {

    var ReturnCourse = {
      'Id': '',
      'InstitutionName': '',
      'DepartmentName': '',
      'Title': '',
      'Number': '',
      'CreditLevel': {
        'Id': '',
        'Value': ''
      },
      'CreditHours': '',
      'SyllabiName': '',
      'ModeOfInstruction': {
        'Id': '',
        'Value': ''
      },
      'CourseHours': {}
    };

    var ContentHourType = [{'Id': '', 'Abbrev': '', 'Name': '', 'Display': ''}];
    var TypeArrayPrimer = [{'Id': '', 'ContentHourId': '', 'Type' : {'Id': '', 'Abbrev': '', 'Name': '', 'Display': ''}, 'Value': '0'}];
    try {
      var arrTypeColumns = new Array();
      arrTypeColumns[0] = new nlobjSearchColumn('custrecord_content_area_hour_type_abbrev');
      arrTypeColumns[1] = new nlobjSearchColumn('custrecord_content_area_hour_type_name');
      arrTypeColumns[2] = new nlobjSearchColumn('custrecord_content_area_hour_type_value'); // This should be custrecord_content_area_hour_type_display

      var searchTypeResults = nlapiSearchRecord('customrecord_content_hour_alloc_type',null, null, arrTypeColumns);
    }
    catch (ex) {
      nlapiLogExecution('ERROR', 'CHECK Coursework', 'The search of content hour types failed:' + ex.message)
    }

    if (searchResults !== null) {

      if (!(searchTypeResults instanceof Array && searchTypeResults.length)) {
        searchTypeResults = [searchTypeResults];
      }

      for (var stTypeIndex in searchTypeResults) {
        ContentHourType.push({
          'Id': searchTypeResults[stTypeIndex].getId(),
          'Abbrev': searchTypeResults[stTypeIndex].getValue(arrTypeColumns[0]),
          'Name': searchTypeResults[stTypeIndex].getValue(arrTypeColumns[1]),
          'Display': searchTypeResults[stTypeIndex].getValue(arrTypeColumns[2])
        });
        TypeArrayPrimer.push({'Id': '', 'ContentHourId': '', 'Abbrev': '', 'Type' : {'Id': '', 'Abbrev': '', 'Name': '', 'Display': ''}, 'Value': '0'});
      }
    }

    var arrCourseFilters = [];
    arrCourseFilters[0] = new nlobjSearchFilter('internalid', null, 'is', ContentHoursId);

    var arrCourseColumns = [];
    arrCourseColumns[0] = new nlobjSearchColumn('custrecord_rc_course_institution','custrecord_rc_content_hr_course');
    arrCourseColumns[1] = new nlobjSearchColumn('custrecord_rc_course_department','custrecord_rc_content_hr_course');
    arrCourseColumns[2] = new nlobjSearchColumn('custrecord_rc_course_title','custrecord_rc_content_hr_course');
    arrCourseColumns[3] = new nlobjSearchColumn('custrecord_rc_course_number','custrecord_rc_content_hr_course');
    arrCourseColumns[4] = new nlobjSearchColumn('custrecord_rc_course_credit_level','custrecord_rc_content_hr_course');
    arrCourseColumns[5] = new nlobjSearchColumn('custrecord_rc_course_credit_hours','custrecord_rc_content_hr_course');
    arrCourseColumns[6] = new nlobjSearchColumn('custrecord_rc_course_syllabi_name','custrecord_rc_content_hr_course');
    arrCourseColumns[7] = new nlobjSearchColumn('custrecord_rc_course_instruction_mode','custrecord_rc_content_hr_course');
    arrCourseColumns[8] = new nlobjSearchColumn('custrecord_rc_content_hr_course');
    arrCourseColumns[9] = new nlobjSearchColumn('custrecord_rc_content_hr_edition');
    arrCourseColumns[10] = new nlobjSearchColumn('custrecord_rc_content_hr_start_date');
    arrCourseColumns[11] = new nlobjSearchColumn('custrecord_rc_content_hr_end_date');
    arrCourseColumns[12] = new nlobjSearchColumn('custrecord_rc_content_hr_start_sem');
    arrCourseColumns[13] = new nlobjSearchColumn('custrecord_rc_content_hr_end_sem');
    arrCourseColumns[14] = new nlobjSearchColumn('custrecord_rc_content_hr_start_qtr');
    arrCourseColumns[15] = new nlobjSearchColumn('custrecord_rc_content_hr_end_qtr');
    arrCourseColumns[16] = new nlobjSearchColumn('custrecord_rc_content_hr_start_year');
    arrCourseColumns[17] = new nlobjSearchColumn('custrecord_rc_content_hr_end_year');


    var CourseResults = nlapiSearchRecord('customrecord_rc_content_hours',null, arrCourseFilters , arrCourseColumns);
    if (CourseResults !== null  && typeof CourseResults !== 'undefined' ) {
      if ( !(CourseResults instanceof Array && CourseResults.length) ) {
        CourseResults = [CourseResults];
      }
      for (var stCourseIndex in CourseResults) {
        ReturnCourse.Id = CourseResults[stCourseIndex].getValue(arrCourseColumns[9]);
        ReturnCourse.InstitutionName = CourseResults[stCourseIndex].getValue(arrCourseColumns[0]);
        ReturnCourse.DepartmentName = CourseResults[stCourseIndex].getValue(arrCourseColumns[1]);
        ReturnCourse.Title = CourseResults[stCourseIndex].getValue(arrCourseColumns[2]);
        ReturnCourse.Number = CourseResults[stCourseIndex].getValue(arrCourseColumns[3]);
        ReturnCourse.CreditLevel.Id = CourseResults[stCourseIndex].getValue(arrCourseColumns[4]);
        ReturnCourse.CreditLevel.Value = CourseResults[stCourseIndex].getText(arrCourseColumns[4]);
        ReturnCourse.CreditHours = CourseResults[stCourseIndex].getValue(arrCourseColumns[5]);
        ReturnCourse.SyllabiName = CourseResults[stCourseIndex].getValue(arrCourseColumns[6]);
        ReturnCourse.ModeOfInstruction.Id = CourseResults[stCourseIndex].getValue(arrCourseColumns[7]);
        ReturnCourse.ModeOfInstruction.Value = CourseResults[stCourseIndex].getText(arrCourseColumns[7]);
        ReturnCourse.CourseHours[CourseResults[stCourseIndex].getId()] = {
          'Id': CourseResults[stCourseIndex].getId(),
          'CourseId': CourseResults[stCourseIndex].getValue(arrCourseColumns[8]),
          'Edition': {
            'Id': CourseResults[stCourseIndex].getValue(arrCourseColumns[9]),
            'Value': CourseResults[stCourseIndex].getText(arrCourseColumns[9])
          },
          'Date': {
            'Start': CourseResults[stCourseIndex].getValue(arrCourseColumns[10]),
            'End': CourseResults[stCourseIndex].getValue(arrCourseColumns[11]),
          },
          'Semester': {
            'Start': {
              'Id': CourseResults[stCourseIndex].getValue(arrCourseColumns[12]),
              'Value': CourseResults[stCourseIndex].getText(arrCourseColumns[12])
            },
            'End': {
              'Id': CourseResults[stCourseIndex].getValue(arrCourseColumns[13]),
              'Value': CourseResults[stCourseIndex].getText(arrCourseColumns[13])
            }
          },
          'Quarter': {
            'Start': {
              'Id': CourseResults[stCourseIndex].getValue(arrCourseColumns[14]),
              'Value': CourseResults[stCourseIndex].getText(arrCourseColumns[14])
            },
            'End': {
              'Id': CourseResults[stCourseIndex].getValue(arrCourseColumns[15]),
              'Value': CourseResults[stCourseIndex].getText(arrCourseColumns[15])
              }
          },
          'Year': {
            'Start': CourseResults[stCourseIndex].getValue(arrCourseColumns[116]),
            'End': CourseResults[stCourseIndex].getValue(arrCourseColumns[116])
          },
          'Hours': TypeArrayPrimer.slice(0)
        };
      }
    }
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_rc_hr_alloc_content_hours',null,'is', ContentHoursId);

    var arrColumns = [];
    arrColumns[0] = new nlobjSearchColumn('custrecord_rc_hr_alloc_content_hours');
    arrColumns[1] = new nlobjSearchColumn('custrecord_rc_hr_alloc_type');
    arrColumns[2] = new nlobjSearchColumn('custrecord_content_area_hour_type_abbrev', 'custrecord_rc_hr_alloc_type');
    arrColumns[3] = new nlobjSearchColumn('custrecord_content_area_hour_type_name', 'custrecord_rc_hr_alloc_type');
    arrColumns[4] = new nlobjSearchColumn('custrecord_content_area_hour_type_value', 'custrecord_rc_hr_alloc_type');
    arrColumns[5] = new nlobjSearchColumn('custrecord_rc_hr_alloc_value');


    var searchResults = nlapiSearchRecord('customrecord_rc_hour_allocation',null, arrFilters, arrColumns);

    if (searchResults !== null ) {
      if ( !(searchResults instanceof Array && searchResults.length) ) {
        searchResults = [searchResults];
      }
      for (var stIndex in searchResults) {
        ReturnCourse.CourseHours[ContentHoursId].Hours[searchResults[stIndex].getValue(arrColumns[1])] = {
          'Id': searchResults[stIndex].getId(),
          'ContentHoursId': searchResults[stIndex].getValue(arrColumns[0]),
          'Abbrev': searchResults[stIndex].getValue(arrColumns[2]),
          'Type': {
            'Id': searchResults[stIndex].getValue(arrColumns[1]),
            'Abbrev': searchResults[stIndex].getValue(arrColumns[2]),
            'Name': searchResults[stIndex].getValue(arrColumns[3]),
            'Display': searchResults[stIndex].getValue(arrColumns[4])
          },
          'Value': searchResults[stIndex].getValue(arrColumns[5]),
        };
      }
    }

    return ReturnCourse;
}

function _GetHybridTotals(CertTypeId, HourTotals) {
  return { 'E': HourTotals.A1 + HourTotals.E,
           'AB': HourTotals.B1 + HourTotals.AB + HourTotals.A + HourTotals.B,
           'CD': HourTotals.C1 + HourTotals.C2 + HourTotals.CD,
           'F': HourTotals.D1 + HourTotals.F,
           'GHI': HourTotals.D2 + HourTotals.D3 + HourTotals.D4 + HourTotals.D5 + HourTotals.GH + HourTotals.I,
           'Discretionary': _ExtraHours(CertTypeId, HourTotals) + HourTotals.E1}
}

function _ExtraHours(CertTypeId, HourTotals) {
  return _HoursOverFill(CertTypeId, HourTotals, 'A1') +
         _HoursOverFill(CertTypeId, HourTotals, 'B1') +
         _HoursOverFill(CertTypeId, HourTotals, 'C1') +
         _HoursOverFill(CertTypeId, HourTotals, 'C2') +
         _HoursOverFill(CertTypeId, HourTotals, 'D1') +
         _HoursOverFill(CertTypeId, HourTotals, 'D2') +
         _HoursOverFill(CertTypeId, HourTotals, 'D3') +
         _HoursOverFill(CertTypeId, HourTotals, 'D4') +
         _HoursOverFill(CertTypeId, HourTotals, 'D5');
}

function _HoursOverFill(CertTypeId, HourTotals, HourTypeIndex) {
  var RetValue = 0;
  if (CertTypeId === '1') {
    switch (HourTypeIndex) {
      case "A1": { // 8
        RetValue = HourTotals[HourTypeIndex] >= 45 ? HourTotals[HourTypeIndex] - 45: 0;
        break;
      }
      case "B1": { // 6
        RetValue = HourTotals[HourTypeIndex] >= 45 ? HourTotals[HourTypeIndex] - 45: 0;
        break;
      }
      case "C1": { // 14
        RetValue = HourTotals[HourTypeIndex] >= 25 ? HourTotals[HourTypeIndex] - 25: 0;
        break;
      }
      case "C2": { // 9
        RetValue = HourTotals[HourTypeIndex] >= 20 ? HourTotals[HourTypeIndex] - 20: 0;
        break;
      }
      case "D1": { // 11
        RetValue = HourTotals[HourTypeIndex] >= 30 ? HourTotals[HourTypeIndex] - 30: 0;
        break;
      }
      case "D2": { // 10
        RetValue = HourTotals[HourTypeIndex] >= 45 ? HourTotals[HourTypeIndex] - 45: 0;
        break;
      }
      case "D3": { // 13
        RetValue = HourTotals[HourTypeIndex] >= 10 ? HourTotals[HourTypeIndex] - 10: 0;
        break;
      }
      case "D4": { // 3
        RetValue = HourTotals[HourTypeIndex] >= 10 ? HourTotals[HourTypeIndex] - 10: 0;
        break;
      }
      case "D5": { // 12
        RetValue = HourTotals[HourTypeIndex] >= 10 ? HourTotals[HourTypeIndex] - 10: 0;
        break;
      }
      case "E1": { // 7 (can't have extra hours since this is the overfill column)
        RetValue = 0;
        break;
      }
    }
  }
  else if (CertTypeId === '2') {
    switch (HourTypeIndex) {
      case "A1": { // 8
        RetValue = HourTotals[HourTypeIndex] >= 15 ? HourTotals[HourTypeIndex] - 15: 0;
        break;
      }
      case "B1": { // 6
        RetValue = HourTotals[HourTypeIndex] >= 45 ? HourTotals[HourTypeIndex] - 45: 0;
        break;
      }
      case "C1": { // 14
        RetValue = HourTotals[HourTypeIndex] >= 10 ? HourTotals[HourTypeIndex] - 10: 0;
        break;
      }
      case "C2": { // 9
        RetValue = HourTotals[HourTypeIndex] >= 5 ? HourTotals[HourTypeIndex] - 5: 0;
        break;
      }
      case "D1": { // 11
        RetValue = HourTotals[HourTypeIndex] >= 30 ? HourTotals[HourTypeIndex] - 30: 0;
        break;
      }
      case "D2": { // 10
        RetValue = HourTotals[HourTypeIndex] >= 45 ? HourTotals[HourTypeIndex] - 45: 0;
        break;
      }
      case "D3": { // 13
        RetValue = HourTotals[HourTypeIndex] >= 5 ? HourTotals[HourTypeIndex] - 5: 0;
        break;
      }
      case "D4": { // 3
        RetValue = HourTotals[HourTypeIndex] >= 5 ? HourTotals[HourTypeIndex] - 5: 0;
        break;
      }
      case "D5": { // 12
        RetValue = HourTotals[HourTypeIndex] >= 5 ? HourTotals[HourTypeIndex] - 5: 0;
        break;
      }
      case "D1": { // 7 (can't have extra hours since this is the overfill column)
        RetValue =  0;
        break;
      }
    }
  }
  return RetValue;
}

