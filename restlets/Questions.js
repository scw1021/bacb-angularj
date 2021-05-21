var ACTIONS = {
  Read: _Read
};

function service(objRequest) {
  objRequest = JSON.parse(objRequest);
  nlapiLogExecution('AUDIT', 'objRequest', JSON.stringify(objRequest));

	var stParam = objRequest['param'];
	if (ACTIONS[stParam]) {
		return ACTIONS[stParam](objRequest );
  }
  else {
    return "no param set"
  }
};

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ Questions', '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var objRxData = objRequest;
  nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in Questions executed.');

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

  nlapiLogExecution('AUDIT','READ Questions', '======END======');
  return (JSON.stringify(objDataResponse));
};
