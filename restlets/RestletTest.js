/*
Behavior Analyst Certification Board
RESTful Garbage

Robert Imbler
Application Developer
March 2020

README
Simple Test Case
*/



function _post(context){
  nlapiLogExecution('AUDIT', 'AYYYY', 'LMAO');
}
function _get(context){
  nlapiLogExecution('AUDIT', 'AYYYY', 'LMAO');
  return JSON.stringify({
    Response: 'T',
    Message: 'Guess it worked'
  })
}
function _delete(context){
}
