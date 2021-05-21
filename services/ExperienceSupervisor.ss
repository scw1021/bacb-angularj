var ACTIONS = {
    Create: _Create,
    Delete: _Delete,
    Find: _Find
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');
  
	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}
  
};

function _Create(objRequest, objResponse) {
    E$.logAudit('Create ExperienceSupervisor', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Create ExperienceSupervisor', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Create ExperienceSupervisor', 'CREATE function in ExperienceSupervisor executed.');
    
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Create ExperienceSupervisor', 'Body of the request is not defined.');
    }

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

    E$.logAudit('CREATE ExperienceSupervisor', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Delete(objRequest, objResponse) {
    E$.logAudit('Delete ExperienceSupervisor', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Delete ExperienceSupervisor', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Delete ExperienceSupervisor', 'DELETE function in ExperienceSupervisor executed.');
    
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Delete ExperienceSupervisor', 'Body of the request is not defined.');
    }

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

    E$.logAudit('DELETE ExperienceSupervisor', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Find(objRequest, objResponse) {
    E$.logAudit('Find ExperienceSupervisor', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Find ExperienceSupervisor', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'Find ExperienceSupervisor', 'FIND function in ExperienceSupervisor executed.');
    
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'Find ExperienceSupervisor', 'Body of the request is not defined.');
    }

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

    E$.logAudit('Find ExperienceSupervisor', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
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