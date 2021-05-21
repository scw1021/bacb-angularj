/**
 * SCH_Egnyte_FinalRecordOutput_SS2.js
 *
 * v1.0.0
 * 04/21/2020
 * Robert Imbler
 *
 * UPLOAD:
 *  Loads the Final Record file into Egnyte after processing is complete
 *
 * NOTES:
 *  "Bearer tokens issued by Egnyte's APIs do not expire.
 *  However, if a user changes their password or explicitly revokes access,
 *  then a new token will be required. Therefore, your app must be able to
 *  deal with 401 authentication failure scenarios."
 *   - https://developers.egnyte.com/docs/read/Public_API_Authentication
 *
 * Revisions:
 *   8/18/20 - Paths updated to TEAMS folder
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
    var todaysPath = 'https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/TEAMS/BCBA%20Team/VCS%20Data';
    var archivePath = 'https://bacb.egnyte.com/pubapi/v1/fs-content/Shared/TEAMS/BCBA%20Team/VCS%20Data/Archive';
    var accessToken = _getAccessToken();
    var fileId = '12144918';
    var VCSFileName = 'VCS_Data.csv';
    var archiveFileName = 'Final_Record_' + getDateString() + '.csv';
    var stVCSTargetURL = todaysPath + '/' + VCSFileName;
    var stArchiveTargetURL = archivePath + '/' + archiveFileName;
    var targetFile = file.load({id: fileId});
    var fileContent = targetFile.getContents();
    log.debug('Final Record Output', 'Trying to upload: '+fileId+ ' as ' + archiveFileName);
    var outputFile = fileContent;//encode.convert({
    //   string: fileContent,
    //   inputEncoding: encode.Encoding.BASE_64,
    //   outputEncoding: encode.Encoding.UTF_8
    // });
    log.debug('ENCODE encoding', targetFile.encoding);
    log.debug('ENCODE size', targetFile.size);
    log.debug('ENCODE INIT ' + fileContent.length, fileContent);
    // log.debug('ENCODE RESULT ' + outputFile.length, outputFile);
    var urlVCSResponse = https.post({
      url: stVCSTargetURL,
      headers:{
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/pdf;charset=UTF-8',
      },
      body: outputFile// blob// writeFile(newFile, true)
    });
    log.debug('VCS POST RESPONSE CODE', urlVCSResponse.code);
    log.debug('VCS POST RESPONSE BODY', urlVCSResponse.body);
    var urlArchiveResponse = https.post({
      url: stArchiveTargetURL,
      headers:{
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/pdf;charset=UTF-8',
      },
      body: outputFile// blob// writeFile(newFile, true)
    });
    log.debug('VCS POST RESPONSE CODE', urlArchiveResponse.code);
    log.debug('VCS POST RESPONSE BODY', urlArchiveResponse.body);
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

  function getDateString() {
    var today = new Date();
    var year = ('' + today.getFullYear()).substring(2);
    var month = parseInt(today.getMonth()) + 1;
    if ( month < 10 ) {
      month = '0' + month;
    }
    var day = today.getDate();
    if ( day < 10 ) {
      day = '0' + day;
    }
    return year + month + day;
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
