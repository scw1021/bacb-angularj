/**
 * SCH_Egnyte_Integrator_SS2.js
 *
 * v1.0.0
 * 02/03/2020
 * Robert Imbler
 *
 * UPLOAD:
 *  File Upload script to allow for >5MB files and 2.0 function assistance
 *  Loads a file into Engyte folder
 *  Updates a Document Record to facilitate Egnyte recall of uploaded file
 *
 * NOTES:
 *  "Bearer tokens issued by Egnyte's APIs do not expire.
 *  However, if a user changes their password or explicitly revokes access,
 *  then a new token will be required. Therefore, your app must be able to
 *  deal with 401 authentication failure scenarios."
 *   - https://developers.egnyte.com/docs/read/Public_API_Authentication
 *
 *
 */

/**
 * @NApiVersion 2.x
* @NScriptType ScheduledScript
 */

define( ["N/encode", "N/file", "N/http", "N/https", "N/log", "N/record", "N/render", "N/runtime", "N/search"],
function( encode, file, http, https, log, record, render, runtime, search ) {

  const CASE_DOCUMENT_TYPE_ID = '27';
  const CONTEXT = runtime.getCurrentScript();
  /**
   * Processes files for Egnyte submission using a SavedSearch to gather files from NetSuite File Cabinet
   * Document Records tagged with 'Needs Upload' are uploaded.
   * Document Records with 'In Cabinet(?)' have their files deleted and records updated.
   */
  function ProcessFiles() {
    var searchResults = _loadSavedSearchResults();
    log.debug('UploadFile', 'searchResult Length: ' + searchResults.length);
    if ( searchResults.length == 0 ) {
      log.audit('UploadFiles', 'Egnyte upload not required');
      return;
    }
    // _updateAccessToken('string');
    var accessToken = _getAccessToken();

    // All search results are files in File Cabinet that 1) need upload to Egnyte or 2) need to be removed from NS
    searchResults.each( function(result) {
      var needsUploaded = result.getValue({ name: 'custrecord_doc_needs_uploaded' });
      var documentId = result.getValue({ name: 'internalid' });
      log.debug('Search Results', 'Document: ' + documentId + ' upload: ' + needsUploaded);
      // As a note, when you query a Checkbox in SS2.0, it actually returns a boolean value.
      if ( needsUploaded ) {
        // Accessing subrecords is a little harder in 2.0
        // We can get the field value from the parent and then load the record directly
        // Once loaded, we can easily access its properties as well.
        var customerId = record.load({
          type: 'Customer',
          id: result.getValue({ name: 'custrecord_doc_customer' }),
          isDynamic: true
        }).getValue({ fieldId: 'entityid'});
        var caseId = result.getValue({name: 'custrecord_support_case_number'});
        // because it isn't a required field, we need to safely access its properties
        if ( caseId ) {
          // but it can't happen in the LOAD, null ID throws an error
          caseId = record.load({
            type: 'Case',
            id: caseId,
            isDynamic: true
          }).getValue({name: 'number'});
        }
        var fileId = result.getValue({name: 'custrecord_doc_file'});
        var fileName = result.getValue({name: 'custrecord_doc_new_filename'});
        var documentType = result.getValue({name: 'custrecord_doc_type'});
        var stTargetURL = CONTEXT.getParameter({ name: 'custscript_egnyte_target_path' });
        var folderString = 'CustomerDocuments';
        if ( documentType == CASE_DOCUMENT_TYPE_ID ) {
          customerId = caseId;
          folderString = 'CaseDocuments';
        }
        stTargetURL = stTargetURL + folderString + '/' + customerId + '/' + fileName;
        log.debug('ProcessFiles', 'Trying to upload: '+fileId+' with file Name: '+fileName+' for customerId: '+customerId);
        // file.load(): file.File .... file.File.getContents(): string
        var targetFile = file.load({id: fileId});
        var fileContent = targetFile.getContents();
        // var byteCharacters = '';// atob(fileContent);
        // var byteArrays = [];
        // var sliceSize = 512;
        // for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        //   var slice = byteCharacters.slice(offset, offset + sliceSize);
        //   var byteNumbers = new Array(slice.length);
        //   for (var sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
        //     byteNumbers[sliceIndex] = slice.charCodeAt(sliceIndex);
        //   }
        //   var byteArray = new Uint8Array(byteNumbers);
        //   byteArrays.push(byteArray);
        // }
        // var blob = new Blob(byteArrays, {type: 'application/pdf'});
        var outputFile = encode.convert({
          string: fileContent,
          inputEncoding: encode.Encoding.BASE_64,
          outputEncoding: encode.Encoding.UTF_8
        });
        var output = Base64.decode(fileContent);
        // Hot honey badgers this actually works!
        log.debug('ENCODE encoding', targetFile.encoding);
        log.debug('ENCODE size', targetFile.size);
        log.debug('ENCODE INIT ' + fileContent.length, fileContent);
        log.debug('ENCODE RESULT ' + outputFile.length, outputFile);
        // var renderer = render.create();
        // renderer.templateContent = outputFile;
        // var newFile = renderer.renderAsPdf();
        // render.addRecord()
        // https.post(params): <string>https.ClientResponse
        var urlResponse = https.post({
          url: stTargetURL,
          headers:{
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/pdf;charset=UTF-8',
          },
          body: outputFile// blob// writeFile(newFile, true)
        });
        log.debug('HTTPS POST RESPONSE CODE', urlResponse.code);
        log.debug('HTTPS POST RESPONSE BODY', urlResponse.body);

      }
    })
  }

  /**
   * This function gets the OAuth access token for Egnyte from Deployment Parameters
   * Works as expected.
   * @returns {token: string}
   */
  function _getAccessToken() {

    var tokenRecord = record.load({
      type: 'customrecord_authorization_token',
      id: CONTEXT.getParameter({ name: 'custscript_egnyte_token' })
    })
    log.debug('TOKEN PARAMETER', tokenRecord.getValue({ fieldId: 'custrecord_authorization_token' }));
    return  tokenRecord.getValue({ fieldId: 'custrecord_authorization_token' });
  }

  /**
   * We need to maintain the OAuth token for Egnyte. It only expires when the password changes on Egnyte.
   * Unfortunately, this probably means that the Script Deployment needs to be updated manually
   * in order to replace the expired password. This script will automatically renew (attempt to renew, anyway)
   * the OAuth token with the password in the Deployment parameters.
   */
  function _updateAccessToken() {
    log.debug('update token START', '');
    var stLoginUrl = CONTEXT.getParameter({ name: 'custscript_egnyte_tokenurl' });
    stLoginUrl = 'http://bacb.egnyte.com/puboauth/token'
    var clientId = CONTEXT.getParameter({ name: 'custscript_egnyte_clientid' });
    var username = CONTEXT.getParameter({ name: 'custscript_egnyte_username' });
    var password = CONTEXT.getParameter({ name: 'custscript_egnyte_password' });

    var tokenBody = {
      client_id: clientId,
      username: username,
      password: password,
      grant_type: 'password'
    };
    // var tokenBody = '?client_id=' + clientId + '&username=' + username
    //               + '&password=' + password + '&grant_type=password';

    var TokenHeader = {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': "application/json;charset=UTF-8"
    }
    // var TokenHeader = new Array();
    // TokenHeader["content-type"] = 'application/x-www-form-urlencoded';
    // TokenHeader["Accept"] = "application/json;charset=UTF-8";

    var TokenURL = stLoginUrl //+ tokenBody;
    log.debug('GetAccessToken', TokenURL);
    // Request token from OAuth API
    var urlResponse = http.post({
      url: TokenURL,
      header: TokenHeader,
      body: tokenBody
    });
    log.debug('HTTPS TOKEN RESPONSE CODE', urlResponse.code);
    log.debug('HTTPS TOKEN RESPONSE BODY', urlResponse.body);
    var updatedToken = urlResponse.body.access_token ?  urlResponse.body.access_token : 'null';
    // 2.0 is slick. This just updates the field in a single call. Changes reflected in
    // Deployment Parameters immediately, so don't worry about Runtime issues.
    // record.submitFields({
    //   type: 'customrecord_authorization_token',
    //   id: CONTEXT.getParameter({ name: 'custscript_egnyte_token' }),
    //   values: {
    //     'custrecord_authorization_token': updatedToken
    //   }
    // });
  }

  /**
   * Loads the saved search for files that require upload to Egnyte
   * As a note, this uses the 'search' element from the 'define' declaration
   * @returns {search.Search}
   */
  function _loadSavedSearchResults() {
    // NS - search.load( searchID ) : search.Search
    var savedSearch = search.load({id: CONTEXT.getParameter({name: 'custscript_egnyte_saved_search'})});
    // NS - search.Search.run(): search.ResultSet
    return savedSearch.run();
  }

  /**
   * Maria Berinde-Tampanariu
   * edited Nov 28 '17 at 22:20
   * https://stackoverflow.com/questions/40654462/how-to-convert-binary-file-to-string-in-suitescript
   */
  var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    }, decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    }, _utf8_encode: function (e) {
        e = e.replace(/rn/g, "n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }, _utf8_decode: function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }


  }
  return {
    execute: ProcessFiles
  }
});
