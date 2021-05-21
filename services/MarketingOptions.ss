var ACTIONS = {
  GetMarketingOptions: _GetMarketingOptions,
  GetUsersOptedInMarketingOptions: _GetUsersOptedInMarketingOptions,
  UpdateUserOptedInMarketingOptions: _UpdateUserOptedInMarketingOptions
};
// supporting functions below ACTIONS methods
function _GetMarketingOptions(objRequest, objResponse) {
  try {
    var ssAndFnName = 'MarketingOptions.ss GetMarketingOptions';
    nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
    var marketingOptions = getList('customlist_marketing_option_types');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(marketingOptions));
    nlapiLogExecution('AUDIT', ssAndFnName, '=====END======');
  } catch (ex) {
    nlapiLogExecution('AUDIT', ssAndFnName, ex);
  }
}


function _GetUsersOptedInMarketingOptions(objRequest, objResponse) {
  ssAndFnName = 'MarketingOptions.ss GetUsersOptedInMarketingOptions';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START======');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'The call to get the current web session failed.:' + ex.message)
  }
  try {
    var searchFilter = [];
    searchFilter[0] = new nlobjSearchFilter('custrecord_customer', null, 'is', stCustId);
    var searchResult = nlapiSearchRecord('customrecord_profile', null, searchFilter, null);
  } catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'Record search failed:' + ex);
  }
  try {
    var record = nlapiLoadRecord('customrecord_profile', searchResult[0].getId());
    var response = getMultiSelectValues(record, 'custrecord_marketing_option_types');
    var objDataResponse = {"Array": []};
    objDataResponse.Array = response
  } catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'Record load failed:' + ex);
  }

  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT', ssAndFnName, '=====END======');
}

/**
 * @description This method takes an array of IListObjects and updates the value of the field custrecord_marketing_option_types
 * to ONLY reflect items in the array passed into this method.  Values not passed in will be written over.
 * @example If user options 1,3,5 saved in netsuite, and this method recieves 2,4,5,
 * the new values saved in netsuite will be 2,4,5
 * @param objRequest HTTP body. Expected input: IListObject[]
 * @param objResponse
 */
function _UpdateUserOptedInMarketingOptions(objRequest, objResponse) {
  const ssAndFnName = 'MarketingOptions.ss UpdateUserOptedInMarketingOptions';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START======');

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  }
  catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'The call to get the current web session failed.:' + ex.message)
  }

  var objDataResponse = { "Array": [] }
  try {
    var requestedMarketingOptions = JSON.parse(objRequest.getBody()).Array;
    idArray = [];
    for (var index in requestedMarketingOptions) {
      idArray.push(requestedMarketingOptions[index].Id)
    }
  } catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'Http Body parse failed:' + ex.message)
  }


  try {
    var searchFilter = [];
    var searchColumn = [];
    var recordArray = [];
    searchFilter[0] = new nlobjSearchFilter('custrecord_customer', null, 'is', stCustId);
    searchColumn[0] = new nlobjSearchColumn('custrecord_marketing_option_types');
    var searchResults = nlapiSearchRecord('customrecord_profile', null, searchFilter, searchColumn);
    // Handling possibility of more than one record(with current implementation there should be one 2.20.20)
  } catch (ex) {
    nlapiLogExecution('ERROR', ssAndFnName, 'Record Searching and whatnot failed:' + ex.message);
  }
  if (searchResults) {
    if (!(searchResults instanceof Array)) {
      searchResults = [searchResults]
    }
    for (var resultIndex in searchResults) {
      recordArray.push(nlapiLoadRecord('customrecord_profile', searchResults[resultIndex].getId()))
    }

    // Setting field to reflect true for all items in id array and null(falsey null)
    try {
      for (var recordIndex in recordArray) {
        recordArray[recordIndex].setFieldValues('custrecord_marketing_option_types', idArray)
      }
    } catch (ex) {
      nlapiLogExecution('ERROR', ssAndFnName, 'Setting field values has FAILED:', ex)
    }
    // Should the loop be in the try, or the try in the loop??
    // Submit each record(again, currently should only really be one) and push returnId to response array
    try {
      for (var recordIndex in recordArray) {
        const returnId = nlapiSubmitRecord(recordArray[recordIndex])
        if (returnId) {
          objDataResponse.Array.push({ 'ReturnId': returnId, 'Message': 'Record updated successfully', 'Response': "T" });
        }
      }
    } catch (ex) {
      nlapiLogExecution('ERROR', ssAndFnName, 'Record submission has FAILED:', ex);
    }
  }
  objResponse.setContentType('PLAINTEXT');
  objResponse.write(JSON.stringify(objDataResponse));
  nlapiLogExecution('AUDIT', ssAndFnName, '=====END======');
}

function getMultiSelectValues(ProfileRecord, FieldID) {
  var ReturnValue = [];
  var ValueArray = ProfileRecord.getFieldValue(FieldID).split("\u0005");
  var TextArray = ProfileRecord.getFieldText(FieldID).split("\u0005");
  for (var stIndex in ValueArray) {
    ReturnValue.push({ 'Id': ValueArray[stIndex], 'Value': TextArray[stIndex] })
  }
  return ReturnValue;
}

function getList(listName) {
  var objDataResponse = {
    "Array": []
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn('internalId');
  arrColumns[1] = new nlobjSearchColumn('name');

  var searchResults = nlapiSearchRecord(listName, null, null, arrColumns);

  if (searchResults !== null) {
    if (!(searchResults instanceof Array)) {
      searchResults = [searchResults];
    }
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].getValue(arrColumns[0]),
        Value: searchResults[stIndex].getValue(arrColumns[1])
      });
    }
  }
  return objDataResponse;
}

function service(objRequest, objResponse) {

  var stParam = objRequest.getParameter('param');

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }

};

