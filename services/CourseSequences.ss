var ACTIONS = {
    Create: _Create,
    Delete: _Delete,
    Read: _Read,
    Update: _Update
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');
  
	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}
  
};

function _Create(objRequest, objResponse) {
    E$.logAudit('CREATE CourseSequences', '=====START=====');

    E$.logAudit('CREATE CourseSequences', '======END======');
};

function _Delete(objRequest, objResponse) {
    E$.logAudit('DELETE CourseSequences', '=====START=====');

    E$.logAudit('DELETE CourseSequences', '======END======');
};

function _Read (objRequest, objResponse) {
    E$.logAudit('READ CourseSequences', '=====START=====');

   try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'READ CourseSequences', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'READ CourseSequences', 'READ function in CourseSequences executed.');
    
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'READ CourseSequences', 'Body of the request is not defined.');
    }

    var objDataResponse = {
        Array: []
    }

    nlapiLogExecution('AUDIT', 'READ CourseSequences', 'Institution ID passed in is: ' + objRxData.Id);

    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('custrecord_rc_depart_institution','custrecord_rc_reg_course_department','is', objRxData.Id);

    var arrColumns = [];
    arrColumns[0] = new nlobjSearchColumn('custrecord_rec_depart_name','custrecord_rc_reg_course_department');
    arrColumns[1] = new nlobjSearchColumn('custrecord_rec_depart_name','custrecord_rc_reg_course_department');

    var searchResults = nlapiSearchRecord('customrecord_rc_registered_courses', null, arrFilters, null);


    var searchResults = nlapiSearchRecord('customrecord_rc_department', null, arrFilters, null);

    nlapiLogExecution('AUDIT', 'READ CourseSequences', 'isArray value is: ' + Array.isArray(searchResults));
    
    if (searchResults instanceof Array && searchResults.length) {
        nlapiLogExecution('AUDIT', 'READ CourseSequences', 'Array length is: ' + searchResults.length);
        for (var stIndex in searchResults) {
            objDataResponse.Array.push({'Id': searchResults[stIndex].getId(),
										'Name': searchResults[stIndex].getValue(arrColumns[0]) });
        }
    }
    else if (searchResults !== null){
            objDataResponse.Array.push({'Id': searchResults.getId(),
										'Name': searchResults[stIndex].getValue(arrColumns[0])});
    }

    E$.logAudit('READ CourseSequences', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Update(objRequest, objResponse) {
    E$.logAudit('UPDATE CourseSequences', '=====START=====');

    E$.logAudit('UPDATE CourseSequences', '======END======');
};