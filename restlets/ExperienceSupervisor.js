var ACTIONS = {
  Create: _Create,
  Delete: _Delete,
  Find: _Find
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
  nlapiLogExecution('AUDIT','Create ExperienceSupervisor', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Create ExperienceSupervisor', 'CREATE function in ExperienceSupervisor executed.');

  var objDataResponse = {
  'Response': 'F',
  'Message': ''

  }
/*data: {
          isLoggedIn: true,
          CustomerId: stCustId,
          AppId: objRxData.AppId,
          ExperienceId: objRxData.ExperienceId
      }*/
  if (objRxData.ExperienceId) {

      var recNewSupervision = nlapiCreateRecord('customrecord_experience_supervisor');

      recNewSupervision.setFieldValue('custrecord_experience_id', objRxData.ExperienceId);
      recNewSupervision.setFieldValue('custrecord_supervisor_id', objRxData.SupervisorCustId);
      recNewSupervision.setFieldValue('custrecord_primary_supervisor', objRxData.IsPrimary);

      objDataResponse.data.SupervisorId = nlapiSubmitRecord(recNewSupervision, true);
  }
  else {
      throw nlapiCreateError('Create ExperienceSupervisor', 'Credential ID is invalid.');
  }

  nlapiLogExecution('AUDIT','CREATE ExperienceSupervisor', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Delete(objRequest) {
  nlapiLogExecution('AUDIT','Delete ExperienceSupervisor', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Delete ExperienceSupervisor', 'DELETE function in ExperienceSupervisor executed.');

  var objDataResponse = {
  'Response': 'F',
  'Message': ''

  }
  if (objRxData.SupervisorId) {

      nlapiDeleteRecord('customrecord_experience_supervisor',objRxData.SupervisorId);

  }
  else {
      throw nlapiCreateError('Delete ExperienceSupervisor', 'Credential ID is invalid.');
  }

  nlapiLogExecution('AUDIT','DELETE ExperienceSupervisor', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _Find(objRequest) {
  nlapiLogExecution('AUDIT','Find ExperienceSupervisor', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'Find ExperienceSupervisor', 'FIND function in ExperienceSupervisor executed.');

  var objDataResponse = {
      Id: '',
      Name: ''
  }

  var CleanBACBID = '';
  var RegExBACB = /^bacb/i;
  var RegExZeros = /^[0]+/g;
  if (RegExBACB.test(objRxData.BACBID) || RegExZeros.test(objRxData.BACBID)) {
      CleanBACBID = objRxData.BACBID.replace(RegExBACB,"");
      CleanBACBID = CleanBACBID.replace(RegExZeros,"");
  }
  else {
      cleanBACBID = objRxData.BACBID;
  }

  while (CleanBACBID.length < 6) {
      CleanBACBID = '0' + CleanBACBID;
  }

  objDataResponse = _GetCustomer(CleanBACBID);

  nlapiLogExecution('AUDIT','Find ExperienceSupervisor', '======END======');
  return (JSON.stringify(objDataResponse));
};

function _GetCustomer(BACBID) {

  nlapiLogExecution('AUDIT', 'GetCustomer ExperienceSupervisor', 'GETCUSTOMER function in ExperienceSupervisor executed.' + BACBID);

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('entityid',null,'contains', BACBID);

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('firstname');
  arrColumns[1] = new nlobjSearchColumn('lastname');

  var searchResults = nlapiSearchRecord('customer','null', arrFilters, arrColumns);

  var objCustomer = {};
  if (searchResults){
      objCustomer = { Id: searchResults[0].getId(),
                      Name: searchResults[0].getValue(arrColumns[1]) + ", " + searchResults[0].getValue(arrColumns[0])
                    };
  }
  else {
      objCustomer = { Id: 0,
                      Name: 'Not Found'
                    };
  }
  return objCustomer;
};
