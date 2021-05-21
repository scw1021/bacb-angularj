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
function service(objRequest, objResponse) {

var stParam = objRequest.getParameter('param');

if (ACTIONS[stParam]) {
  ACTIONS[stParam](objRequest, objResponse);
}

};


// #1 Pass in, Course ID, I-course-hours{}
// Make sure that we've created a course-hour object that works.
function _CreateContentHour(objRequest, objResponse) {
  var sessionInvalid = 'oof'
  var bodyNotRead = 'oof'
  E$.logAudit('CONTENT-HOURS.SS CreateContentHour', "=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', sessionInvalid, 'The call to get the current web session failed.:' + ex.message)
  }


  var httpBody = objRequest.getBody();
  if(httpBody){
    httpBody = JSON.parse(httpBody)
  } else {
    nlapiLogExecution('ERROR', bodyNotRead, 'Body could not be read');
  }
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



  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit('CONTENT-HOURS.SS CreateContentHour', "=====END=====");
}



// #2
function _UpdateContentHour(objRequest, objResponse) {
  E$.logAudit('CONTENT-HOURS.SS UpdateContentHour', "=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'ContentHours.ss UpdateContentHour', 'The call to get the current web session failed.:' + ex.message)
  }


  var httpBody = objRequest.getBody();
  if(httpBody){
    httpBody = JSON.parse(httpBody)
  } else {
    nlapiLogExecution('ERROR', 'ContentHours.ss UpdateContentHour', 'Body could not be read');
  }
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
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit('CONTENT-HOURS.SS UpdateContentHour', "=====END=====");

}
// #3
// Do not pass in any 0's 1.13.208
function _CreateAllocationHours(objRequest, objResponse) {
  E$.logAudit("CONTENT-HOURS.SS CreateAllocationHour", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'ContentHours.SS CreateAllocationHours', 'The call to get the current web session failed.:' + ex.message)
  }


  var httpBody = objRequest.getBody();
  if(httpBody){
    httpBody = JSON.parse(httpBody)
  } else {
    nlapiLogExecution('ERROR', bodyNotRead, 'Body could not be read');
  }
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
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit("CONTENT-HOURS.SS CreateAllocationHour", "=====END=====");
}





// #4
//
function _UpdateAllocationHours(objRequest, objResponse) {
  E$.logAudit( "ContentHours.ss UpdateAllocationHours","=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'ContentHours.SS UpdateAllocationHours', 'The call to get the current web session failed.:' + ex.message)
  }

  var httpBody = objRequest.getBody();
  if(httpBody){
    httpBody = JSON.parse(httpBody)
  } else {
    nlapiLogExecution('ERROR', bodyNotRead, 'Body could not be read');
  }
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
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit("", "=====END=====");
} // #5
function _DeleteAllocationHours(objRequest, objResponse) {
  E$.logAudit( "ContentHours.ss DeleteAllocationHours","=====START=====");
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'ContentHours.SS UpdateAllocationHours', 'The call to get the current web session failed.:' + ex.message)
  }

  var httpBody = objRequest.getBody();
  if(httpBody){
    httpBody = JSON.parse(httpBody)
  } else {
    nlapiLogExecution('ERROR', bodyNotRead, 'Body could not be read');
  }
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
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));

  E$.logAudit("ContentHours.ss DeleteAllocationHours", "=====END=====");
}
function _ReadContentHour(objRequest, objResponse) {
  E$.logAudit("", "=====START=====");
  E$.logAudit("", "=====END=====");
}
function _DeleteContentHour(objRequest, objResponse) {
  E$.logAudit("", "=====START=====");
  E$.logAudit("", "=====END=====");
}

function _ReadAllocationHours(objRequest, objResponse) {
  E$.logAudit("", "=====START=====");
  E$.logAudit("", "=====END=====");
}
