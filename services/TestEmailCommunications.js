/**
 * @NApiVersion 2.x
 * @NScriptType restlet
 */

define(["N/log", "N/search", "N/record", "N/query"], function (log, search, record, query){
  function getFn(){
    log.audit("mainscript", "=====START=====")
    var custId = 458616;

    log.audit("mainscript", "=====END=====")
    return JSON.stringify('result');
  }

  function postFn(requestBodyParam){
    log.audit("Post function", "=====START=====")
    var custId = requestBodyParam.custId;
    var emailArray = getLoggedInCustomerEmailArray(custId);
    log.audit('ayy'+ emailArray)
    var messagesEmailFilter = search.createFilter({
      name: 'recipientemail',
      operator: search.Operator.IS,
      values: emailArray
    })
    var getSomeMessagesSearch = search.create({
      type: search.Type.MESSAGE,
      filters: messagesEmailFilter,
      columns: [
        'internalid',
        'recipientemail',
        'message',
        'messagedate',
        'subject',
        'authoremail'
      ]
    })
    var messageResultsIdArray = [];
    var messagesSearchResults = getSomeMessagesSearch.run();

    messagesSearchResults.each(logResults)
    function logResults(res){
      var messageObj = {
        //internalid: res.getValue({name: 'internalid'}),
        recipientEmail: res.getValue({name: 'recipientemail'}),
        messageHTML: res.getValue({name: 'message'}),
        sendDate: res.getValue({name: 'messagedate'}),
        subject: res.getValue({name: 'subject'}),
        authorEmail: res.getValue({name: 'authoremail'}),
      }
      log.audit('res',
        messageObj
      );
      messageResultsIdArray.push(
        messageObj
      )
      return true;
    }



    log.audit("Post function", "=====END=====")
    return messageResultsIdArray
  }

  function getMessages(emailArray){
    var customerMessageIdFilter = search.create({
      name: 'entityid',
      operator: search.Operator.IS,

    })

  }

  function getLoggedInCustomerEmailArray(customerId){
    var customerIdFilter = search.createFilter({
      name: 'entityid',
      operator: search.Operator.IS,
      values: customerId
    })
     var mySearch = search.create({
      type: search.Type.CUSTOMER,
      filters: customerIdFilter,
      columns: [
        'email',
      ]
    })

    var searchResults = mySearch.run();
    var returnEmailArray = [];
    searchResults.each(pushEmailSearchToArray);

    function pushEmailSearchToArray(result){
      try{
        log.audit(result)
        returnEmailArray.push(
          result.getValue({
            name: 'email'
          })
        )
      } catch(ex){
        log.audit("Exception: " + ex.message)
        //return null;
      }
        log.audit("emailarr" +returnEmailArray);
        return true;
      }
      returnEmailArray.push('testemail@test.com')
      return returnEmailArray

  }
  return{
    get: getFn,
    post: postFn
  }
})


  // function postFn(requestBodyParam){
  //   log.audit("Post function", "=====START=====")
  //   var custId = requestBodyParam.custId;
  //   log.audit(custId)
  //   var emailQuery = query.create({
  //     type: query.Type.CUSTOMER
  //   })
  //   var customerQuery = query.create({
  //     type: query.Type.CUSTOMER
  //   });
  //   var customerQueryCondition = customerQuery.createCondition({
  //     fieldId: 'entityid',
  //     operator: query.Operator.EQUAL,
  //     values: custId
  //   })
  //   var emailQueryCondition = customerQuery.createCondition({
  //     fieldId: 'email'
  //   })

  //   customerQuery.condition = customerQuery.and(customerQueryCondition)
  //   customerQuery.columns = [
  //     customerquery.createColumn({
  //       fieldId: 'email'
  //     }),

  //   ]
  //   var queryresults = customerQuery.run()

  //   log.audit("Post function", "=====END=====")
  //   return JSON.stringify(queryresults)
  // }


/*

    // Rob say: do all filters and joins BEFORE running a search
    // search obj has all methods in search docu
    // run() returns a resultset object
    var customerIdFilter = search.createFilter({
      name: 'entityid',
      operator: search.Operator.IS,
      values: custId
    })


     var mySearch = search.create({
      type: search.Type.CUSTOMER,
      filters: customerIdFilter,
      columns: [
        'email',

        //'custrecord_name'
        // Rimbler say this is where we do a join
        // if youre pulling fields directly from record declare those fields here
        // if you additiopnally want another object that you're searching for create a json obj and use a column  options to define those
        // name is only required one
      ]
    })
    //      filters: ['internalid', search.Operator.IS, '485616'],
    var searchRes = mySearch.run();
    log.audit("this")
    var returnEmailArray = [];
    searchRes.each(resFn);
    function resFn(res){
      try{
        returnEmailArray.push(
          res.getValue({name: 'email'})
          )
        }
        catch(ex){
          log.audit("Exception: " + ex.message)
          return null;
        }
        return returnEmailArray;
      }
    //log.audit(result.getValue({name: 'internalid'}))

  */
