/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var log_var = "--Egnyte-NetSuite-File Download-";
var stLogTitle = "--Egnyte-NetSuite-File Download-";
var context = nlapiGetContext();

function downloadFilesEgnyte(type) {
  try {
    logit("Exection Started");
    movefiles();
    logit("Exection Ended");
  } catch (e) {
    var sMessage = "";
    if (e instanceof nlobjError) {
      sMessage = e.getDetails() || e.toString();
    } else {
      sMessage = "Unexpected error: " + e.toString();
    }
    nlapiLogExecution("ERROR", log_var, "errText " + sMessage);
  }
}

function logit(msg) {
  nlapiLogExecution("DEBUG", log_var, msg);
}

function movefiles() {
  var stLoginURL = context.getSetting(
    "SCRIPT",
    "custscript_egn_dwn_tokenaccurl"
  );
  var folderid = context.getSetting("SCRIPT", "custscript_egn_dwn_folderid");
  var clientId = context.getSetting("SCRIPT", "custscript_egn_dwn_clientid");
  var grantType = context.getSetting("SCRIPT", "custscript_egn_dwn_granttype");
  var username = context.getSetting("SCRIPT", "custscript_egn_dwn_username");
  var password = context.getSetting("SCRIPT", "custscript_egn_dwn_password");
  var casefolderid = context.getSetting(
    "SCRIPT",
    "custscript_case_files_download_folder"
  );

  var customerid = context.getSetting("SCRIPT", "custscript_egn_customerid");
  var emailid = context.getSetting("SCRIPT", "custscript_useremail");
  var recordtype = context.getSetting("SCRIPT", "custscript_recordtype_egnyte");

  if (customerid && emailid) {
    var start_index = 0;
    var end_index = 1000;
    var fileCustSearchId = context.getSetting(
      "SCRIPT",
      "custscript_filetobedownload"
    );
    //var folderid		  =  context.getSetting('SCRIPT','custscript_foldertobeplace');
    var stTargetURL = context.getSetting("SCRIPT", "custscript_egy_targeturl");

    var documentFileSearch = nlapiLoadSearch(
      "customrecord_documents",
      fileCustSearchId
    );

    var filters = [];

    if (recordtype == "supportcase") {
      filters.push(
        new nlobjSearchFilter(
          "custrecord_support_case_number",
          null,
          "anyof",
          customerid
        )
      );
    } else {
      filters.push(
        new nlobjSearchFilter(
          "custrecord_doc_customer",
          null,
          "anyof",
          customerid
        )
      );
    }

    documentFileSearch.addFilters(filters);

    var run_file_search = documentFileSearch.runSearch();
    var file_search_results = run_file_search.getResults(
      start_index,
      end_index
    );

    if (file_search_results && file_search_results.length > 0) {
      nlapiLogExecution("debug", log_var, file_search_results.length);
      var tokenResponse = getAccessToken(
        stLoginURL,
        clientId,
        grantType,
        username,
        password
      );
      var responseCode = tokenResponse.getCode();
      if (true) {
        //responseCode == 200)
        var ResonseBody = JSON.parse(tokenResponse.getBody());
        var sToken = context.getSetting(
          "SCRIPT",
          "custscript_egnyte_download_token"
        ); // ResonseBody.access_token;
        logit("sToken --" + sToken);
        var fileSearchId = context.getSetting(
          "SCRIPT",
          "custscript_filetobemoved"
        );
        var stTargetURL = context.getSetting(
          "SCRIPT",
          "custscript_egy_targeturl"
        );

        for (var i = 0; i < file_search_results.length; i++) {
          //get the value is Needs Uploaded....
          var fileName = file_search_results[i].getValue(
            "custrecord_doc_new_filename"
          ); //get he file name which is modified
          var documentid = file_search_results[i].getValue("internalid"); //get he file name which is modified
          var customerid = file_search_results[i].getValue(
            "entityid",
            "custrecord_doc_customer"
          );
          var caseid = file_search_results[i].getValue(
            "number",
            "custrecord_support_case_number"
          );
          logit("Trying to download :" + fileName);

          if (recordtype == "supportcase") {
            stTargetURL =
              "https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/CaseDocuments/";
            customerid = caseid;
            folderid = casefolderid;
          } else {
            stTargetURL =
              "https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/CustomerDocuments/";
          }

          var loop = 25;
          var fileidcreated = null;
          for (var itr = 0; itr < loop; itr++) {
            fileidcreated = downloadFile(
              fileName,
              stTargetURL,
              folderid,
              sToken,
              customerid
            );

            if (fileidcreated) {
              //update the record..
              nlapiSubmitField(
                "customrecord_documents",
                documentid,
                ["custrecord_doc_infilecabnet", "custrecord_doc_file"],
                ["T", fileidcreated]
              );
              break;
            }
          }
        }
      } else {
        logit("No Token Found");
        //sendEmail(emailid,false);
      }
    } else {
      logit("No Files for this customer");
    }
  } else {
    logit("Customer is mIssing");
  }
}

function downloadFile(
  fileName,
  sNotifEndPointUrl,
  folderid,
  sToken,
  customerid
) {
  var fileEndPont = sNotifEndPointUrl + customerid + "/" + fileName;
  logit("actual file endpoint::" + fileEndPont);
  nlapiLogExecution("DEBUG", "Token:", "stoken:" + sToken);

  // Set Static Values
  var oSFDCNotifHeader = new Object();
  oSFDCNotifHeader["Authorization"] = "Bearer " + sToken;
  oSFDCNotifHeader["Accept"] = "application/xhtml+xml";

  logit(" oSFDCNotifHeader::" + JSON.stringify(oSFDCNotifHeader));

  var oResponse = nlapiRequestURL(fileEndPont, null, oSFDCNotifHeader, "POST");
  //logit('actual file endpoint::'+JSON.stringify(oResponse));

  var code = oResponse.getCode();
  var error = oResponse.getError();
  var responsebody = oResponse.getBody();
  var headers = oResponse.getAllHeaders();

  logit("code" + JSON.stringify(code));
  logit("error" + JSON.stringify(error));
  logit("Body " + JSON.stringify(responsebody));

  /*for(var tr=0;tr<headers.length;tr++){

		var headerVal   =  headers[tr];
		var headerValue = oResponse.getHeader(headerVal);

		logit('Header Token :: Header Value ' +headerVal +'||'+ headerValue);
	}*/

  if (code == 200) {
    //create the file in netsuite...
    responsebody = JSON.parse(responsebody);
    var filecontent = responsebody.checksum;
    logit("filecontent::" + filecontent);

    var fileObject = nlapiCreateFile(fileName, "PLAINTEXT", filecontent);
    fileObject.setFolder(folderid);
    var FileId = nlapiSubmitFile(fileObject);
    logit("FileID" + FileId);

    return FileId;
  } else {
    logit("unable to download the file ");
    return null;
  }
}

function getAccessToken(stLoginURL, clientId, grantType, username, password) {
  try {
    logit("stLoginURL -- " + stLoginURL);
    logit("clientId   -- " + clientId);
    logit("grantType  -- " + grantType);
    logit("username   -- " + username);
    logit("password   -- " + password);

    var TokenHeader = new Array();
    /* var TokenURL = 'https://bacb.egnyte.com/puboauth/token?client_id=
   //dw53pnw82tr3xm9nwstpyx44&username=Netsuite.Service@bacb.com&password
   //=29$FordBurnSpot&grant_type=password' ;*/

    var TokenURL =
      "https://bacb.egnyte.com/puboauth/token?client_id=" +
      clientId +
      "&username=" +
      username +
      "&password=" +
      password +
      "&grant_type=password";
    TokenHeader["content-type"] = "application/x-www-form-urlencoded";
    TokenHeader["Accept"] = "application/json;charset=UTF-8";

    var oResponse = nlapiRequestURL(TokenURL, "", TokenHeader, "POST");

    var code = oResponse.getCode();
    var error = oResponse.getError();
    var body = oResponse.getBody();
    var headers = oResponse.getAllHeaders();

    /*for(var tr=0;tr<headers.length;tr++){

		var headerVal   =  headers[tr];
		var headerValue = oResponse.getHeader(headerVal);

		logit('Header Token :: Header Value ' +headerVal +'||'+ headerValue);


	}*/
    //logit('code'+JSON.stringify(code));
    //logit('error'+JSON.stringify(error));

    //logit('Body '+JSON.stringify(body));
    //logit(' act headers'+JSON.stringify(headers));

    //logit('intoken Getting'+JSON.stringify(oResponse));
    return oResponse;
  } catch (e) {
    var sMessage = "";
    if (e instanceof nlobjError) {
      sMessage = e.getDetails() || e.toString();
    } else {
      sMessage = "Unexpected error: " + e.toString();
    }
    nlapiLogExecution("ERROR", log_var, "errText " + sMessage);
  }
}

function deleteFiled(fileid) {
  try {
    nlapiDeleteFile(fileid);
  } catch (e) {
    var sMessage = "";
    if (e instanceof nlobjError) {
      sMessage = e.getDetails() || e.toString();
    } else {
      sMessage = "Unexpected error: " + e.toString();
    }
    nlapiLogExecution("ERROR", log_var, "errText in deleting file " + sMessage);
  }
}
