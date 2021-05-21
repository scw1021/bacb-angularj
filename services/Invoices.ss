var ACTIONS = {
    Read: _Read,
    Create: _Create
};

function service(objRequest, objResponse) {

	var stParam = objRequest.getParameter('param');

	if (ACTIONS[stParam]) {
		ACTIONS[stParam](objRequest, objResponse);
	}

};

function _Create(objRequest, objResponse) {
	E$.logAudit('CREATE Invoice', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
        // var stCustId = '13';
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Invoices executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
    }
    nlapiLogExecution('AUDIT', 'CREATE Request', JSON.stringify(objRxData));
    var IncomingData = {
        CertId: '',
        DoctoralDesignation: '',
        FeeType: '',
    }

	var objDataResponse = {
        Invoice: {
            Id: '',
            Amount: ''
        }
    };

    if (stCustId) {
        // Find pending fee
        var arrFilters = new Array();
        arrFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
        arrFilters[1] = new nlobjSearchFilter('custitem_non_inventory_cert_type', null, 'is', objRxData.CertType);
        arrFilters[2] = new nlobjSearchFilter('custitem_non_inventory_doctoral',null,'is',objRxData.DoctoralDesignation);
        arrFilters[3] = new nlobjSearchFilter('custitem_non_inventory_type',null,'is',objRxData.FeeType);
        // arrFilters[4] = new nlobjSearchFilter('custitem_non_inventory_start_date', null, 'greaterthanorequalto', nlapiDateToString(new Date()))

        var arrColumns = new Array();
        arrColumns[0] = new nlobjSearchColumn('price');
        arrColumns[1] = new nlobjSearchColumn('name');

        try {
            var searchResults = nlapiSearchRecord('noninventoryitem',null, arrFilters, arrColumns);
        }
        catch (ex) {
            nlapiLogExecution('ERROR', 'QUERY_FAILED', 'The attempt to query the noninventory items failed.:' + ex.message);
        };
        var stFeeId = '';
        nlapiLogExecution('AUDIT', 'ITEMS_QUERIED', 'Passed the query for noninventory items.');
        nlapiLogExecution('AUDIT', 'Results', JSON.stringify(searchResults));
        if ( searchResults !== null  && searchResults != "" ) {
          if (! (searchResults instanceof Array)){
            searchResults = [searchResults];
          }
          if ( searchResults[0] ) {
            // There must be a better way to get the correct result.
            // for ( var stIndex in searchResults ) {
              stFeeId = searchResults[0].getId();
              searchResult = searchResults[0];
            // }
          }
        }
        else {
            throw nlapiCreateError('INVALID_DATA', 'No non-inventory Fee found.')
        }
        // check Address for Country
        try {
        var MyAddress = _ViewAddress(stCustId, "Shipping");
        }
        catch (ex) {
            throw nlapiCreateError('QUERY_FAILED', 'Address query failed: ' + ex.message);
        }

        nlapiLogExecution('AUDIT', 'ITEM_FOUND', 'The item id found was: ' + stFeeId);
        // Search Discount for country code
        // var arrFilters = new Array();
        // arrFilters[0] = new nlobjSearchFilter('custrecord_country_disabled', null,'is','F');
        // arrFilters[1] = new nlobjSearchFilter('custrecord_country_enumeration', null,'is', MyAddress.Country.Id);

        // var arrColumns = new Array();
        // arrColumns[0] = new nlobjSearchColumn('custrecord_country_name');
        // arrColumns[1] = new nlobjSearchColumn('custrecord_country_code');
        // arrColumns[2] = new nlobjSearchColumn('custrecord_country_enumeration');
        // arrColumns[3] = new nlobjSearchColumn('custrecord_country_discount');
        // var searchResults = nlapiSearchRecord('customrecord_countries', null, arrFilters, arrColumns);

        // var stDiscountId = '';
        // if (searchResults instanceof Array && searchResults.length) {
        //     for (var stIndex in searchResults) {
        //         stDiscountId = searchResults[stIndex].getValue(arrColumns[5]);
        //     }
        // }
        // else if (searchResults !== null) {
        //     stDiscountId = searchResults.getValue(arrColumns[5]);
        // }
// TODO: Define more fields to complete invoice
//       as defined after testing
        //recNewInvoice.setFieldValue('itemlist', stFeeId);
        //recNewInvoice.setFieldValue('discount', stDiscountId);
        //recNewInvoice.setFieldValue('customform', '104');

        var recNewInvoice = nlapiCreateRecord('invoice',{recordmode:'dynamic'});

        recNewInvoice.setFieldValue('entity', stCustId);
        // recNewInvoice.setFieldValue('class', 3);

        recNewInvoice.selectNewLineItem('item');
        recNewInvoice.setCurrentLineItemValue('item','item', stFeeId);
        recNewInvoice.setCurrentLineItemValue('item', 'memo', objRxData.CertType);
        recNewInvoice.setCurrentLineItemValue('item','quantity',1);
        recNewInvoice.commitLineItem('item');
        // recNewInvoice.commit();

        //var Id = nlapiSubmitRecord(recNewInvoice);
        //recNewInvoice.setFieldValue('subsidiary','');
        //recNewInvoice.setFieldValue('total', '245.00');
        //recNewInvoice.setFieldValue('account', '121');


        // Add Item to invoice
        //_AddItem(recNewInvoice, stFeeId);
        // if (stDiscountId) {
           // _AddItem(recNewInvoice, stDiscountId);
        // }
        try {
            objDataResponse.Invoice.Id = nlapiSubmitRecord(recNewInvoice);
            objDataResponse.Invoice.Amount = searchResult.columns.price;
        }
        catch (ex) {
            throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord for invoice failed.' + ex.message);
        }

        // Edit application with Invoice ID
        var recApplication = nlapiLoadRecord('customrecord_applications',objRxData.AppId);

        recApplication.setFieldValue('custrecord_invoice',objDataResponse.Invoice.Id);
        try {
            nlapiSubmitRecord(recApplication, true);
        }
        catch (ex) {
            throw nlapiCreateError('WRITE_FAILED','nlapiSubmitRecord for application failed.' + ex.message);
        }
    }
    else {
        nlapiLogExecution('ERROR', 'UNDEFINED_CUSTOMER', 'The Customer ID value was not defined.');
    };

    E$.logAudit('CREATE Invoice', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _Read(objRequest, objResponse) {
  E$.logAudit('Read Invoice', '=====START=====');
  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
    // var stCustId = '17';
  }
  catch (ex) {
    nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
  }
  objDataResponse = {
    Response: 'F',
    Invoices: []
  }

  var arrFilters = [];
  arrFilters[0] = new nlobjSearchFilter('entity',null,'is', stCustId);
  arrFilters[1] = new nlobjSearchFilter('amountremaining',null,'greaterthan','0');

  // var arrColumns = new Array();
  // arrColumns[0] = new nlobjSearchColumn('status');
  // arrColumns[1] = new nlobjSearchColumn('item');
  // arrColumns[2] = new nlobjSearchColumn('saleseffectivedate');
  // arrColumns[3] = new nlobjSearchColumn('amountRemaining');

  // Just get all unpaid invoices
  var searchResults = nlapiSearchRecord('invoice', null, arrFilters, null);

  if ( searchResults instanceof Array && searchResults.length ) {
    objDataResponse.Response = 'T';
    searchResults.forEach( function (_value) {
      var result = nlapiLoadRecord('invoice', _value.id);
      objDataResponse.Invoices.push(result)
    })
  }
  E$.logAudit('Read Invoice', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};

function _AddItem(recInvoice, ItemID){
    recInvoice.selectNewLineItem('item');
    recInvoice.setCurrentLineItemValue('item','item',ItemID);
    recInvoice.setCurrentLineItemValue('item','quantity',1);
    recInvoice.commitLineItem('item', false);

    //recInvoice.setCurrentLineItemValue('item', 'isbillable', 'T');
    // var recItem = recInvoice.createCurrentLineItemSubrecord('item', 'itemlist');
    // recItem.setFieldValue('item', ItemID);
    // recItem.setFieldValue('quantity', 1);
    // recItem.commit();
    // recInvoice.commitLineItem('item', false);
};

//recInvoice.setCurrentLineItemValue('item','groupsetup', 'T'); // Specify this is a group item
    //recInvoice.setCurrentLineItemValue('item','itemtype','Group'); // Specify this is a group item

function _FindAddressIndex(recCustomer, AddressType) {
    for (var stCount=(recCustomer.getLineItemCount('addressbook')-1); stCount >= 0; stCount--) {
        if (AddressType == "Shipping" && recCustomer.getLineItemValue('addressbook', 'is_default_ship_address', stCount) == 'T') {
            return stCount;
        }
        if (AddressType == "Billing" && recCustomer.getLineItemValue('addressbook', 'is_default_bill_address', stCount) == 'T') {
            return stCount;
        }
    }
    return null;
};

function _ViewAddress(recCustomer, AddressType, iAddressIndex) {
    var objAddress = {
        Index: '',
        Address1: '',
        Address2: '',
        City: '',
        State: {'Id': '', 'Value': ''},
        Country: {'Id': '', 'Value': ''},
        PostalCode: '',
        IsShipping: 'F',
        IsBilling: 'F'
    };
    if (iAddressIndex === 0){
        iAddressIndex = _FindAddressIndex(recCustomer, AddressType);
    }
    if (iAddressIndex != null) {
        recCustomer.selectLineItem('addressbook', iAddressIndex);
        var recAddress = recCustomer.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
        if (stAddIndex) {
            objAddress = {
                Index: iAddressIndex,
                Address1: recAddress.getFieldValue('addr1'),
                Address2: recAddress.getFieldValue('addr2'),
                City: recAddress.getFieldValue('city'),
                State: {'Id': recAddress.getFieldValue('statedropdown'), 'Value': recAddress.getFieldText('statedropdown')},
                Country: {'Id': recAddress.getFieldValue('country'), 'Value': recAddress.getFieldText('country')},
                PostalCode: recAddress.getFieldValue('zip'),
                IsShipping: recAddress.getFieldValue('is_default_ship_address'),
                IsBilling: recAddress.getFieldValue('is_default_bill_address'),

            }
        }
    }
    return objAddress;
};
