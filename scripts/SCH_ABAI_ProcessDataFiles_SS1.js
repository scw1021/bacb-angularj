/**
 * SCH_ABAI_ProcessDataFiles_SS2.js
 *
 * v1.0.0
 * 03/03/2020
 * Robert Imbler
 *
 * Scheduled Script:
 *  Processes ABAI hard data into our ABAI tables
 *
 * NOTES:
 *
 *
 */


////////////////////////////////////////////////////
////////// SECTION: Global Parameters //////////////
////////////////////////////////////////////////////
const PRINT_AUDIT_MESSAGES = true;
const PRINT_DEBUG_MESSAGES = true;
const LOG_TITLE = 'ABAI_ProcessData';
var RUNTIME_CONTEXT = nlapiGetContext();
var startdate = new Date();

const ABAI_TABLES = {
  INSTITUTION: 'customrecord_institution',
  INSTITUTION_ADDRESS: 'customrecord_institution_address',
  COORDINATOR: 'customrecord_coordinator',
  INSTRUCTOR_GROUP: 'customrecord_instrctr_group',
  APWAIVER: 'customrecord_ap_waiver',
  COURSE_SEQUENCE: 'customrecord_course_sequence',
  COURSE: 'customrecord_bacb_course',
  COURSE_ASSIGNEMNT: 'customrecord_crse_seqnc_crse_assignmnt',
  ALT_COURSE_ID: 'customrecord_altrnte_crseid',
  CONTENT_HOURS: 'customrecord_content_hours',
  ALLOCATION: 'customrecord_content_area_hrs_alloc'
}
const ABAI_INSTITUTION = {};
const ABAI_COURSE_SEQUENCE = {};
const ABAI_ASSIGNMENT = {};
const ABAI_COURSE = {};
const ABAI_CONTENT_HOURS = {};
const ABAI_COORDINATOR = {};

////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Point ///////
////////////////////////////////////////////////////

function MainScript() {
  debug('');
  audit('MainScript', '======START======');
  var batchId ='609';// RUNTIME_CONTEXT.getSetting('SCRIPT', 'custscript_abai_intg_log_recid'); //.getParameter({ name: 'custscript_abai_batch_log_id' });
  var abaiBatchRecord = nlapiLoadRecord('customrecord_abai_int_batch_logger', batchId);// record.load({type: 'customrecord_abai_int_batch_logger', id: batchId});
  debug('Batch Record: ' + JSON.stringify(abaiBatchRecord));
  processFile( // INSTITUTION
    '11866410',//abaiBatchRecord.getFieldValue( 'custrecord_institue_fileid' ),
    ABAI_TABLES.INSTITUTION, parseInstitution, ABAI_INSTITUTION
  );
  processFile(  // INSTITUTION ADDRESS
    '11866409',//abaiBatchRecord.getFieldValue('custrecord_institueaddr_fileid'),
    ABAI_TABLES.INSTITUTION_ADDRESS, parseInstitutionAddress, null
  );
  processFile( // COORDINATOR
    '11866405',//abaiBatchRecord.getFieldValue('custrecord_coordinaor_fileid'),
    ABAI_TABLES.COORDINATOR, parseCoordinator, ABAI_COORDINATOR
  );
  processFile( // COURSE SEQUENCE
    '11866408',//abaiBatchRecord.getFieldValue('custrecord_coursesseq_fileid'),
    ABAI_TABLES.COURSE_SEQUENCE, parseCourseSequence, ABAI_COURSE_SEQUENCE
  );
  processFile( // COURSE
    '11866407',//abaiBatchRecord.getFieldValue('custrecord_course_fileid'),
    ABAI_TABLES.COURSE, parseCourse, ABAI_COURSE
  );
  processFile( // AP WAIVER
    '11866406', //abaiBatchRecord.getFieldValue('custrecord_apwaiver_fileid'),
    ABAI_TABLES.APWAIVER, parseApWaiver, null
  );
  processFile( // INSTRUCTOR GROUP
    abaiBatchRecord.getFieldValue('custrecord_instructorgrp_fileid'),
    ABAI_TABLES.INSTRUCTOR_GROUP, parseInstructor, null
  );
  processFile( // COURSE SEQUENCE ASSIGNMENT
    '11866404',//abaiBatchRecord.getFieldValue('custrecord_courseseq_crsass_fileid'),
    ABAI_TABLES.COURSE_ASSIGNEMNT, parseAssignment, ABAI_ASSIGNMENT
  );
  processFile( // ALT COURSE ID
    '11866403', //abaiBatchRecord.getFieldValue('custrecord_alt_courseid_fileid'),
    ABAI_TABLES.ALT_COURSE_ID, parseAltCourseId, null
  );
  processFile( // CONTENT HOURS
    '11866402',//abaiBatchRecord.getFieldValue('custrecord_cont_hours_fileid'),
    ABAI_TABLES.CONTENT_HOURS, parseContentHours, ABAI_CONTENT_HOURS
  );
  processFile( // ALLOCATION HOURS
    '11661557', //abaiBatchRecord.getFieldValue('custrecord_cont_hsallocat_fileid'),
    ABAI_TABLES.ALLOCATION, parseAllocation, null
  );
  audit('MainScript', 'FILE LOAD COMPLETE');


  audit('MainScript', '=======END=======');
}

////////////////////////////////////////////////////
////////// SECTION: Helper/Generic Functions ///////
////////////////////////////////////////////////////

var errorCount = 0;
function processFile(fileId, recordType,  parseFunction, storage) {
  if ( !fileId ) {
    error(recordType, 'fileId is null');
    return;
  }
  audit('processFile', 'Starting: ' + recordType)
  var count = 0;
  // var fileContent = file.load(fileId).getContents().split(/\n|\n\r/);
  // var fileContent = CSVToArray(nlapiLoadFile(fileId).getValue());
  var fileContent = nlapiLoadFile(fileId).getValue().split(/\n|\n\r/);;
  if ( fileContent ) {
    debug(fileId + ' length: ' + fileContent.length);
    debug('Headers: ' + fileContent[0]);
    for ( var line = 1; line < fileContent.length; line++ ) {
      check_governance();
      if (!( fileContent[line] )) {
        continue;
      }
      var dataContent =  CSVToArray(fileContent[line])[0];;//.split(',');
      if ( !dataContent[0] || dataContent[0] == ' ' ) {
        continue;
      }
      if ( count > 0 && count % 1000 == 0 ) {
        debug(recordType + ' count: ' + count);
      }
      try {
        var temp = createRecord(recordType, dataContent, parseFunction);
        if ( storage !== null ) {
          // some things are too good to waste
          storage[dataContent[0]] = temp;
        }
        count += 1;
      }
      catch (ex) {
        errorCount += 1;
        error(recordType, JSON.stringify(ex));
        error(recordType, JSON.stringify(dataContent));
        // FIXME - let's just end on the first error for now
        if ( errorCount > 5 ) {
          // Might as well ensure we get consistent forkups
          line = fileContent.length + 1;
        }
      }
    }
  }
  debug(fileId + ' released');
  fileContent = null;
  debug('NetSuite Usage: ' + nlapiGetContext().getRemainingUsage());
  debug(count + ' records created');
  audit('processFile', recordType + ' processing complete');
}

function setValues(abaiRecord, data) {
  for ( var field in data ) {
    if ( data.hasOwnProperty(field) ) {
      // abaiRecord.setValue({
      //   fieldId: field,
      //   value: data[field]
      // });
      abaiRecord.setFieldValue(field, data[field]);
    }
  }
  return abaiRecord;
}

// LOG functions
function audit(title, message) { if ( PRINT_AUDIT_MESSAGES) nlapiLogExecution('AUDIT',title, message); }
function debug(message) { if ( PRINT_DEBUG_MESSAGES ) nlapiLogExecution('DEBUG',LOG_TITLE, message); }
function error(title, message) { nlapiLogExecution('ERROR',title, message); }

function websiteFix(data, index) {
  var website = data[index];
  if ( /\s/.test(website) ) {
    debug('Bad Website: ' + JSON.stringify(data))
    return '';
  }
  var prepend = website.substring(0,4);
  if ( prepend != 'http' && prepend != 'ftp' ) {
    website = 'http://' + website;
  }
  return website;
}

function createRecord(type, data, parseFunction) {
  var abaiRecord = nlapiCreateRecord(type);// record.create({type: type, isDynamic: true});
  // debug(JSON.stringify(abaiRecord));
  setValues(abaiRecord, parseFunction(data));
  // FIXME - save when we are done debugging
  // var savedRecordId = abaiRecord.save();
  // return record.load({ type: type, id: savedRecordId });
  return abaiRecord;
}

////////////////////////////////////////////////////
///// SECTION: Main/Specific Script Functions //////
////////////////////////////////////////////////////

function parseInstitution(data) {
  // Headers: ID,Name,Credit_System,Accrediting_Body,WebSite,Last_Modified,Status
  // debug(JSON.stringify(data));
  return {
    'externalid': data[0],
    'custrecord_institn_crm_identifier': data[0],
    'custrecord_insttn_name': data[1],
    'custrecord_bacb_insti_cred_sys': data[2],
    // This doesn't even exist in the data
    // 'custrecord_insttn_credit_sys_othr': data[3],
    'custrecord_bacb_insti_accr_body': data[3],
    'custrecord_institn_website': websiteFix( data, 4 )
  }
}
function parseInstitutionAddress(data) {
  return {
    'name': data[0],
    'externalid': data[0],
    'customrecord_institution': ABAI_INSTITUTION[data[1]],
    'custrecord_instn_addr_addr_line1': data[2],
    'custrecord_instn_addr_addr_line2': data[3],
    'custrecord_instn_addr_city': data[4],
    'custrecord_instn_addr_state_provnc': data[5],
    'custrecord_instn_addr_postal_code': data[6],
    'custrecord_instn_addr_country': data[7],
  }
}
function parseCourseSequence(data) {
  return {
    'externalid': data[0],
    'custrecord_crse_seqnc_crm_identifier': data[0],
    'custrecord_crse_seq_institutn': ABAI_INSTITUTION[data[3]],
    'custrecord_crse_seq_coordintr': ABAI_COORDINATOR[data[4]],
    'custrecord_crse_seq_departmnt': data[5],
    'custrecord_crse_seq_apprvl_level': data[6],
    'custrecord_crse_seq_acad_strctre': data[7],
    'custrecord_crse_seq_website': websiteFix(data, 8),
  }
}
function parseCoordinator(data) {
  function nsTF(value) {
    return value == 1;
  }
  return {
    'externalid': data[0],
    'custrecord_coordinator_crm_identifier': data[0],
    'custrecord_coordinator_bacb_id': data[1],
    'custrecord_coordinatr_first_name': data[2],
    'custrecord_coordinatr_middle_name': data[3],
    'custrecord_coordinatr_last_name': data[4],
    'custrecord_coordinator_email': data[5],
    'custrecord_coordinator_cordtr_flag': nsTF(data[9]),
    'custrecord_cordntr_non_cerfd_flg': nsTF(data[10]),
  }
}
function parseCourse(data) {
  return {
    'externalid': data[0],
    'custrecord_course_crm_identifier': data[0],
    'custrecord_course_title': data[1],
    'custrecord_course_number': data[2],
    'custrecord_course_credit_level': data[4],
    'custrecord_course_institutn_id': ABAI_INSTITUTION[data[3]],
    'custrecord_course_credit_hours': data[5],
    'custrecord_offers_approved_experience': data[6] == 'Yes',
    'custrecord_course_mode_of_instrctn': data[7],
    'custrecord_course_syllabi_name': data[8]
  }
}
function parseApWaiver(data) {
  return {
    'externalid': data[0],
    'custrecord_ap_waiver_crm_identifier': data[0],
    'custrecord_ap_waiver_type': data[2],
    'custrecord_ap_waivr_crse_sequnce': ABAI_COURSE_SEQUENCE[data[3]],
    'custrecord_ap_waiver_start_dat': data[4],
    'custrecord_ap_waiver_end_date': data[5],
  }
}
function parseInstructor(data) {
  return {
    'externalid': data[0],
    'custrecord_instructr_grp_crm_id': data[0],
    'customrecord_course_sequence': ABAI_COURSE_SEQUENCE[data[1]],
    'customrecord_coordinator': ABAI_COORDINATOR[data[2]],

  }
}
function parseAssignment(data) {
  return {
    'externalid': data[0],
    'custrecord_crse_seqnc_crs_assign_crm_id': data[0],
    'custrecord_crse_seq_crse_asign_crse': ABAI_COURSE[data[2]],
    'custrecord_crse_seq_crse_asign_crseseqnc': ABAI_COURSE_SEQUENCE[data[2]]
  }
}
function parseAltCourseId(data) {
  return {
    'externalid': data[0],
    'custrecord_alternate_crse_crm_identifier': data[0],
    'custrecord_altnte_crse_id_type': data[2],
    'custrecord_altnte_crse_id_crse': ABAI_COURSE[data[1]],
    'custrecord_altnte_crse_id_value': data[3],
  }
}
function parseContentHours(data) {
  function nullDate(date) {
    return date == 'NULL' ? '' : new Date(date);
  }
  return {
    'externalid': data[0],
    'custrecord_content_hrs_crm_identifier': data[0],
    'custrecord_content_hrs_type': data[2],
    'custrecord_cnt_hrs_crseseq_crseassignmnt': ABAI_ASSIGNMENT[data[1]],
    'custrecord_cnt_hrs_activ_strt_date': nullDate(data[3]),
    'custrecord_cnt_hrs_activ_end_date': nullDate(data[4]),
    'custrecord_cnt_hrs_activ_strt_year': nullDate(data[5]),
    'custrecord_cnt_hrs_activ_end_year': nullDate(data[6]),
    'custrecord_cnt_hrs_activ_strt_quar': nullDate(data[7]),
    'custrecord_cnt_hrs_activ_end_quar': nullDate(data[8]),
    'custrecord_cnt_hrs_activ_strt_sem': nullDate(data[9]),
    'custrecord_cnt_hrs_activ_end_sem': nullDate(data[10])
  }
}
function parseAllocation(data) {
  return {
    'externalid': data[0],
    'custrecord_contnt_area_hrs_alloc_crm_id': data[0],
    'custrecord_cnt_area_hrs_allctn_type': data[2],
    'custrecord_cnt_area_hrs_allctn_cnt_hrs': ABAI_CONTENT_HOURS[data[1]],
    'custrecord_cnt_area_hrs_allctn_value': data[3],
  }
}

function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";
  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    '(?:"([^"]*(?:""[^"]*)*)"|' +
    // Standard fields.
    "([^\\" + strDelimiter + "\\r\\n]*))",
    "gi"
  );
  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    var strMatchedValue;
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // Return the parsed data.
  return arrData;
}

function check_governance() {
	var scheduletime = new Date();
  if ((startdate.getTime() + 3000000) <= scheduletime.getTime()
  || parseInt(nlapiGetContext().getRemainingUsage()) <= 1000)	{
    startdate = new Date();
		nlapiYieldScript();
	}
}
////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Call  ///////
////////////////////////////////////////////////////
function processDataFiles() {
  MainScript();
}
