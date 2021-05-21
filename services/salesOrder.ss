        
function service(objRequest, objResponse) {
    
    var objDataResponse = {
        SalesOrder: {
            Id: ''
        }
    };

    var recSalesOrder = nlapiCreateRecord('invoice');
    
    recSalesOrder.setFieldValue('entity', 13);
    recSalesOrder.setFieldValue('class', 3);

    recSalesOrder.selectNewLineItem('item');
    recSalesOrder.setCurrentLineItemValue('item','item', 110);
    recSalesOrder.setCurrentLineItemValue('item','quantity',1);
    //recSalesOrder.setCurrentLineItemValue('item','location',1);
    //recSalesOrder.setCurrentLineItemValue('item','amount','245.00');
    recSalesOrder.commitLineItem('item');

    //nlapiLogExecution('AUDIT', 'INVOICE_DETAILS', 'Invoice Details: ' + recSalesOrder);

    var Id = nlapiSubmitRecord(recSalesOrder);

    objResponse.setContentType('PLAINTEXT');
	objResponse.write(JSON.stringify(objDataResponse));
};