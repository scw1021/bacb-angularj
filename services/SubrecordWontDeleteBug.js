

function _SubrecordWontDeleteTest(customerId){
  nlapiLogExecution('AUDIT', "testdeploy", 'START');
  var testCustomer = nlapiLoadRecord("customer", customerId, {recordmode: 'dynamic'});
  // hardcoded value is programmatically populated in actual use case
  testCustomer.selectLineItem('addressbook', 2);
  testCustomer.removeCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
  testCustomer.commitLineItem('addressbook');
  var res = nlapiSubmitRecord(testCustomer);
  nlapiLogExecution('AUDIT', "testdeploy", 'END')

}

function yeet() {
  _SubrecordWontDeleteTest(589);
}
