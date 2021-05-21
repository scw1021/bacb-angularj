var ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  Read: _Read,
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

// Expecting an Icourse object and I registeredCourseId
function _Create(objRequest) {
  nlapiLogExecution('AUDIT','CREATE Courses', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse = {
    Response: 'F',
    Message: 'Default Value',
    ReturnId: ''
  };


  var newICourseRecord = nlapiCreateRecord('customrecord_rc_course');
  // newICourseRecord.setFieldValue('custrecord_rc_course_', httpBody)
  try {
  newICourseRecord.setFieldValue('custrecord_rc_course_title', httpBody.Title),
  newICourseRecord.setFieldValue('custrecord_rc_course_number', httpBody.Number),
  newICourseRecord.setFieldValue('custrecord_rc_course_credit_level', httpBody.CreditLevel.Id),
  newICourseRecord.setFieldValue('custrecord_rc_course_credit_hours', httpBody.CreditHours),
  newICourseRecord.setFieldValue('custrecord_rc_course_syllabi_name', httpBody.SyllabiName),
  // How do deal w this
  newICourseRecord.setFieldValue('custrecord_rc_course_institution', httpBody.ModeOfInstruction),
  newICourseRecord.setFieldValue('custrecord_rc_course_reg_course', httpBody.RegisteredCourseId)
  objDataResponse.ReturnId = nlapiSubmitRecord(newICourseRecord, true)
  } catch (ex) {
    nlapiLogExecution('ERROR', 'Something broke trying to set fields' + ex.message)

  }

  if(objDataResponse.ReturnId){
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Yo it seems as though we have been successful with endevour'
  }

  // Ask john.
  //1.)How to deal with "missing" values. What values must be supplied at any given stage
  // Mode up is required(looking at ns)

  // its either a list OR a record A list has id and value when writing i only provide an ID, don't pass anything but the id
  // think of it as an Enumerator, a number that means something else.
  //2.)How to deal with list objects



  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT','CREATE Courses', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _CreateContentHour(CourseId) {

}

function _CreateContentAreaAllocationHour(ContentHourId) {

}

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','DELETE Courses', '=====START=====');

  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'DELETE Courses', 'READ function in Courses executed.');


  var objDataResponse = {
      'Response': 'F',
      'Message': 'Default Message'
  }
  // By passing in optional second param, we are
  var DeletedCourseHourResponse = this._DeleteCourseHours(objRxData.Id, objRxData.CourseHourId);
  if (DeletedCourseHourResponse === 0){
      try {
          nlapiDeleteRecord('customrecord_rc_course', objRxData.Id);
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Course ' + objRxData.Id + ' successfully deleted.';
      }
      catch(ex) {
          nlapiLogExecution('ERROR', 'Courses.ss Delete', 'The attempt to delete the course failed for course id ' + objRxData.Id);
      }
  }
  else if (DeletedCoruseHourResponse === -1) {
      objDataResponse.Message = 'This course is locked and can not be deleted.';
  }
  else {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Course Hour ' + objRxData.CourseHourId + ' was successfully deleted.';
   }

  nlapiLogExecution('AUDIT','DELETE Courses', '======END======');
  return (JSON.stringify(objDataResponse));
};
// GO FROM HERE DOWN TO DELETE CONTENT HOUR mm 1.13.20
function _DeleteCourseHours(CourseId, CourseHourId) {

  try {
      var CourseHourFilters = new Array();
      CourseHourFilters[0] = nlapisearchFilter('custrecord_rc_content_hr_course', null, 'is', CourseId);

      var CourseHourColumns = new Array();
      CourseHourColumns[0] = nlapiSearchColumn('custrecord_rc_content_hr_status');
      CourseHourColumns[1] = nlapiSearchColumn('custrecord_rc_content_hr_start_date');

      var CourseHourSearchResults = nlapiSearchRecord('customrecord_rc_content_hours', null, CourseHourFilters, CourseHourColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Courses.ss _DeleteCourseHours', 'Search for course (content) hours failed.');
  }

  if (CourseHourSearchResults) {
      if (!(CourseHourSearchResults instanceof Array)) {
          CourseHourSearchResults = [CourseHourSearchResults];
      }

      var CourseHourRecordsDeleted = 0;

      for (var stCourseHourIndex in CourseHourSearchResults) {
          var TempCourseHourId = CourseHourSearchResults[stCourseHourIndex].getId()
          if (!CourseHourId ||  TempCourseHourId === CourseHourId) {
              if (CourseHourSearchResults[stCourseHourIndex].getValue(CourseHourColumns[0] == '1') && this._DateInTheFuture(CourseHourSearchResults[stCourseHourIndex].getValue(CourseHourColumns[1]))) {
                  if (!this._DeleteContentAreaAllocationHours(TempCourseHourId)){
                      try {
                          nlapiDeleteRecord('customrecord_rc_content_hours',TempCourseHourId);
                          CourseHourRecordsDeleted++;
                      }
                      catch(ex) {
                          nlapiLogExecution('ERROR', 'Courses.ss _DeleteCourseHours', 'The attempt to delete the course hour failed for CourseHourId ' + TempCourseHourId);
                      }
                  }
              }
              else {
                  return -1;
              }
          }
      }
      return CourseHourSearchResults.length - CourseHourRecordsDeleted;
  }
  return 0;
}

function _DeleteContentAreaAllocationHours(CourseHourId) {
  try {
      var ContentAreaHourFilter = new Array();
      ContentAreaHourFilter[0] = nlapisearchFilter('custrecord_rc_hr_alloc_content_hours', null, 'is', CourseHourId);

      var ContentAreaHourSearchResults = nlapiSearchRecord('customrecord_rc_hour_allocation', null, ContentAreaHourFilter, null);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'Courses.ss _DeleteContentAreaAllocationHours', 'Search for content area allocation hours failed.');
  }

  if (ContentAreaHourSearchResults) {
      if (!(ContentAreaHourSearchResults instanceof Array)) {
          ContentAreaHourSearchResults = [ContentAreaHourSearchResults];
      }
      var ContentAreaHourRecordsDeleted = 0;
      for (var stContentAreaHourIndex in ContentAreaHourSearchResults) {
          try {
              nlapiDeleteRecord('customrecord_rc_hour_allocation',ContentAreaHourSearchResults[stContentAreaHourIndex].getId());
              ContentAreaHourRecordsDeleted++;
          }
          catch(ex) {
              nlapiLogExecution('ERROR', 'Courses.ss _DeleteContentAreaAllocationHours', 'The attempt to delete the content area allocation hour failed for course hour Id ' + CourseHourId);
          }
      }
      return ContentAreaHourSearchResults.length - ContentAreaHourRecordsDeleted;
  }
  return 0;
}

function _DateInTheFuture(StartDateString) {
  var DateArray = StartDateString.split("/", 3);

  var StartDate = new Date(DateArray[2] + "-" + DateArray[0] + "-" + DateArray[1]);
  var CurrentDate = new Date();

  return CurrentDate > StartDate;
}

function _Read (objRequest) {
  nlapiLogExecution('AUDIT','READ Courses', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'READ Courses', 'READ function in Courses executed.');

  var objDataResponse = {
      Array: []
  }

  var Assignments = [];

  nlapiLogExecution('AUDIT', 'READ_CALLED', 'Sequence ID is: ' + objRxData.SequenceId);

  try {
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_crse_seq_crse_asign_crseseqnc',null,'is', objRxData.SequenceId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('custrecord_course_title','custrecord_crse_seq_crse_asign_crse');
    arrColumns[1] = new nlobjSearchColumn('custrecord_course_number','custrecord_crse_seq_crse_asign_crse');
    arrColumns[2] = new nlobjSearchColumn('custrecord_course_credit_level','custrecord_crse_seq_crse_asign_crse');

    var CourseSearchResults = nlapiSearchRecord('customrecord_crse_seqnc_crse_assignmnt',null, arrFilters, arrColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'SEARCH_FAILED', 'The search for courses failed: ' + _parseError(ex));
  }

  nlapiLogExecution('AUDIT', 'READ_CALLED', 'Instance of Array result is: ' + CourseSearchResults instanceof Array);
  nlapiLogExecution('AUDIT', 'READ_CALLED', 'Array length result is: ' + CourseSearchResults.length);

  if (CourseSearchResults instanceof Array && CourseSearchResults.length) {
      for (var stIndex in CourseSearchResults) {
          Assignments[CourseSearchResults[stIndex].getId()] = {   Title: CourseSearchResults[stIndex].getValue(arrColumns[0]),
                                                                  Number: CourseSearchResults[stIndex].getValue(arrColumns[1]),
                                                                  CreditLevel: CourseSearchResults[stIndex].getValue(arrColumns[2]),
                                                                  Hours: []
                                                              };
      }
  }
  else if (CourseSearchResults !== null){
      Assignments[CourseSearchResults.getId()] = {Title: CourseSearchResults.getValue(arrColumns[0]),
                                                  Number: CourseSearchResults.getValue(arrColumns[1]),
                                                  CreditLevel: CourseSearchResults.getValue(arrColumns[2]),
                                                  Hours: []
                                                  };
  }

  try {
    arrFilters[0] = new nlobjSearchFilter('custrecord_crse_seq_crse_asign_crseseqnc','custrecord_cnt_hrs_crseseq_crseassignmnt','is', objRxData.SequenceId);

    arrColumns[0] = new nlobjSearchColumn('custrecord_cnt_hrs_crseseq_crseassignmnt');
    arrColumns[1] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_strt_year');
    arrColumns[2] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_strt_sem');
    arrColumns[3] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_strt_quar');
    arrColumns[4] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_end_year');
    arrColumns[5] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_end_quar');
    arrColumns[6] = new nlobjSearchColumn('custrecord_cnt_hrs_activ_end_sem');


    var HourSearchResults = nlapiSearchRecord('customrecord_content_hours',null, arrFilters, arrColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'SEARCH_FAILED', 'The search for course hours failed: ' + _parseError(ex));
  }
  if (HourSearchResults instanceof Array && HourSearchResults.length) {
      for (var stIndex in HourSearchResults) {
          var Delimiter = '';
          if (HourSearchResults[stIndex].getValue(arrColumns[2]) !== '' && HourSearchResults[stIndex].getValue(arrColumns[3]) !== '') {
              Delimiter = '/';
          }
          Assignments[HourSearchResults[stIndex].getValue(arrColumns[0])].Hours.push({Year: HourSearchResults[stIndex].getValue(arrColumns[1]),
                                          endYear: HourSearchResults[stIndex].getValue(arrColumns[4]),
                                                                                      SemQrt: HourSearchResults[stIndex].getText(arrColumns[2]),
                                          endSemQrt: HourSearchResults[stIndex].getText(arrColumns[5]),
                                          startQuarter: HourSearchResults[stIndex].getText(arrColumns[3]),
                                          endQuarter: HourSearchResults[stIndex].getText(arrColumns[6]),

                                                                                      ContentHoursId: HourSearchResults[stIndex].getId()});
      }
  }
  else if (HourSearchResults !== null){
      var Delimiter = '';
      if (HourSearchResults.getValue(arrColumns[2]) !== '' && HourSearchResults.getValue(arrColumns[3]) !== '') {
          Delimiter = '/';
      }
      Assignments[HourSearchResults.getValue(arrColumns[0])].Hours.push({Year: HourSearchResults.getValue(arrColumns[1]),
                                    endYear: HourSearchResults.getValue(arrColumns[4]),

          SemQrt: HourSearchResults.getText(arrColumns[2]),
    endSemQrt: HourSearchResults.getText(arrColumns[5]),
           startQuarter: HourSearchResults.getText(arrColumns[3]),
            endQuarter:  HourSearchResults.getText(arrColumns[6]),


          ContentHoursId: HourSearchResults.getId()});
  }

  for (var stIndex in Assignments) {
      for (stHourIndex in Assignments[stIndex].Hours) {
          objDataResponse.Array.push({  "Name": Assignments[stIndex].Title,
                                          "Number": Assignments[stIndex].Number,
                                          "Level": Assignments[stIndex].CreditLevel,
                                          "Year": {"start": Assignments[stIndex].Hours[stHourIndex].Year,
                         "end": Assignments[stIndex].Hours[stHourIndex].endYear
                        },
                                          "Semester": {"start": Assignments[stIndex].Hours[stHourIndex].SemQrt,
                           "end": Assignments[stIndex].Hours[stHourIndex].endSemQrt
                           },
                    "Quarter": {"start": Assignments[stIndex].Hours[stHourIndex].startQuarter,
                          "end": Assignments[stIndex].Hours[stHourIndex].endQuarter
                          },


                                          "ContentHoursId": Assignments[stIndex].Hours[stHourIndex].ContentHoursId
                                      });
      }
  }

  nlapiLogExecution('AUDIT','READ Courses', '======END======');
  return (JSON.stringify(objDataResponse));
};

// Expecting A course Id and a completed I-course object
function _Update(objRequest, objResponse) {
  nlapiLogExecution('AUDIT','UPDATE Courses', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  nlapiLogExecution('AUDIT', 'Update Course', 'Update function in Departments executed.');

  var objDataResponse = {
    Response: 'F',
    Message: 'Default Value',
    ReturnId: ''
  };

  var loadedICourseRecord = nlapiLoadRecord('customrecord_rc_course', httpBody.Id);

  try {
    loadedICourseRecord.setFieldValue('custrecord_rc_course_title', httpBody.Title),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_number', httpBody.Number),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_credit_level', httpBody.CreditLevel.Id),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_credit_hours', httpBody.CreditHours),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_syllabi_name', httpBody.SyllabiName),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_institution', httpBody.ModeOfInstruction),
    loadedICourseRecord.setFieldValue('custrecord_rc_course_reg_course', httpBody.RegisteredCourseId)
    objDataResponse.ReturnId = nlapiSubmitRecord(loadedICourseRecord, true)
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'Something broke trying to set fields' + ex.message)
  }

  if(objDataResponse.ReturnId){
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'Yo it seems as though we have been successful with dis otha endevour' + JSON.stringify(loadedICourseRecord)
  }

  // Ask john.
  //1.)How to deal with "missing" values. What values must be supplied at any given stage
  // Mode up is required(looking at ns)

  // its either a list OR a record A list has id and value when writing i only provide an ID, don't pass anything but the id
  // think of it as an Enumerator, a number that means something else.
  //2.)How to deal with list objects

  nlapiLogExecution('AUDIT','UPDATE Courses', '======END======');
  return JSON.stringify(objDataResponse)
};

function _parseError (ErrorObj) {

  var errorText = '';

  if (ErrorObj instanceof nlobjError)
  {
      errorText = 'UNEXPECTED ERROR: ' + '\n\n';
      errorText += 'Script Name: ' + ErrorObj.getUserEvent() + '\n';
      errorText += 'Error Code: ' + ErrorObj.getCode() + '\n';
      errorText += 'Error Details: ' + ErrorObj.getDetails() + '\n\n';
      errorText += 'Stack Trace: ' + ErrorObj.getStackTrace();
  }
  else
  {
      errorText = 'UNEXPECTED ERROR: ' + '\n\n';
      errorText += 'Error Details: ' + ErrorObj.toString();
  }

  return errorText;
};
