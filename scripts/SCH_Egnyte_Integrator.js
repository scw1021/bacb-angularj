/**
 * SCH_Egnyte_Integrator.js
 *
 * v1.0.0
 * 01/29/2020
 * Robert Imbler
 *
 * EXECUTION:
 *  This file executes the 'integrateNetSuiteEgnyte' function
 *  All files uploaded by clients will be evaluated, in the Documents record
 *  The Document record should be maintained and updated to reflect successful
 *  upload to Egnyte.
 *
 * NOTES:
 *  Immediately after this comment header are the runtime variables used in all functions
 *  The globals available can be changed to easily alter runtime elements. Each variable is described
 *  accordingly.
 *
 * CHANGELOG:
 *
 */

 ////////////// RUNTIME VARIABLES //////////////

// Log Title for nlapilogexecution in custom DEBUG log function
// Viewable in Script Deployment execution logs
const LOG_TITLE    = '--Egnyte-NetSuite--';
// Debug function definition
function log_debug(message){
	nlapiLogExecution('DEBUG', LOG_TITLE, message);
}
// Context allows us to access the runtime variables specified by the script deployment
// The names of the variables are specified in the Script record of the script deployment
const CONTEXT = nlapiGetContext();
// We need the DOCUMENT TYPE for Customer Cases.
// Egnyte uses a separate folder for Cases that are not stored with reference to a specific customer
// Ensure that this value is accurate with the Document Type custom list in NetSuite.
// 27 is the current internalid for the Document Type record for Cases - 1/29/20
const CASE_DOCUMENT_TYPE_ID = '27';

////////////// FUNCTIONAL ENTRY POINT //////////////
integrateNetSuiteEgnyte();


////////////// FUNCTION DEFINITIONS //////////////

/**
 * Entry point for this JS file, starts process of File Migration
 * @returns void
 */
function integrateNetSuiteEgnyte() {
	try {
		log_debug('======START======');
		processFilesFromSavedSearch();
		log_debug('=======END=======');
  }
  catch ( processException ) {
		var sMessage = '';
		if (processException instanceof nlobjError) {
			sMessage = processException.getDetails() || processException.toString();
    }
    else {
			sMessage = 'Unexpected error: ' + processException.toString();
		}
		nlapiLogExecution('ERROR', LOG_TITLE, 'errText ' + sMessage);
	}
}

/**
 * Process Document records 1000 at a time and upload the files individually
 * @returns void
 */
function processFilesFromSavedSearch() {
	var tokenResponse  = getAccessToken();
	if ( true ) { //tokenResponse.getCode() == 200 ) {
    // For Testing Only
    var accessToken = 'gpnqezqsa4npqmm2dkua6hqm';
    accessToken = JSON.parse(tokenResponse.getBody()).access_token;
		log_debug('Access Token -- ' + accessToken);
    // Get the SavedSearch from NS, context settings are stored in the ScriptDeployment record as 'Parameters'
    // The custscript id's for settings are stored in the Script record of that deployment
		var fileSearchId  =  CONTEXT.getSetting('SCRIPT','custscript_filetobemoved');
    // Start indeces for the search, because we can only do 1000 records at once due to NetSuite constraints
    var startIndex = 0;
    var endIndex = 1000;
    // Get all of the documents requiring upload by Saved-Searching the Documents records
		var runFileSearch = nlapiLoadSearch('customrecord_documents', fileSearchId).runSearch();
    var searchResults = runFileSearch.getResults(startIndex, endIndex);
		while ( searchResults && searchResults.length > 0 ) {
      log_debug('Number of Files to Transfer: ' + searchResults.length);
      // Upload this set of files
      for ( var searchIndex = 0; searchIndex < searchResults.length; searchIndex++ ) {
        uploadFileToEgnyte(searchResults[searchIndex], accessToken);
      }
      //Increment the Index and get the results
      startIndex = endIndex;
      endIndex = endIndex + 1000;
      searchResults  = runFileSearch.getResults(startIndex, endIndex);
		}
  }
  else {
		log_debug('No Token Found');
	}
}
/**
 * Take individual search result and determine the submission requirements.
 * If file exists in NetSuite, the file is uploaded to Egnyte. Next, the Document Record
 * is updated to reflect the upload.
 * @returns void
 */
function uploadFileToEgnyte( fileSearchResult, accessToken ) {
  //get the value is Needs Uploaded...
  var needsUploaded = fileSearchResult.getValue('custrecord_doc_needs_uploaded');
  var documentId = fileSearchResult.getValue('internalid');

  if ( needsUploaded == 'T' ) {
    // CustomerId might be better called 'folder id' or something because that is its use case
    var customerId   = fileSearchResult.getValue('entityid','custrecord_doc_customer');
    var caseId       = fileSearchResult.getValue('number','custrecord_support_case_number');
    var fileId       = fileSearchResult.getValue('custrecord_doc_file');
    var fileName	   = fileSearchResult.getValue('custrecord_doc_new_filename');
    var documentType = fileSearchResult.getValue('custrecord_doc_type');
    var stTargetURL  = CONTEXT.getSetting('SCRIPT','custscript_egn_targeturl');

    var folderString = 'CustomerDocuments';
    // If it's a case, change the final URL specifications
    if ( documentType == CASE_DOCUMENT_TYPE_ID ) {
      customerId = caseId;
      folderString = 'CaseDocuments';
    }
    // Target URL should include the relative filepath in addition to the
    // provided URL in the Script Deployment
    stTargetURL = stTargetURL + folderString + '/' + customerId + '/' + fileName;
    log_debug('Trying to upload: '+fileId+' with file Name: '+fileName+' for customerId: '+customerId);

    var fileContent = nlapiLoadFile(fileId).getValue();
    var requestHeader = {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'plain/text'
    }
    var objResponse = nlapiRequestURL(stTargetURL, fileContent, requestHeader, 'POST');
    log_debug('URL Request Response: ' + JSON.stringify(objResponse));
    if ( objResponse.getCode() == 200 ) {
      //update the record...
      // nlapiSubmitField('customrecord_documents',documentId,['custrecord_doc_needs_uploaded','custrecord_doc_infilecabnet'],['F','F']);
      //delete the file from NetSuite and Update the document Record...
      // deleteFileById(fileId);
    }
    else {
      nlapiLogExecution('ERROR', LOG_TITLE, 'Failed to submit file ' + fileId);
    }
  }
  else {
    //update the record...
    nlapiSubmitField('customrecord_documents',documentId,['custrecord_doc_needs_uploaded','custrecord_doc_infilecabnet'],['F','F'])
    //delete the file from NetSuite and Update the document Record...
    deleteFileById(fileId);
  }
}

function getAccessToken() {
  try{
    var stLoginURL = CONTEXT.getSetting('SCRIPT','custscript_egn_tokenaccurl');
    var clientId   = CONTEXT.getSetting('SCRIPT','custscript_egn_clientid');
    var grantType  = CONTEXT.getSetting('SCRIPT','custscript_egn_granttype');
    var username   = CONTEXT.getSetting('SCRIPT','custscript_egn_username');
    var password   = CONTEXT.getSetting('SCRIPT','custscript_egn_password');

    // log_debug('stLoginURL -- ' +stLoginURL );
    // log_debug('clientId   -- ' +clientId );
    // log_debug('grantType  -- ' +grantType );
    // log_debug('username   -- ' +username );
    // log_debug('password   -- ' +password );

    var TokenHeader = new Array();

    var TokenURL = stLoginURL + '?client_id='+clientId+'&username='+username+'&password='+password+'&grant_type=password' ;
    log_debug('LoginURL: '+ TokenURL);
    TokenHeader["content-type"] = 'application/x-www-form-urlencoded';
    TokenHeader["Accept"] = "application/json;charset=UTF-8";

    var objResponse = nlapiRequestURL(TokenURL,"",TokenHeader , 'POST');
    var code    = objResponse.getCode();
    var error   = objResponse.getError();
    var body    = objResponse.getBody();
    var headers = objResponse.getAllHeaders();

    for( var responseIndex=0; responseIndex < headers.length; responseIndex++ ) {
      var headerVal = headers[responseIndex];
      var headerValue = objResponse.getHeader(headerVal);
      log_debug('Header Token :: Header Value ' + headerVal + '||' + headerValue);
    }
    log_debug('code'+JSON.stringify(code));
    log_debug('error'+JSON.stringify(error));
    log_debug('Body '+JSON.stringify(body));
    log_debug(' act headers'+JSON.stringify(headers));
    return objResponse;
  }
  catch ( tokenException ) {
		var sMessage = '';
		if (tokenException instanceof nlobjError) {
			sMessage = tokenException.getDetails() || tokenException.toString();
		} else {
			sMessage = 'Unexpected error: ' + tokenException.toString();
		}
		nlapiLogExecution('ERROR', LOG_TITLE, 'errText ' + sMessage);
	}
}


function deleteFileById(fileid){

	try{
		nlapiDeleteFile(fileid);
		log_debug( 'File Deleted ' + fileid);
	}catch(e){

		var sMessage = '';
		if (e instanceof nlobjError)
		{
			sMessage = e.getDetails() || e.toString();
		} else
		{
			sMessage = 'Unexpected error: ' + e.toString();
		}
		nlapiLogExecution('ERROR', LOG_TITLE, 'errText in deleting file ' + sMessage);

	}

}

