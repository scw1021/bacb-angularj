
// Result.Success
// Result.Transaction.processorSettlementResponseCode
// Result.Transaction.processorSettlementResponseText
// Result.Transaction.amount
// Result.Transaction.status // possible duplicate with processorSettlementResponseText
// Result.Transaction.cardType
// Result.Transaction.paymentInstrumentName // show user
// Result.Transaction.id
// Result.Transaction.paymentInstrumentType


// Result.Transaction.paymentInstrumentType
// "android_pay_card"
// "apple_pay_card"
// "credit_card"
// "masterpass_card"
// "paypal_account"
// "samsung_pay_card"
// "venmo_account"
// "visa_checkout_card"
// Result.Transaction.cardType
// "American Express"
// "Discover"
// "JCB"
// "Maestro"
// "MasterCard"
// "Visa"

var ACTIONS = {
  Create: _Create,
  Read: _Read,
  GetToken: _GetToken,
};

function service(objRequest, objResponse) {
  var stParam = objRequest.getParameter("param");

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }
}

function _Create(objRequest, objResponse) {
	E$.logAudit('CREATE Payment', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'CREATE_CALLED', 'CREATE function in Payment executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
    }

	var objDataResponse = {
        Payment: {
            Id: '',
            Number: ''
        }
	};

    E$.logDebug('createPay', 'objRxData.total: ' + objRxData.total);
    var PaymentMethod = 0;
    switch (objRxData.Transaction.paymentInstrumentType) {
        case "credit_card":
            switch (objRxData.Transaction.cardType) {
                case "American Express":
                    PaymentMethod = 6;
                    break;
                case "Visa":
                    PaymentMethod = 5;
                    break;
                case "Master Card":
                    PaymentMethod = 4;
                    break;
                case "Discover":
                    PaymentMethod = 3;
                    break;
                case "Carte Blanche":
                    PaymentMethod = 14;
                    break;
                case "China UnionPay":
                    PaymentMethod = 15;
                    break;
                case "Elo":
                    PaymentMethod = 16;
                    break;
                case "JCB":
                    PaymentMethod = 17;
                    break;
                case "Laser":
                    PaymentMethod = 18;
                    break;
                case "Maestro":
                    PaymentMethod = 19;
                    break;
                case "Solo":
                    PaymentMethod = 20;
                    break;
                case "Switch":
                    PaymentMethod = 21;
                    break;
            }
            break;
        case "paypal_account":
            PaymentMethod = 7;
            break;
        case "android_pay_card":
            PaymentMethod = 8;
            break;
        case "apple_pay_card":
            PaymentMethod = 9;
            break;
        case "masterpass_card":
            PaymentMethod = 10;
            break;
        case "samsung_pay_card":
            PaymentMethod = 11;
            break;
        case "venmo_account":
            PaymentMethod = 12;
            break;
        case "visa_checkout_card":
            PaymentMethod = 13;
            break;
    }

    var stPaymentAmount = objRxData.total.toFixed(2);
    var recPayment = nlapiCreateRecord('customerpayment', {recordmode: 'dynamic'});
    recPayment.setFieldValue('customer', stCustId);
    recPayment.setFieldValue('paymentmethod', PaymentMethod);
    recPayment.setFieldValue('payment', stPaymentAmount);
    recPayment.setFieldValue('autoapply', 'F');
    var stPaymentId = nlapiSubmitRecord(recPayment, true, true);
    objDataResponse.data.payment.id = stPaymentId;
    objDataResponse.data.payment.number = nlapiLookupField('customerpayment', stPayId, 'tranid');

    // now that the payment is created the invoices should be attached as the apply sublist
    recPayment = nlapiLoadRecord('customerpayment',stPaymentId)
    E$.logDebug('createPay', 'objRxData.invoices.length: ' + objRxData.invoices.length);
    var arrInvoices = [];
    for (var stIndex=0; stIndex < objRxData.invoices.length; stIndex++) {
        arrInvoices[objRxData.invoices[stIndex].id] = { Id: objRxData.invoices[stIndex].id,
                                                        Amount: objRxData.invoices[stIndex].amountRemain
                                                      };
    }
    if (!arrInvoices.length) {
        objDataResponse.hasError = true;
        objDataResponse.message = 'Payment invoice missing.';
    }
    else {
        var stInvoiceCount = recPayment.getLineItemCount('apply');
        for (var stInvoiceIndex=1; stInvoiceIndex <= stInvoiceCount; stInvoiceIndex++) {
            var stInvoiceId = recPayment.getLineItemValue('apply', 'internalid', stInvoiceIndex);
            var stAmount = recPayment.getLineItemValue('apply','amount', stInvoiceIndex);
            if (arrInvoices[stInvoiceId].Id) {
                recPayment.selectLineItem('apply', stInvoiceIndex);
                recPayment.setCurrentLineItemValue('apply', 'apply', 'T');
                // handle larger or smaller payment amounts
                if (stPaymentAmount < stAmount) {
                    stPartialPaymentAmount = stPaymentAmount;
                }
                stPaymentAmount -= stPartialPaymentAmount ? stPartialPaymentAmount : stAmount;
                recPayment.setCurrentLineItemValue('apply', 'amount', stPartialPaymentAmount ? stPartialPaymentAmount :stAmount);
                recPayment.commitLineItem('apply');
                stInvoiceFound += 1;
            }
        }
    }

	E$.logAudit('createPay', '======END======');
	objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
}

function getInvoice(objRequest, objResponse) {
    E$.logAudit('READ Invoices', '=====START=====');

    try {
        var objSession = nlapiGetWebContainer().getShoppingSession();
        var stCustId = objSession.getCustomer().getFieldValues().internalid;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'SESSION_INVALID', 'The call to get the current web session failed.:' + ex.message)
    }
    nlapiLogExecution('AUDIT', 'READ_CALLED', 'READ function in Invoices executed.');

    var stBody = objRequest.getBody();
	if (stBody) {
        objRxData = JSON.parse(stBody);
    }
    else {
        nlapiLogExecution('ERROR', 'INVALID_BODY', 'Body of the request is not defined.');
    }

    var objDataResponse = {
        Invoice: {}
    };

    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter('entity',null,'is', stCustId);
    arrFilters[1] = new nlobjSearchFilter('amountremaining',null,'greaterthan','0');

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn('amountremaining');
    arrColumns[1] = new nlobjSearchColumn('balance');

    var searchResults = nlapiSearchRecord('invoice',null, arrFilters, arrColumns);

    if (searchResults instanceof Array && searchResults.length) {
        for (var stIndex in searchResults) {
            objDataResponse.Invoices.push({ Id: searchResults[stIndex].getId(),
                                            Amount: searchResults[stIndex].getValue(arrColumns[0]),
                                            Balance: searchResults[stIndex].getValue(arrColumns[1])
                                          });
        }
    }

    E$.logAudit('getInvoice', '======END======');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
}

function _Read(objRequest, objResponse) {
    E$.logAudit('getPayment', '=====START=====');

    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;

    var objPayRx = {};
    var stBody = objRequest.getBody();
    E$.logDebug('getPayment', 'stBody: ' + stBody);
    if (stBody) {
        objPayRx = JSON.parse(stBody);
    }

    var objDataResponse = {
        hasError: false,
        message: '',
        data: {
            isLoggedIn: true,
            user: objSession.getCustomer(),
            payment: {}
        }
    };

    if (objPayRx.payid) {
        var recPay = nlapiLoadRecord('customerpayment', objPayRx.payid);

        var objRxData = {
            id: objPayRx.payid,
            number: recPay.getFieldValue('transactionnumber'),
            invoice: [],
            date: recPay.getFieldValue('trandate'),
            amount: recPay.getFieldValue('total'),
            method: recPay.getFieldText('paymentmethod'),
            ccnumber: recPay.getFieldValue('ccnumber'),
            ccexpiredate: recPay.getFieldValue('ccexpiredate'),
            ccname: recPay.getFieldValue('ccname'),
            checknum: recPay.getFieldValue('checknum')
        };

        var iInvCnt = recPay.getLineItemCount('apply');
        for (var iL=1; iL <= iInvCnt; iL++) {
            if (recPay.getLineItemValue('apply', 'apply', iL) == 'T') {
                objRxData.invoice.push({
                    id: recPay.getLineItemValue('apply', 'internalid', iL),
                    number: recPay.getLineItemValue('apply', 'refnum', iL),
                    amount: recPay.getLineItemValue('apply', 'amount', iL)
                });
            }
        }

        objDataResponse.data.payment = objRxData;
    }

    E$.logAudit('getPayment', '======END======');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
}

function _GetToken(objRequest, objResponse) {
  E$.logAudit('getPaymentToken', '=====START=====');

    var stCustId = nlapiGetContext().getUser();

    var objPayRx = {};
    var stBody = objRequest.getBody();
    E$.logDebug('getPaymentToken', 'stBody: ' + stBody);
    if (stBody) {
        objPayRx = JSON.parse(stBody);
    }

    objResponse = {
      Response: 'T',
      Message: '{token: "sandbox_4x8wybmx_5vsr6bz3bmm6zpgs"}'
    }


    E$.logAudit('getPaymentToken', '======END======');
    objResponse.setContentType('PLAINTEXT');
    objResponse.write(JSON.stringify(objDataResponse));
}
