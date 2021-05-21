var ACTIONS = {
    Read: _Read
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');
  
	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}
  
};

function _Read(objRequest, objResponse) {
    E$.logAudit('READ Questions', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in Questions executed.');
    
    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
    }

    var objDataResponse = {
        Questions: []
    }
    
    if (objRxData.AppId) {
        // Find the type of application
        var arrAppFilters = [];
        arrAppFilters[0] = new nlobjSearchFilter('internalid',null,'is',objRxData.AppId);

        var arrAppColumns = [];
        arrAppColumns[0] = new nlobjSearchColumn('custrecord_exam_app_type');

        var searchAppResults = nlapiSearchRecord('customrecord_applications', null, arrAppFilters, arrAppColumns);

        // Find the questions using section if provided
        var arrFilters = [];
            arrFilters[0] = new nlobjSearchFilter('custrecord_att_questions_app_type', null, 'is', searchAppResults[0].getValue(arrAppColumns[0]));
            if (objRxData.SectionId) {
                arrFilters[0] = new nlobjSearchFilter('custrecord_att_questions_section', null, 'is', objRxData.SectionId);
            }

        if (objRxData.SectionId) {
            arrFilters[1] = new nlobjSearchFilter('custrecord_att_questions_section', null,'is',objRxData.SectionId);
        }

        var arrColumns = new Array();
        arrColumns[0] = new nlobjSearchColumn('custrecord_att_questions_section').setSort(false);
        arrColumns[1] = new nlobjSearchColumn('custrecord_att_questions_number').setSort(false);
        arrColumns[2] = new nlobjSearchColumn('custrecord_att_questions_text');
        arrColumns[3] = new nlobjSearchColumn('custrecord_att_questions_full_text')

        var searchResults = nlapiSearchRecord('customrecord_attestation_questions',null, arrFilters, arrColumns);

        if (searchResults instanceof Array && searchResults.length) {
            for (var stIndex in searchResults) {
                objDataResponse.Questions.push({Id: searchResults[stIndex].getId(),
                                                SectionName: searchResults[stIndex].getText(arrColumns[0]),
                                                SectionId: searchResults[stIndex].getValue(arrColumns[0]),
                                                Number: searchResults[stIndex].getValue(arrColumns[1]),
                                                Text: searchResults[stIndex].getValue(arrColumns[2]),
                                                FullText: searchResults[stIndex].getValue(arrColumns[3])
                                                });
            }
        }
        else if (searchResults !== null){
            objDataResponse.Questions.push({Id: searchResults[stIndex].getId(),
                                            SectionName: searchResults.getText(arrColumns[0]),
                                            SectionId: searchResults.getValue(arrColumns[0]),
                                            Number: searchResults.getValue(arrColumns[1]),
                                            Text: searchResults.getValue(arrColumns[2]),
                                            FullText: searchResults.getValue(arrColumns[3])
                });
        }
    }
    else {
        throw nlapiCreateError('INVALID_DATA', 'The application ID was not defined.')
    }
    
    E$.logAudit('READ Questions', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};