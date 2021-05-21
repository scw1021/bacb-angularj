var ES_ACTIONS = {
  Read: _Read
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

function _Read(objRequest) {
  nlapiLogExecution('AUDIT','READ News', '=====START=====');

  var objDataResponse = {
      Array: []
    };

  // NewsItem {
  //     Id: string
  //     Title: string
  //     Abstract: string
  //     FullText: string
  //     DatePosted: date
  //     DateExpired: date
  // }

  try {
      var arrFilters = [];
      arrFilters[0] = new nlobjSearchFilter('custrecord_news_date_expired',null,'after','today');

      var arrColumns = new Array();
      arrColumns[0] = new nlobjSearchColumn('custrecord_news_title');
      arrColumns[1] = new nlobjSearchColumn('custrecord_news_abstract');
      arrColumns[2] = new nlobjSearchColumn('custrecord_news_full_text');
      arrColumns[3] = new nlobjSearchColumn('custrecord_news_date_posted');
      arrColumns[4] = new nlobjSearchColumn('custrecord_news_date_expired');

  var NewsSearchResults = nlapiSearchRecord('customrecord_news',null, arrFilters, arrColumns);
  }
  catch (ex) {
      nlapiLogExecution('ERROR', 'SEARCH_FAILED', 'The search for news failed: ' + _parseError(ex));
  }

  if (NewsSearchResults instanceof Array && NewsSearchResults.length) {
      for (var stIndex in NewsSearchResults) {
          objDataResponse.Array.push({Id: NewsSearchResults[stIndex].getId(),
                                          Title: NewsSearchResults[stIndex].getValue(arrColumns[0]),
                                          Abstract: NewsSearchResults[stIndex].getValue(arrColumns[1]),
                                          FullText: NewsSearchResults[stIndex].getValue(arrColumns[2]),
                                          DatePosted: NewsSearchResults[stIndex].getValue(arrColumns[3]),
                                          DateExpired: NewsSearchResults[stIndex].getValue(arrColumns[4])
          });
      }
  }
  else if (typeof NewsSearchResults !== 'undefined'){
      objDataResponse.Array.push({Id: NewsSearchResults.getId(),
                                      Title: NewsSearchResults.getValue(arrColumns[0]),
                                      Abstract: NewsSearchResults.getValue(arrColumns[1]),
                                      FullText: NewsSearchResults.getValue(arrColumns[2]),
                                      DatePosted: NewsSearchResults.getValue(arrColumns[3]),
                                      DateExpired: NewsSearchResults.getValue(arrColumns[4])
      });
  }

  nlapiLogExecution('AUDIT','READ News', '======END======');
  return (JSON.stringify(objDataResponse));
}

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
