var ACTIONS = {
  CreateContentHour: _CreateContentHour,
  ReadContentHour: _ReadContentHour,
  UpdateContentHour: _UpdateContentHour,
  DeleteContentHour: _DeleteContentHour,
  CreateAllocationHours: _CreateAllocationHours,
  ReadAllocationHours: _ReadAllocationHours,
  UpdateAllocationHours: _UpdateAllocationHours,
  DeleteAllocationHours: _DeleteAllocationHours

};
// TODO: When done making services, reorganize in file into Content hour and allocation hour
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


// #1 Pass in, Course ID, I-course-hours{}
// Make sure that we've created a course-hour object that works.
function _CreateContentHour(objRequest) {

  nlapiLogExecution('AUDIT','CONTENT-HOURS.SS CreateContentHour', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse = {
    Response: 'F',
    Message: 'Default Value',
    ReturnId: ''
  };
  var newICourseHourRecord = nlapiCreateRecord('customrecord_rc_content_hours');
  try{
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_course', httpBody.CourseId),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_edition', httpBody.Edition.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_date', httpBody.Date.Start),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_date', httpBody.Date.End),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_year', httpBody.Year.Start),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_year', httpBody.Year.End),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_sem', httpBody.Semester.Start.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_sem', httpBody.Semester.End.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_qtr', httpBody.Quarter.Start.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_qtr', httpBody.Quarter.End.Id),
    objDataResponse.ReturnId = nlapiSubmitRecord(newICourseHourRecord, true)
  } catch (ex) {
    nlapiLogExecution('ERROR', 'Something broke trying to set fields' + ex.message)
  }
  if(objDataResponse.ReturnId){
    objDataResponse.Response = 'T';
    objDataResponse.Message = 'success';
  }

  nlapiLogExecution('AUDIT','CONTENT-HOURS.SS CreateContentHour', "=====END=====");

  return (JSON.stringify(objDataResponse));

}



// #2
function _UpdateContentHour(objRequest) {
  nlapiLogExecution('AUDIT','CONTENT-HOURS.SS UpdateContentHour', "=====START=====");
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse = {
    Response: 'F',
    Message: 'Default Value',
    ReturnId: ''
  };
  try{
    var newICourseHourRecord = nlapiLoadRecord('customrecord_rc_content_hours', httpBody.Id);
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_course', httpBody.CourseId),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_edition', httpBody.Edition.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_date', httpBody.Date.Start),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_date', httpBody.Date.End),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_year', httpBody.Year.Start),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_year', httpBody.Year.End),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_sem', httpBody.Semester.Start.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_sem', httpBody.Semester.End.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_start_qtr', httpBody.Quarter.Start.Id),
    newICourseHourRecord.setFieldValue('custrecord_rc_content_hr_end_qtr', httpBody.Quarter.End.Id),
    objDataResponse.ReturnId = nlapiSubmitRecord(newICourseHourRecord, true)
  } catch (ex) {
    nlapiLogExecution('ERROR', 'ContentHours.ss UpdateContentHour', 'Something broke trying to set fields' + ex.message)
    objDataResponse.Message = ex.message
  }
  objDataResponse.ReturnId? (objDataResponse.Response = 'T', objDataResponse.Message = 'success'): objDataResponse;

  nlapiLogExecution('AUDIT','CONTENT-HOURS.SS UpdateContentHour', "=====END=====");
  return (JSON.stringify(objDataResponse));
}
// #3
// Do not pass in any 0's 1.13.208
function _CreateAllocationHours(objRequest, objResponse) {
  nlapiLogExecution('AUDIT',"CONTENT-HOURS.SS CreateAllocationHour", "=====START=====");

  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse = {
    Response: 'F',
    Message: 'Default Value',
    ReturnId: ''
  };
  try{
    nlapiLogExecution('AUDIT', 'Somestuff', JSON.stringify(httpBody))

    for(var contentHourAllocationIndex in httpBody.courseHours) {
      var newContentAllocationHour = nlapiCreateRecord('customrecord_rc_hour_allocation');
    //  newContentAllocationHour.setFieldValue('custrecord_rc_hr_content_hours', httpBody.courseHours[contentHourAllocationIndex].CourseHourId)
      newContentAllocationHour.setFieldValue('custrecord_rc_hr_alloc_type', httpBody.courseHours[contentHourAllocationIndex].Type.Id)
      newContentAllocationHour.setFieldValue('custrecord_rc_hr_alloc_value', httpBody.courseHours[contentHourAllocationIndex].Value)
      objDataResponse.ReturnId = nlapiSubmitRecord(newContentAllocationHour, false);
      if(objDataResponse.ReturnId) {
        objDataResponse.Response = 'T', objDataResponse.Message = 'success'
      } else {
        throw new Error('persist failure on record submission. Object That failed:' + JSON.stringify(httpBody.courseHours[contentHourAllocationIndex]));
      }
    }
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'Something broke trying to set fields' + ex.message)
    objDataResponse.Message = ex.message
  }
  objDataResponse.ReturnId? (objDataResponse.Response = 'T', objDataResponse.Message = 'success'): objDataResponse;

  nlapiLogExecution('AUDIT',"CONTENT-HOURS.SS CreateAllocationHour", "=====END=====");
  return (JSON.stringify(objDataResponse));
}

// #4
//
function _UpdateAllocationHours(objRequest) {
  nlapiLogExecution('AUDIT', "ContentHours.ss UpdateAllocationHours","=====START=====");
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse =
  {
    'Array': []
  };
  for(var contentHourAllocationIndex in httpBody.courseHours) {
    try {
      nlapiLogExecution('AUDIT', 'Somestuff', JSON.stringify(httpBody));
      var returnId = '';
        // NEED THE I Courese Hour Id
        var loadedContentAllocationHour = nlapiLoadRecord('customrecord_rc_hour_allocation', httpBody.courseHours[contentHourAllocationIndex].Id);
        loadedContentAllocationHour.setFieldValue('custrecord_rc_hr_content_hours', httpBody.courseHours[contentHourAllocationIndex].CourseHourId)
        loadedContentAllocationHour.setFieldValue('custrecord_rc_hr_alloc_type', httpBody.courseHours[contentHourAllocationIndex].Type.Id)
        loadedContentAllocationHour.setFieldValue('custrecord_rc_hr_alloc_value', httpBody.courseHours[contentHourAllocationIndex].Value)
        returnId = nlapiSubmitRecord(loadedContentAllocationHour, false);
        if(returnId){
          objDataResponse.Array.push({'Response': 'T', 'Message': 'Sucessful Record Updated', 'ReturnId': returnId})
        } else {
          throw new error("Record failed to update")
        }
      }
      catch (ex) {
        objDataResponse.Array.push({'Response': 'F', 'Message': ex.Message, 'ReturnId': 'failedRecord' + httpBody.courseHours[contentHourAllocationIndex].CourseHourId})
        nlapiLogExecution('ERROR', 'Something broke trying to set fields' + ex.message)
      }
  }
  nlapiLogExecution('AUDIT',"", "=====END=====");
  return (JSON.stringify(objDataResponse));

} // #5
function _DeleteAllocationHours(objRequest) {
  nlapiLogExecution('AUDIT', "ContentHours.ss DeleteAllocationHours","=====START=====");
  var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  var objDataResponse =
  {
    'Array': []
  };
  for(contentHourAllocationIndex in httpBody.courseHours){
    // var killme = httpBody.courseHours[contentHourAllocationIndex].Id
    try{
      nlapiDeleteRecord('customrecord_rc_hour_allocation',  (httpBody.courseHours[contentHourAllocationIndex].Id * -1))
      objDataResponse.Array.push({'Response': 'T', 'Message': 'Sucessful Record Deletion', 'ReturnId':httpBody.courseHours[contentHourAllocationIndex].Id})

    }catch(ex){
      objDataResponse.Array.push({'Response': 'F', 'Message': 'Record Deletion Failed, see return Id for ID of failed deletion', 'ReturnId':httpBody.courseHours[contentHourAllocationIndex].CourseHourId})
    }
  }
//   try{
//     nlapiLoadRecord('customrecord_rc_hour_allocation',  killme)

//   }catch(ex)
//   {      objDataResponse.Array.push({'Response': 'F', 'Message': 'Record Deletion Failed, see return Id for ID of failed deletion', 'ReturnId':httpBody.courseHours[contentHourAllocationIndex].CourseHourId})
// }


  nlapiLogExecution('AUDIT',"ContentHours.ss DeleteAllocationHours", "=====END=====");
  return (JSON.stringify(objDataResponse));
}
function _ReadContentHour(objRequest) {
  nlapiLogExecution('AUDIT',"", "=====START=====");
  nlapiLogExecution('AUDIT',"", "=====END=====");
}
function _DeleteContentHour(objRequest) {
  nlapiLogExecution('AUDIT',"", "=====START=====");
  nlapiLogExecution('AUDIT',"", "=====END=====");
}

function _ReadAllocationHours(objRequest) {
  nlapiLogExecution('AUDIT',"", "=====START=====");
  nlapiLogExecution('AUDIT',"", "=====END=====");
}
