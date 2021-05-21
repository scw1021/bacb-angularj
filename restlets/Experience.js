var ACTIONS = {
  Check: _Check,
  Create: _Create,
  Delete: _Delete,
  DeleteAll: _DeleteAll,
  Read: _Read,
  Update: _Update,
  GetType: _GetType
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

function _Check(objRequest) {
  nlapiLogExecution('AUDIT','Check Experience', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Check Experience', 'CHECK function in Experience executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': ''
  }

  // Check coursework startdate vs. start of each experience
  // Math.abs(endDate.getTime() - startDate.getTime())*(1000 * 60 * 60 * 24 * 365) < 5

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_exp_application',null,'is',objRxData.AppId);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_app_certification_type', 'custrecord_exp_application');
  arrColumns[1] = new nlobjSearchColumn('custrecord_exp_type');
  arrColumns[2] = new nlobjSearchColumn('custrecord_exp_fldwrk_hours_present');
  arrColumns[3] = new nlobjSearchColumn('custrecord_es_exp_supervision_hours');

  var searchResults = nlapiSearchRecord('customrecord_es_experience',null, arrFilters, arrColumns);
  nlapiLogExecution('DEBUG', 'Check Search Results', JSON.stringify(searchResults));
  var arrMultiplier = (0,1,1.5,2);
  var TotalHours = 0;
  var ExperienceMissingSupervisions = 0;
  var CertificationType = 0;
  if (searchResults instanceof Array && searchResults.length) {
      CertificationType = searchResults[0].getValue(arrColumns[0]);
      nlapiLogExecution('DEBUG', 'Check Search Results', CertificationType);
      nlapiLogExecution('DEBUG', 'CHECK - full mutliplier', arrMultiplier);
      for (var stIndex in searchResults) {
        nlapiLogExecution('DEBUG', 'CHECK - fldwrk-hrs-present', searchResults[stIndex].getValue(arrColumns[2]));
        nlapiLogExecution('DEBUG', 'CHECK - exp-super-hrs', searchResults[stIndex].getValue(arrColumns[3]));
        nlapiLogExecution('DEBUG', 'CHECK - mutliplier', arrMultiplier);
          TotalHours += (searchResults[stIndex].getValue(arrColumns[2]) + searchResults[stIndex].getValue(arrColumns[3])) * arrMultiplier;
          if (_GetSupervisions(searchResults[stIndex].getId()).length === 0) {
              ExperienceMissingSupervisions += 1;
          }
      }
  }
  nlapiLogExecution('DEBUG', 'CHECK - Total Hours', TotalHours);
  nlapiLogExecution('DEBUG', 'CHECK - ExperienceMissingSupers', ExperienceMissingSupervisions);
  if (CertificationType === '1' && ExperienceMissingSupervisions === 0 && TotalHours > 1500) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Experience requirements have been confirmed to be complete.';
  }
  else if (CertificationType === '2' && ExperienceMissingSupervisions === 0 && TotalHours > 1000) {
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'Experience requirements have been confirmed to be complete.';
  }
  else {
      objDataResponse.Message = 'Experience requirements have not been met.';
  }
  nlapiLogExecution('DEBUG', 'Check OUTPUT', JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT','Check Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Create(objRequest) {
  nlapiLogExecution('AUDIT','Create Experience', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Create Experience', 'CREATE function in Experience executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': ''
  }

  if (objRxData.AppId) {
      // Create new experience record
      nlapiLogExecution('AUDIT', 'Create Experience', JSON.stringify(objRxData));
      var recNewExperience = nlapiCreateRecord('customrecord_es_experience');
      recNewExperience.setFieldValue('custrecord_exp_application', objRxData.AppId);
      recNewExperience.setFieldValue('custrecord_exp_status', '1');
      recNewExperience.setFieldValue('custrecord_exp_type', objRxData.Type.Id);
      recNewExperience.setFieldValue('custrecord_exp_practicum_course', objRxData.PracticumName);
      recNewExperience.setFieldValue('custrecord_exp_practicum_crs_id', objRxData.PracticumId);
      recNewExperience.setFieldValue('custrecord_exp_representation_type', objRxData.RepresentationType.Id);
      recNewExperience.setFieldValue('custrecord_exp_fldwrk_hours_present', objRxData.IndependentHours);
      recNewExperience.setFieldValue('custrecord_es_exp_supervision_hours', objRxData.SupervisedHours);
      //TODO: Add total hours and modified total hours
      recNewExperience.setFieldValue('custrecord_exprnc_start_date', objRxData.StartDate);
      recNewExperience.setFieldValue('custrecord_exprnc_end_date', objRxData.EndDate);
      objDataResponse.ExperienceId = nlapiSubmitRecord(recNewExperience, true);
      var SupervisorIds = [];
      if (objRxData.Supervisions) {
          for (var stIndex in objRxData.Supervisions) {
              var recNewSupervision = nlapiCreateRecord('customrecord_experience_supervisor');

              nlapiLogExecution('AUDIT', 'Create Experience', 'Customer ID for Supervisor = ' + objRxData.Supervisions[stIndex].Supervisor.Id);

              recNewSupervision.setFieldValue('custrecord_experience_id', objDataResponse.ExperienceId);
              recNewSupervision.setFieldValue('custrecord_supervisor_id', objRxData.Supervisions[stIndex].Supervisor.Id);
              recNewSupervision.setFieldValue('custrecord_primary_supervisor', objRxData.Supervisions[stIndex].IsPrimary);

              SupervisorIds.push(nlapiSubmitRecord(recNewSupervision, true));  // We aren't currently passing back the Supervisions
          }
      }
      nlapiLogExecution('AUDIT', 'Create Experience', 'Adding Document: ' + objRxData.VFDocument);
      if (objRxData.VFDocument) {
        nlapiLogExecution('AUDIT', 'Create Experience', 'Adding Document: ' + objRxData.VFDocument);
          try {
              var recExperience = nlapiLoadRecord('customrecord_es_experience', objDataResponse.ExperienceId);
              recExperience.setFieldValue('custrecord_expernc_evf_doc', objRxData.VFDocument);
              var ExperienceId = nlapiSubmitRecord(recExperience, true);
          }
          catch (ex) {
              throw nlapiCreateError('Create Experience','nlapiSubmitRecord failed for document.' + ex.message);
          }
          if (ExperienceId) {
              objDataResponse.Response = 'T';
              objDataResponse.Message = 'Experience record was created.  ExperienceID: ' + ExperienceId;
          }
      };
  }
  else {
      throw nlapiCreateError('Create Experience', 'Application ID is invalid.');
  }

  nlapiLogExecution('AUDIT','Create Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','Delete Experience', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Delete Experience', 'DELETE function in Experience executed.');

  var objDataResponse = {
     'Response': 'F',
      'Message': ''
  }

  if (objRxData.Id) {
      if (_Delete_Supervisions(objRxData.Id)) {
          try {
              nlapiDeleteRecord('customrecord_es_experience',objRxData.Id);
          }
          catch (error) {
              objDataResponse.Message = 'Delete failed: ' + _parseError(error);
              throw nlapiCreateError('Delete Experience',objDataResponse.Message);
          }
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'The experience record was deleted successfully';
      }
      else {
          objDataResponse.Message = 'Delete failed: Delete Supervisions failed.';
          throw nlapiCreateError('Delete Experience', 'Delete Supervisions failed.');
      }

  }
  else {
      throw nlapiCreateError('Delete Experience', 'Experience ID is invalid.');
  }

  nlapiLogExecution('AUDIT','Delete Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _DeleteAll(objRequest) {
  nlapiLogExecution('AUDIT','DeleteAll Experience', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'DeleteAll Experience', 'DELETE function in Experience executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message': ''
  }

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_exp_application',null,'is',objRxData.AppId);

  var searchResults = nlapiSearchRecord('customrecord_es_experience',null, arrFilters, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          _Delete_Supervisions(searchResults[stIndex].getId());
          try {
              nlapiDeleteRecord('customrecord_es_experience', searchResults[stIndex].getId());
          }
          catch (ex) {
              nlapiLogExecution('ERROR', 'DeleteAll Experience', 'The attempt to delete a experience record failed.:' + ex.message)
          }
      }
      objDataResponse.Response = 'T';
      objDataResponse.Message = 'The experience record was deleted successfully';
  }
  else if (searchResults !== null){
      _Delete_Supervisions(searchResults.getId());
      try {
          nlapiDeleteRecord('customrecord_es_experience', searchResults.getId());
      }
      catch (ex) {
          nlapiLogExecution('ERROR', 'DeleteAll Experience', 'The attempt to delete an experience record failed.:' + ex.message)
      }
  }

  nlapiLogExecution('AUDIT','DeleteAll Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete_Supervisions(ExperienceId) {
  if (ExperienceId) {

      var arrFilters = [];
      arrFilters[0] = new nlobjSearchFilter('custrecord_experience_id',null,'is', ExperienceId);


      var searchResults = nlapiSearchRecord('customrecord_experience_supervisor',null, arrFilters, null);

      if (searchResults instanceof Array && searchResults.length) {
          for (var stIndex in searchResults) {
              try {
                  nlapiDeleteRecord('customrecord_experience_supervisor', searchResults[stIndex].getId());
              }
              catch (ex) {
                  nlapiLogExecution('ERROR', 'DeleteSupervisions Experience', 'The attempt to delete an experience supervisor record failed.:' + ex.message)
              }
          }
          return true;
      }
      else if (searchResults !== null){
          try {
              nlapiDeleteRecord('customrecord_es_experience', searchResults.getId());
          }
          catch (ex) {
              nlapiLogExecution('ERROR', 'DeleteSupervisions Experience', 'The attempt to delete an experience supervisor record failed.:' + ex.message)
          }
          return true;
      }
      else {
          return true;
      }
  }
  else {
      throw nlapiCreateError('INVALID_DATA', 'Experience ID is invalid.');
  }
};

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','Read Experience', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Read Experience', 'READ function in Experience executed.');

  var objDataResponse = {
      Array: []
  }

  var arrTypeMultiplier = [];
  arrTypeMultiplier[0] = 0;   // invalid type id
  arrTypeMultiplier[1] = 1;   // Individual
  arrTypeMultiplier[2] = 1.5; // Practicum
  arrTypeMultiplier[3] = 2;   // Intensive Practicum

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_exp_application',null,'is',objRxData.AppId);
  if (objRxData.ExperienceId !== null && parseInt(objRxData.ExperienceId,10) > 0) {
      arrFilters[1] = new nlobjSearchFilter('internalid', null, 'is', objRxData.ExperienceId)
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('custrecord_exp_type');
  arrColumns[1] = new nlobjSearchColumn('custrecord_exp_fldwrk_hours_present');
  arrColumns[2] = new nlobjSearchColumn('custrecord_es_exp_supervision_hours');
  arrColumns[3] = new nlobjSearchColumn('custrecord_exprnc_start_date');
  arrColumns[4] = new nlobjSearchColumn('custrecord_exprnc_end_date');
arrColumns[5] = new nlobjSearchColumn('custrecord_exptype_name','custrecord_exp_type');
  arrColumns[6] = new nlobjSearchColumn('custrecord_exptype_hours_multiplier','custrecord_exp_type');
  arrColumns[7] = new nlobjSearchColumn('custrecord_exp_representation_type');

  var searchResults = nlapiSearchRecord('customrecord_es_experience',null, arrFilters, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Array.push({'Id': searchResults[stIndex].getId(),
                                      'RepresentationType': {'Id': searchResults[stIndex].getValue(arrColumns[7]),
                                                             'Value': searchResults[stIndex].getText(arrColumns[7])},
                                      'Type': {'Id': searchResults[stIndex].getValue(arrColumns[0]),
                                               'Name': searchResults[stIndex].getValue(arrColumns[5]),
                                               'HourModifier': arrTypeMultiplier[searchResults[stIndex].getValue(arrColumns[6])]
                                      },
                                      'StartDate': searchResults[stIndex].getValue(arrColumns[3]),
                                      'EndDate': searchResults[stIndex].getValue(arrColumns[4]),
                                      'Supervisions': _GetSupervisions(searchResults[stIndex].getId()),
                                      'SupervisedHours': searchResults[stIndex].getValue(arrColumns[2]),
                                      'IndependentHours':  searchResults[stIndex].getValue(arrColumns[1]),
                                      'TotalHours':  parseInt(searchResults[stIndex].getValue(arrColumns[1]),10) + parseInt(searchResults[stIndex].getValue(arrColumns[2]),10),
                                      'CalculatedHours': (parseInt(searchResults[stIndex].getValue(arrColumns[1]),10) + parseInt(searchResults[stIndex].getValue(arrColumns[2]),10)) * arrTypeMultiplier[searchResults[stIndex].getValue(arrColumns[0])]
                                      });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Array.push({'Id': searchResults.getId(),
                                  'RepresentationType': {'Id': searchResults.getValue(arrColumns[7]),
                                                         'Value': searchResults.getText(arrColumns[7])},
                                  'Type': {'Id': searchResults.getValue(arrColumns[0]),
                                           'Name': searchResults.getValue(arrColumns[5]),
                                           'HourModifier': arrTypeMultiplier[searchResults.getValue(arrColumns[6])]
                                  },
                                  'StartDate': searchResults.getValue(arrColumns[3]),
                                  'EndDate': searchResults.getValue(arrColumns[4]),
                                  'Supervisions': _GetSupervisions(searchResults.getId()),
                                  'SupervisedHours': searchResults.getValue(arrColumns[2]),
                                  'IndependentHours':  searchResults.getValue(arrColumns[1]),
                                  'TotalHours':  parseInt(searchResults.getValue(arrColumns[1]),10) + parseInt(searchResults.getValue(arrColumns[2]),10),
                                  'CalculatedHours': (parseInt(searchResults.getValue(arrColumns[1]),10) + parseInt(searchResults.getValue(arrColumns[2]),10)) * arrTypeMultiplier[searchResults.getValue(arrColumns[0])]
      });
  }

  nlapiLogExecution('AUDIT','Read Experience','Experience Return Object: ' + JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT','Read Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Update(objRequest) {
  nlapiLogExecution('AUDIT','Update Experience', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest['Experience'];
  nlapiLogExecution('AUDIT', 'Update Experience', 'UPDATE function in Experience executed.');

  var objDataResponse = {
      'Response': 'F',
      'Message' : ''
  }

  if (objRxData.AppId) {

      var recOldExperience = nlapiLoadRecord('customrecord_es_experience', objRxData.ExperienceId);
      recOldExperience.setFieldValue('custrecord_application', objRxData.AppId);
      recNewExperience.setFieldValue('custrecord_exp_status', '1');
      recNewExperience.setFieldValue('custrecord_exp_type', objRxData.Type.Id);
      recNewExperience.setFieldValue('custrecord_exp_practicum_course', objRxData.PracticumName);
      recNewExperience.setFieldValue('custrecord_exp_practicum_crs_id', objRxData.PracticumId);
      recNewExperience.setFieldValue('custrecord_exp_representation_type', objRxData.RepresentationType.Id);
      recNewExperience.setFieldValue('custrecord_exp_fldwrk_hours_present', objRxData.IndependentHours);
      recNewExperience.setFieldValue('custrecord_es_exp_supervision_hours', objRxData.SupervisedHours);
      recNewExperience.setFieldValue('custrecord_exprnc_start_date', objRxData.StartDate);
      recNewExperience.setFieldValue('custrecord_exprnc_end_date', objRxData.EndDate);
      var ExperienceId = nlapiSubmitRecord(recOldExperience, true);

      if (ExperienceId) {
          objDataResponse.Response = 'T';
          objDataResponse.Message = 'Experience record updated successfully.';
      }
  }
  else {
      throw nlapiCreateError('Update Experience', 'Application ID is invalid.');
  }
  var SupervisorIds = [];
  if (ExperienceId && objRxData.Supervisions) {
      var ExistingSupervisions = _GetSupervisions(ExperienceId);
      for (var stIndex in objRxData.Supervisions) {
          var recSupervision;
          var SelectedSupervision = ExistingSupervisions.filter(function(Element) { return Element.BACBID == objRxData.Supervisions[stIndex].BACBID; } )[0];
          if (SelectedSupervision){
              recSupervision = SelectedSupervision;
          }
          else {
              recSupervision = nlapiCreateRecord('customrecord_experience_supervisor');
          }

          nlapiLogExecution('AUDIT', 'Update Experience', 'Customer ID for Supervisor = ' + objRxData.Supervision.Supervisor.Id);

          recNewSupervision.setFieldValue('custrecord_experience_id', objDataResponse.ExperienceId);
          recNewSupervision.setFieldValue('custrecord_supervisor_id', objRxData.Supervision.Supervisor.AppId);
          recNewSupervision.setFieldValue('custrecord_primary_supervisor', objRxData.Supervision.IsPrimary);

          SupervisorIds.push(nlapiSubmitRecord(recNewSupervision, true));  // We aren't currently passing back the Supervisions
      }
  }
  if (objRxData.VFDocument) {
      try {
          var recExperience = nlapiLoadRecord('customrecord_experience', objDataResponse.ExperienceId);
          recExperience.setFieldValue('custrecord_expernc_evf_doc', _UpdateDocument(stCustId, objRxData.VFDocument, objDataResponse.ExperienceId, recExperience.getFieldValue('custrecord_expernc_evf_doc')));
          var ExperienceId = nlapiSubmitRecord(recExperience, true);
      }
      catch (ex) {
          objDataResponse.Message += '  Update failed for document.' + ex.message
          throw nlapiCreateError('Update Experience','nlapiSubmitRecord failed for document.' + ex.message);
      }
  };

  nlapiLogExecution('AUDIT','Update Experience', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _CreateSupervision(ExperienceID, SupervisorBACBID, IsPrimary) {
  var recNewSupervision = nlapiCreateRecord('customrecord_supervision');
  recNewSupervision.setFieldValue('custrecord_experience_id', ExperienceID);
  recNewSupervision.setFieldValue('custrecord_supervisor_id', _GetCustomer(SupervisorBACBID).Id);
  recNewSupervision.setFieldValue('custrecord_primary_supervisor', IsPrimary);

  return nlapiSubmitRecord(recNewSupervision, true);
};

function _GetSupervisions(ExperienceID) {
  var arrSupervisions = [];
  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('custrecord_experience_id', null, 'is', ExperienceID);

  var arrColumns = [];
  arrColumns[0] = new nlobjSearchColumn('entityid', 'custrecord_supervisor_id');
  arrColumns[1] = new nlobjSearchColumn('firstname', 'custrecord_supervisor_id');
  arrColumns[2] = new nlobjSearchColumn('lastname', 'custrecord_supervisor_id');
  arrColumns[3] = new nlobjSearchColumn('custrecord_supervisor_id');
  arrColumns[4] = new nlobjSearchColumn('custrecord_primary_supervisor');

  var searchResults = nlapiSearchRecord('customrecord_experience_supervisor', 'null', arrFilters, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          arrSupervisions.push({  Id: searchResults[stIndex].getId(),
                                  ExpId: ExperienceID,
                                  Supervisor: {
                                      Id: searchResults[stIndex].getValue(arrColumns[3]),
                                      BACBID: searchResults[stIndex].getValue(arrColumns[0]),
                                      Name: searchResults[stIndex].getValue(arrColumns[1]) + " " + searchResults[stIndex].getValue(arrColumns[2])},
                                  IsPrimary: searchResults[stIndex].getValue(arrColumns[4])
                              });
      }
  }
  else if (searchResults !== null){
      arrSupervisions.push({  Id: searchResults.getId(),
                              ExpId: ExperienceID,
                              Supervisor: {
                                  Id: searchResults.getValue(arrColumns[3]),
                                  BACBID: searchResults.getValue(arrColumns[0]),
                                  Name: searchResults.getValue(arrColumns[1]) + " " + searchResults[stIndex].getValue(arrColumns[2])},
                              IsPrimary: searchResults.getValue(arrColumns[4])
      });
  }
  return arrSupervisions;
};

function _GetCustomer(BACBID) {
  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('entityid',null,'is', BACBID);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('firstname');
  arrColumns[1] = new nlobjSearchColumn('lastname');

  var searchResults = nlapiSearchRecord('customer',null, arrFilters, arrColumns);

  var objCustomer = { Id: searchResults[0].getId(),
                      Name: searchResults[0].getValue(arrColumns[0]) + " " + searchResults[0].getValue(arrColumns[1])
                      };
  return objCustomer;
};

function _WriteDocument(CustomerID, objDocument, RecordID){
  objDocument.setFolder(84146); // BACB Documents
  var stFileId = nlapiSubmitFile(objFile);

  var recDoc = nlapiCreateRecord('customrecord_documents');
  recDoc.setFieldValue('custrecord_doc_customer', CustomerID)
  recDoc.setFieldValue('custrecord_doc_type', "1"); // Need to match Document Type list
  recDoc.setFieldValue('custrecord_doc_attestation', RecordID);
  recDoc.setFieldValue('custrecord_doc_file', stFileId);
  recDoc.setFieldValue('custrecord_doc_version', "1");
  recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));

  return nlapiSubmitRecord(recDoc, true, true);
};

function _UpdateDocument(CustomerID, objDocument, RecordID, DocumentID) {
  objDocument.setFolder(84146); // BACB Documents
  var stFileId = nlapiSubmitFile(objDocument);

  var recDoc = nlapiLoadRecord('customrecord_documents',DocumentID);
  recDoc.setFieldValue('custrecord_doc_customer', CustomerID)
  recDoc.setFieldValue('custrecord_doc_type', "2"); // need to match Document Types list
  recDoc.setFieldValue('custrecord_doc_attestation', RecordID);
  recDoc.setFieldValue('custrecord_doc_file', stFileId);
  recDoc.setFieldValue('custrecord_doc_version', parseInt(recDoc.getFieldValues('custrecord_doc_version'),10) + 1);
  recDoc.setFieldValue('custrecord_doc_date_uploaded', nlapiDateToString(new Date(),'date'));

  return nlapiSubmitRecord(recDoc, true, true);
};

// This function is most likely a duplicate of the one in Utility.ss (Utility.ss should be the one used).
function _GetType(objRequest) {
  nlapiLogExecution('AUDIT','GetType Experience', '=====START=====');
  var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'GetType Experience', 'GETTYPE function in Experience executed.');

  var objDataResponse = {
      Types: []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('Name');
  arrColumns[1] = new nlobjSearchColumn('Multiplier');

  var searchResults = nlapiSearchRecord('customrecord_exp_type',null, null, arrColumns);
  if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
          objDataResponse.Types.push({ Id: searchResults[stIndex].getId(),
                                       Name: searchResults[stIndex].getFieldValue(arrColumns[0]),
                                       Multiplier: searchResults[stIndex].getFieldValue(arrColumns[1])
                                      });
      }
  }
  else if (searchResults !== null){
      objDataResponse.Types.push({ Id: searchResults.getId(),
                                   Name: searchResults.getFieldValue(arrColumns[0]),
                                   Multiplier: searchResults.getFieldValue(arrColumns[1])
                                  });
  }

  nlapiLogExecution('AUDIT','GetType Experience', '======END======');
  return (JSON.stringify(objDataResponse));
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
