

var ACTIONS = {
  CreateActionItem: _CreateActionItem,
  ReadActionItem: _ReadActionItem,
  UpdateActionItem: _UpdateActionItem,
  DeleteActionItem: _DeleteActionItem
}

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

function _CreateActionItem(objRequest, objResponse){
  var ssAndFnName = 'ActionItem.ss CreateActionItem';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
  // try {
  //   var objSession = nlapiGetWebContainer().getShoppingSession();
  //   var stCustId = objSession.getCustomer().getFieldValues().internalid;
  // } catch (ex) {
  //   nlapiLogExecution("ERROR", ssAndFnName, "The call to get the current web session failed.:" + ex.message);
  // }
  // // Kill this on read
  // var objDataResponse = {'Response': 'F','Message': '', 'ReturnId': 'default'}
  // var stBody = objRequest.getBody();
  // if (stBody) {
  //   var httpBody = JSON.parse(stBody);
  // } else {
  //   nlapiLogExecution("ERROR", ssAndFnName, "Body of the request is not defined.");
  // }


  nlapiLogExecution("AUDIT", ssAndFnName, "=====END=====");
}

// Probably going to read based on current cert cycle.
function _ReadActionItem(objRequest){
  var ssAndFnName = 'ActionItem.ss ReadActionItem';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  // Kill this on read
  var objDataResponse = {
    "Array": []
  };
  //{'Response': 'F','Message': '', 'ReturnId': 'default'}

  var httpBody = objRequest;

  var actionItemFilters = [];
  var actionItemColumns = [];
  actionItemFilters[0] = new nlobjSearchFilter('custrecord_action_item_cert_cycle', null, 'is', httpBody.CertificationCycleId);
  actionItemColumns[0] = new nlobjSearchColumn('custrecord_action_item_abstract');
  actionItemColumns[1] = new nlobjSearchColumn('custrecord_action_item_custom_text');
  actionItemColumns[2] = new nlobjSearchColumn('custrecord_action_item_due_date');
  actionItemColumns[3] = new nlobjSearchColumn('custrecord_action_item_document_required');
  actionItemColumns[4] = new nlobjSearchColumn('custrecord_action_item_date_submitted');
  actionItemColumns[5] = new nlobjSearchColumn('custrecord_action_item_status');
  actionItemColumns[6] = new nlobjSearchColumn('custrecord_action_item_source');
  actionItemColumns[7] = new nlobjSearchColumn('custrecord_action_item_type');
  actionItemColumns[8] = new nlobjSearchColumn('custrecord_action_item_cert_cycle');
  try{
    var searchResults = nlapiSearchRecord('customrecord_action_item', null, actionItemFilters, actionItemColumns);
    if(! searchResults instanceof Array){
      searchResults = [searchResults];
    }
    for(index in searchResults){
      var statusFilter = new nlobjSearchFilter('internalid', null, 'is', searchResults[index].getValue(actionItemColumns[5]));
      var statusColumn = new nlobjSearchColumn('custrecord_entity_status_ext_name');
      var statusSearch = nlapiSearchRecord('customrecord_entity_status', null, statusFilter, statusColumn);
      if(!statusSearch instanceof Array){
        statusSearch = [statusSearch];
      }
      objDataResponse.Array.push({
        'Id': searchResults[index].getId(),
        'Abstract' : searchResults[index].getValue(actionItemColumns[0]),
        'CustomText' : searchResults[index].getValue(actionItemColumns[1]),
        'DueDate' : searchResults[index].getValue(actionItemColumns[2]),
        'DocumentRequired' : searchResults[index].getValue(actionItemColumns[3]),
        'DateSubmitted' : searchResults[index].getValue(actionItemColumns[4]),
         'Status' : {
           'Id': searchResults[index].getValue(actionItemColumns[5]),
           'Value': statusSearch[0].getValue(statusColumn),
         },
        'Source' : {
          'Id': searchResults[index].getValue(actionItemColumns[6]),
          'Value':searchResults[index].getText(actionItemColumns[6]),
        },
        'Type' : {
          'Id' : searchResults[index].getValue(actionItemColumns[7]),
          'Value': searchResults[index].getText(actionItemColumns[7])},
        'CertificationCycleId' : searchResults[index].getValue(actionItemColumns[8]),
      });
    }
  }catch(ex){
    nlapiLogExecution('ERROR', ssAndFnName, 'Search for action item failed'+ ex) ;
  }
  nlapiLogExecution("AUDIT", ssAndFnName, "=====END=====");
	return (JSON.stringify(objDataResponse));
}

function _UpdateActionItem(objRequest){
  var ssAndFnName = 'ActionItem.ss UpdateActionItem';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  try {
    var record = nlapiLoadRecord('customrecord_action_item', httpBody.Id);
    try {
      record.setFieldValue('custrecord_action_item_abstract', httpBody.Abstract);
      record.setFieldValue('custrecord_action_item_due_date', httpBody.DueDate);
      record.setFieldValue('custrecord_action_item_document_required', httpBody.DocumentRequired);
      record.setFieldValue('custrecord_action_item_date_submitted', httpBody.DateSubmitted);
      record.setFieldValue('custrecord_action_item_status', httpBody.Status.Id);
      record.setFieldValue('custrecord_action_item_cert_cycle', httpBody.CertificationCycleId);
      record.setFieldValue('custrecord_action_item_source', httpBody.Source.Id);
      record.setFieldValue('custrecord_action_item_type', httpBody.Type.Id);
      record.setFieldValue('custrecord_action_item_custom_text', httpBody.CustomText);
      try {
        objDataResponse.ReturnId = nlapiSubmitRecord(record, true);
        objDataResponse.Message = "Record Successfully updated";
        objDataResponse.Response = "T";
      }
      catch(ex){
        nlapiLogExecution("ERROR", ssAndFnName, "Record load & field values set sucessfully, but failed to submit record:" + ex.message);
      }

    } catch(ex){
      nlapiLogExecution("ERROR", ssAndFnName, "Record load was successful, but failed to set field values:" + ex.message);
    }

  } catch(ex) {
    nlapiLogExecution("ERROR", ssAndFnName, "record load FAILED:" + ex.message);
  }

  nlapiLogExecution("AUDIT", ssAndFnName, "=====END=====");
  return (JSON.stringify(objDataResponse));
}

function _DeleteActionItem(objRequest){
  var ssAndFnName = 'ActionItem.ss DeleteActionItem';
  nlapiLogExecution('AUDIT', ssAndFnName, '=====START=====');
  // var stCustId = objRequest['CustomerId'];
  var httpBody = objRequest;
  nlapiLogExecution("AUDIT", ssAndFnName, "=====END=====");
  return 'not implemented'
}
