/**
 * SCH_ABAI_TO_RC.js.js
 *
 * v1.0.0
 * 03/12/2020
 * Robert Imbler
 *
 * Scheduled Script:
 *  Processes ABAI hard data into our RC Tables
 *
 * NOTES:
 *  This uses Suitescript 1.0, which can use governance in order to process the massive number of records.
 *
 */

////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Call  ///////
////////////////////////////////////////////////////
function NetSuiteEntryFunction(){
  MainScript();
  MainScript_RC();
}

var testCase = true;
var duplicates = 0;
var BAD_COURSE = 0;


////////////////////////////////////////////////////
////////// SECTION: Global Parameters //////////////
////////////////////////////////////////////////////
const PRINT_AUDIT_MESSAGES = true;
const PRINT_DEBUG_MESSAGES = true;
const ABAI_INTEGRATION_FILE_ID = '10325739';
const LOG_TITLE = 'SCH_ABAI_TO_RC';
const DELIMITER = ',';
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
// List of saved searches present in the Scheduled Script as parameters

const RC_TABLES = {
  INSTITUTION: {
    Title: 'customrecord_rc_institution',
    Columns: ['custrecord_rc_inst_name'],
    Misses: 0, Hits: 0, TOTAL: 0,
    SaveKey: addInstitutionKey,
    KEYS: '"internalid","externalid","name","duplicate"\n',
    KeyFile: 'RCInstitutionList_KEY.csv' //nlapiCreateFile('helloworld.txt', 'PLAINTEXT', 'Hello World\nHello World')
  },
  INSTITUTION_ADDRESS: {
    Title: 'customrecord_rc_inst_address',
    Columns: ['custrecord_rc_inst_add_inst'],
    // ['', 'custrecord_rc_inst_add_inst'] ],
    Misses: 0, Hits: 0, TOTAL: 0,

  },
  COORDINATOR: {
    Title: 'customrecord_rc_coordinator',
    Columns: ['custrecord_rc_depart_name','custrecord_rc_depart_institution'],
    Misses: 0, Hits: 0, TOTAL: 0,
  },
  DEPARTMENT: {
    Title: 'customrecord_rc_department',
    Columns: ['custrecord_rc_depart_name','custrecord_rc_depart_institution'],
    Misses: 0, Hits: 0, TOTAL: 0,
    SaveKey: addDeparmentKey,
    KEYS: '"externalid","Department","internalid","Institution","InstitutionId","InstitutionCRM"\n',
    KeyFile: 'RCDepartmentList_KEY.csv'
  },
  COURSE: {
    Title: 'customrecord_rc_course',
    Columns: ['custrecord_rc_crse_crm_id'],
    Misses: 0, Hits: 0, TOTAL: 0,
    SaveKey: addCourseKey,
    KEYS: '"externalid","internalid","RcDepartment","custrecord_rc_course_title"\n',
    KeyFile: 'RCCourseList_KEY.csv'
  },
  COURSE_adv: {
    Title: 'customrecord_rc_course_advanced',
    Columns: ['custrecord_rc_crse_crm_id'],
    Misses: 0, Hits: 0, TOTAL: 0,
  },
  CONTENT_HOURS: {
    Title: 'customrecord_rc_content_hours',
    Columns: ['custrecord_rc_content_hr_edition','custrecord_rc_content_hr_course',
    'custrecord_rc_content_hr_start_date','custrecord_rc_content_hr_end_date'],
    Misses: 0, Hits: 0, TOTAL: 0,
    SaveKey: addContentHourKey,
    KEYS: '"externalid","internalid","CourseCrm","RcCourse"\n',
    KeyFile: 'RCContentHoursList_KEY.csv'
  },
  ALLOCATION_HOURS: {
    Title: 'customrecord_rc_hour_allocation',
    Columns: ['externalid','custrecord_rc_cntntarea_hrs_alloc_crm_id',
    'custrecord_rc_hr_alloc_type','custrecord_rc_hr_alloc_content_hours',
    'custrecord_rc_hr_alloc_value'],
    Misses: 0, Hits: 0, TOTAL: 0,
    SaveKey: addAllocationHourKey,
    KEYS: '"externalid","internalid","RcContentHour","ContentHourExternalid","RcCourse","AllocCrm"\n',
    KeyFile: 'RCAllocationHourList_KEY.csv'
  },
};

const AllocTypeTable = {
  "BACB Compliance Code and Disciplinary Systems; Professionalism": 1,//'E',
  "Behavior Assessment": 2,//'F',
  "Behavior Change Systems": 3,//'D4',
  "Behavior-Change Procedures; Selecting and Implementing Interventions": 4,//'GH',
  "Concepts & Principles": 5,//'B',
  "Concepts & Principles of Behavior Analysis": 6,//'B1',
  "Discretionary": 7,//'E',
  "Ethical & Professional Conduct": 8,//'A1',
  "Experimental Design": 9,//'C2',
  "Fundamental Elements of Behavior Change & Specific Behavior Change Procedures": 10,//'D2',
  "Identification of the Problem & Assessment": 11,//'D1',
  "Implementation, Management, and Supervision": 12,//'D5',
  "Intervention & Behavior Change Considerations": 13,//'D3',
  "Measurement (including data analysis)": 14,//'C1',
  "Measurements, Data Display and Interpretation; Experimental Design": 15,//'CD',
  "Personnel Supervision and Management": 16,//'I',
  "Philosophical Underpinnings": 17,//'A',
  "Philosophical Underpinnings; Concepts & Principles (BCaBA use only)": 18,//'AB',
}
const allocMap = {
  "Ethical & Professional Conduct": 'A1',
  "Concepts & Principles of Behavior Analysis": 'B1',
  "Measurement (including data analysis)": 'C1',
  "Experimental Design": 'C2',
  "Identification of the Problem & Assessment": 'D1',
  "Fundamental Elements of Behavior Change & Specific Behavior Change Procedures": 'D2',
  "Intervention & Behavior Change Considerations": 'D3',
  "Behavior Change Systems": 'D4',
  "Implementation, Management, and Supervision": 'D5',
  "Discretionary": 'E1',
  "BACB Compliance Code and Disciplinary Systems; Professionalism": '5A',
  "Philosophical Underpinnings": '5B (B1)',
  "Concepts & Principles": '5B (B2)',
  "Philosophical Underpinnings; Concepts & Principles (BCaBA use only)": '5B (B3)',
  "Measurements, Data Display and Interpretation; Experimental Design": '5C1-C2',
  "Behavior Assessment": '5D1',
  "Behavior-Change Procedures; Selecting and Implementing Interventions": '5D2-D5 (D2)',
  "Personnel Supervision and Management": '5D2-D5 (D3)'
}
const GlobalQuarters = {
  'Q1': 1,
  'Q2': 2,
  'Q3': 3,
  'Q4': 4
}
const GlobalSemesters = {
  'Spring':	1,
  'Summer': 2,
  'Fall': 3,
  'Winter': 4
}
const ContentHourEditionTable = {
  'Third Edition': 3,
  'Fourth Edition': 4,
  'Fifth Edition': 5
}

const UNIQUE_INSTITUTIONS = new Object();
const KEY_INSTITUTION = {};
function GET_KEY_INSTITUTION(crmid) {
  return KEY_INSTITUTION[crmid]['duplicate'] ? KEY_INSTITUTION[KEY_INSTITUTION[crmid]['duplicate']] : KEY_INSTITUTION[crmid];
}
const KEY_DEPARTMENT = {};
const KEY_COURSE = {};
const KEY_CONTENT_HOUR = {};
const KEY_ALLOCATION_HOUR = {};

const ABAI_INSTITUTION = {};
const ABAI_DEPARTMENT = {};
const ABAI_INSTITUTION_ADDRESS = {};
const ABAI_COORDINATOR = {};
const ABAI_COURSE_SEQUENCE = {};
const ABAI_COURSE = {};
const RC_COORDINATOR = {};
const ABAI_AP_WAIVER = {};
const ABAI_INSTRUCTOR = {};
const ABAI_ASSIGNMENT = {};
const ABAI_ASSIGNMENT_XREF = {};
const ABAI_ALT_ID = {};
const ABAI_CONTENT_HOURS = {};
const ABAI_ALLOCATION_HOURS = {};

const ABAI_XREF = { // Eat my garbage excess data, NetSuite
  InternalId: {},
  CourseSequence: {},
  Institution: {},
  CourseToCourseSequence: {}
};

// Runtime Table Dictionaries
const ABAI_MAPPED_RC_INSTITUTIONS = {};
const RC_INSTITUTIONS = {};
const RC_INSTITUTION_ADDRESS = {};
const RC_DEPARTMENTS = {}; // Logged by RC ID
const RC_COURSE = {};
const RC_COURSE_BY_ASSGN = {};
const RC_CONTENT_HOURS = {};
const RC_CONTENT_HOURS_PK = {};
const RC_ALLOCATION_HOURS = {};
const RC_FINAL = {};

////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Point ///////
////////////////////////////////////////////////////

function MainScript() {
  debug('');
  audit('MainScript', '======START======');
  processFile( '12007322', 'InstitutionKeys', parseInstitutionKey, KEY_INSTITUTION);
  processFile( '12007336', 'DepartmentKeys', parseDepartmentKey, KEY_DEPARTMENT);
  processFile( '12007337', 'CourseKeys', parseCourseKey, KEY_COURSE);
  processFile( '12007330', 'ContentHourKeys', parseContentHourKey, KEY_CONTENT_HOUR);
  processFile( '12007324', 'AllocHourKeys', parseAllocationHourKey, KEY_ALLOCATION_HOUR);

  processFile( '12044192', ABAI_TABLES.INSTITUTION, parseInstitution, ABAI_INSTITUTION, 'institution');
  // processFile( '11872436','depo', parseDepo, ABAI_DEPARTMENT );
  processFile( '12044197',ABAI_TABLES.INSTITUTION_ADDRESS, parseInstitutionAddress, ABAI_INSTITUTION_ADDRESS, 'institution_address');
  processFile( '12044188',ABAI_TABLES.COORDINATOR, parseCoordinator, ABAI_COORDINATOR, 'coordinator');
  processFile( '12044190',ABAI_TABLES.COURSE_SEQUENCE, parseCourseSequence, ABAI_COURSE_SEQUENCE, 'course_sequence');
  processFile( '12044191',ABAI_TABLES.COURSE, parseCourse, ABAI_COURSE, 'course');
  processFile( '12044189', ABAI_TABLES.APWAIVER, parseApWaiver, ABAI_AP_WAIVER, 'ap_waiver');
  // processFile( 'asdf',ABAI_TABLES.INSTRUCTOR_GROUP, parseInstructor, ABAI_INSTRUCTOR);
  processFile( '12044196',ABAI_TABLES.COURSE_ASSIGNEMNT, parseAssignment, ABAI_ASSIGNMENT, 'course_sequence_course_assignment');
  processFile( '12044195', ABAI_TABLES.ALT_COURSE_ID, parseAltCourseId, ABAI_ALT_ID, 'alternative_courseID');
  processFile( '12044194',ABAI_TABLES.CONTENT_HOURS, parseContentHours, ABAI_CONTENT_HOURS, 'content_hours');
  processFile( '12044193', ABAI_TABLES.ALLOCATION, parseAllocation, ABAI_ALLOCATION_HOURS, 'content_area_hours_allocation');
  audit('MainScript', 'FILE LOAD COMPLETE');
  audit('MainScript', '=======END=======');
}

function MainScript_RC() {
  debug('');
  debug('======RC DATA START======');
  // // Functional calls
  // processAbaiToRcRecord( RC_TABLES.INSTITUTION, ABAI_INSTITUTION, KEY_INSTITUTION, getRcInstitutionData);
  // processAbaiToRcRecord( RC_TABLES.DEPARTMENT, ABAI_COURSE_SEQUENCE, KEY_DEPARTMENT, getRcDepartmentData);
  // processAbaiToRcRecord( RC_TABLES.COURSE, ABAI_ASSIGNMENT, KEY_COURSE, getBetterRcCourseData);
  // // goddamncouldthisbemoredifficult();
  // processAbaiToRcRecord( RC_TABLES.CONTENT_HOURS, ABAI_CONTENT_HOURS, KEY_CONTENT_HOUR, getRcContentHoursData);
  // processAbaiToRcRecord( RC_TABLES.ALLOCATION_HOURS,ABAI_ALLOCATION_HOURS, KEY_ALLOCATION_HOUR, getRcAllocationHoursData);

  // Unfinished
  // okaybutyoudonthavetoyell();
  // processAbaiToRcRecord( RC_TABLES.INSTITUTION_ADDRESS, ABAI_INSTITUTION_ADDRESS, RC_INSTITUTION_ADDRESS, getRcInstitutionAddressData, translateInstitutionAddress);
  // processAbaiToRcRecord( RC_TABLES.COORDINATOR, ABAI_COORDINATOR, RC_COORDINATOR, getRcCoordinatorData, skip);
  processFinalRecord();
  audit('bad course', BAD_COURSE)
  audit('SCH_ABAI_TO_RC', '=======SCH_RC_ProcessData END========');
}


function okaybutyoudonthavetoyell() {
  var SET_TO = 'T';
  var count = 0;
  var arrFilters = [new nlobjSearchFilter('custrecord_rc_cntntarea_hrs_alloc_crm_id', null, 'isnot', ''),
  new nlobjSearchFilter('custrecord_checksum', null, 'isnot', SET_TO)];
  var arrColumns = [new nlobjSearchColumn('custrecord_rc_cntntarea_hrs_alloc_crm_id'),
  new nlobjSearchColumn('custrecord_checksum')];
  var searchResults = nlapiSearchRecord('customrecord_rc_hour_allocation', null, arrFilters, arrColumns);
  while (searchResults) {
    if ( count > 10000 ) {
      break;
    }
    nlapiLogExecution('DEBUG', 'Observing', searchResults.length + ' records');
    for ( var index in searchResults ) {
      // nlapiLogExecution('DEBUG', 'Deleted', count + ' records');
      if ( index % 100 == 0 ) {
        check_governance();
        nlapiLogExecution('DEBUG', 'RECORD', JSON.stringify(
          // ABAI_ALLOCATION_HOURS[searchResults[index].getValue(arrColumns[0])]
          searchResults[index]
        ));
        // nlapiLogExecution('AUDIT', 'Record', JSON.stringify(search[index]))
        nlapiLogExecution('DEBUG', 'Observed', count + ' records');
      }
      var temp = nlapiLoadRecord('customrecord_rc_hour_allocation', searchResults[index].getId());
      if ( temp['custrecord_checksum'] == SET_TO ) {
        searchResults = null;
        continue;
      }
      temp.setFieldValue('custrecord_checksum', SET_TO)
      nlapiSubmitRecord(temp);
      count += 1;
    }
    searchResults = nlapiSearchRecord('customrecord_rc_hour_allocation', null, arrFilters, arrColumns);
  }
}

function goddamncouldthisbemoredifficult() {
  var fileid = 'ContentHoursCsvForMatching.csv';
  var content = '"externalid","CourseCrm","RcCourse"\n';
  var dict = {};
  for( var index in ABAI_CONTENT_HOURS ) {
    var pKey = ABAI_CONTENT_HOURS[index]['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'];
    pKey += ' ';
    pKey += ABAI_CONTENT_HOURS[index]['SEQUENCE']['fuckingEdition'];
    pKey += (ABAI_CONTENT_HOURS[index]['custrecord_cnt_hrs_activ_strt_date'] ? ' ' + ABAI_CONTENT_HOURS[index]['custrecord_cnt_hrs_activ_strt_date'] : '');

    dict[pKey] = {
      'externalid': pKey,
      'crm': ABAI_CONTENT_HOURS[index]['externalid'], // warning - this is for diagnostic only
      'CourseCrm': ABAI_CONTENT_HOURS[index]['COURSE']['externalid'],
      'RcCourse': KEY_COURSE[ABAI_CONTENT_HOURS[index]['COURSE']['externalid']]['internalid']
    }
  }
  for( var index in dict ) {
    content += '\"' + dict[index]['externalid'] + '\",';
    content += '\"' + dict[index]['CourseCrm'] + '\",';
    content += '\"' + dict[index]['RcCourse'] + '\"\n';
  }
  var file = nlapiCreateFile(fileid, 'PLAINTEXT', content);
  file.setFolder(ABAI_INTEGRATION_FILE_ID);
  file.setEncoding('UTF-8');
  debug('submitting file')
  nlapiSubmitFile(file);
}


////////////////////////////////////////////////////
////////// SECTION: Helper/Generic Functions ///////
////////////////////////////////////////////////////

var errorCount = 0;
function processFile(fileId, recordType,  parseFunction, storage, preserveFile) {
  var once = true;
  if ( !fileId ) {
    error(recordType, 'fileId is null');
    return;
  }
  // audit('processFile', 'Starting: ' + recordType)
  var count = 0;
  var fileContent = nlapiLoadFile(fileId).getValue().split(/\n|\n\r/);;

  if ( fileContent ) {
    for ( var line = 1; line < fileContent.length; line++ ) {
      check_governance();
      if (!( fileContent[line] )) {
        continue;
      }
      var dataContent = CSVToArray(fileContent[line])[0];
      if ( !dataContent[0] || dataContent[0] == ' ' ) {
        debug('YEEEET');
        continue;
      }
      if ( dataContent ) {
        var tempRecord = parseFunction( dataContent );
        if ( recordType == 'customrecord_course_sequence' ) {
          ABAI_XREF.CourseSequence[tempRecord['externalid']] = tempRecord
        }
        if ( recordType == 'customrecord_crse_seqnc_crse_assignmnt' ) {
          ABAI_XREF.CourseToCourseSequence[tempRecord['custrecord_crse_seq_crse_asign_crse']] = tempRecord;
        }
        storage[tempRecord['externalid']] = tempRecord;
        if ( once ) {
          audit(recordType, JSON.stringify(tempRecord));
          once = false;
        }
        count += 1;
      }
    }
  }
  fileContent = null;
  if ( preserveFile ) {
    var day = startdate.getDate();
    var month = startdate.getMonth()+1;
    var year  = startdate.getFullYear();
    var timeinMili = startdate.getTime();

    var fullName = preserveFile+'_'+day.toString()+month.toString()+year.toString()+'_'+timeinMili+'.csv';
    var saveFile = nlapiCreateFile(
      fullName, 'CSV', nlapiLoadFile(fileId).getValue()
    )
    saveFile.setFolder('10325841');
    saveFile.setEncoding('UTF-8');
    nlapiSubmitFile(saveFile);
    saveFile = null;
  }
  // debug(count + ' abai elements loaded');
  // audit('processFile', recordType + ' processing complete');
}

/**
 * Takes the ABAI records and matches/updates the associated RC table values
 * @param {RC_Table} rcTableInfo - info for the Record(table) we are processing
 * @param {ResultSet} abaiResultSet - data from saved search
 * @param {array} rcData - Array of RC records for parsing
 * @param {function} abaiFormatter - function to convert ABAI data to setField array object
 */
function processAbaiToRcRecord(
  // Data
  rcTableInfo, abaiResultSet, keySet,
  // Callback Functions
  abaiFormatter
) {
  audit('','')
  audit('======START======',rcTableInfo.Title);
  var savedRecords = [];
  if ( abaiResultSet.length == 0 ) {
    debug('No ABAI data for ' + rcTableInfo.Title);
  }
  for ( var abaiIndex in abaiResultSet ) {
    try {
      if ( testCase ) {
        debug(JSON.stringify(abaiResultSet[abaiIndex]))
        testCase = false;
      }
      var temp = abaiFormatter( abaiResultSet[abaiIndex]);
    }
    catch ( ex ) {
      throw(ex)
    }
    if ( temp ) {
      savedRecords.push(temp);
    }
  }
  testCase = true;

  FinallySaveAsRecords(savedRecords, rcTableInfo, keySet);
  SaveAllKeys(rcTableInfo, keySet);
  audit('=======END=======',rcTableInfo.Title);
}

function FinallySaveAsRecords(savedRecords, rcTableInfo, keySet) {
  var index;
  var count = 0;
  var firstone = true;
  try {
    for ( index in savedRecords ) {
      if ( count % 100 == 0 ) {
        // audit('count', count);
        check_governance();
      }
      count += 1;
      var tempRecord;
      var mustBeAdded = false;
      // throw(savedRecords[index]['internalid'])
      if ( savedRecords[index]['internalid'] && savedRecords[index]['internalid'] != '0' ) {
        tempRecord = nlapiLoadRecord(rcTableInfo.Title, savedRecords[index]['internalid']);
      }
      else {
        tempRecord = nlapiCreateRecord(rcTableInfo.Title);
        // if ( rcTableInfo.Title == 'customrecord_rc_hour_allocation'){
        //   throw(JSON.stringify(savedRecords[index]))
        // }
        rcTableInfo.Misses += 1;
        mustBeAdded = true;
      }
      for ( var key in savedRecords[index] ) {
        if ( savedRecords[index]['internalid'] == '' && key == 'internalid' ) {
          // audit('continue', JSON.stringify(savedRecords[index]))
          continue;
        }
        tempRecord.setFieldValue(key, savedRecords[index][key]);
      }
      if ( mustBeAdded && rcTableInfo.Title == 'customrecord_rc_department' && keySet[savedRecords[index]['externalid']]) {
        // ABAI likes to send duplicates of everything, but if we have a Institution-Department name match already,
        // we can skip this record
        // debug('got the bastard');
        continue;
      }
      // We need to check against CREATE objects before and after we actually submit the record, IDK a better way
      try {
        var savedID = nlapiSubmitRecord(tempRecord);
      }
      catch (ex) {
        duplicates += 1;
      }

      if ( mustBeAdded ) {
        // var savedID = nlapiSubmitRecord(tempRecord); // this shouldn't really go here except to quick add while testing
        rcTableInfo.SaveKey(savedRecords[index], savedID);
      }
      tempRecord = null;
      // break;
    }
    audit(rcTableInfo.Title, 'Missed: ' + rcTableInfo.Misses + '/' + count);
  }
  catch (ex) {
    error('Bad Record', JSON.stringify(savedRecords[index]));
    if ( savedRecords[index]['internalid'] ) {
      error('Expected', JSON.stringify(nlapiLoadRecord(rcTableInfo.Title,savedRecords[index]['internalid'] )));
    }
    else {
      error(ex);
    }
    audit(rcTableInfo.Title, 'Missed: ' + rcTableInfo.Misses + '/' + count);
    audit('Courses m/h/t', rcTableInfo.Misses + '/' + rcTableInfo.Hits + '/'+ rcTableInfo.TOTAL);
    // throw (ex);
  }
  audit('Courses m/h/t', rcTableInfo.Misses + '/' + rcTableInfo.Hits + '/'+ rcTableInfo.TOTAL);
  audit('duplicates', duplicates);
}

function SaveAllKeys(rcTableInfo, keySet) {
  var contents = rcTableInfo.KEYS;
  for ( var index in keySet ) {
    for ( var value in keySet[index] ) {
      contents += '\"' + keySet[index][value] + '\",';
    }
    contents += '\n';
  }
  var file = nlapiCreateFile(rcTableInfo.KeyFile, 'PLAINTEXT', contents);
  file.setFolder(ABAI_INTEGRATION_FILE_ID);
  file.setEncoding('UTF-8');
  debug('submitting file')
  nlapiSubmitFile(file);
}



// LOG functions
function audit(title, message) { if ( PRINT_AUDIT_MESSAGES) cust_log('AUDIT',title, message); }
function debug(message) { if ( PRINT_DEBUG_MESSAGES ) cust_log('AUDIT',LOG_TITLE, message); }
function error(title, message) { cust_log('AUDIT',title + ' ERROR', message); }
function cust_log(type, title, message) {
  nlapiLogExecution(type, title, message);
}
function websiteFix(data, index) {
  var website = data[index];
  if ( !website ) {
    return '';
  }
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

////////////////////////////////////////////////////
/////// SECTION: Main RC Script Functions //////////
////////////////////////////////////////////////////
function translateInstitution(abaiSearchId, rcData) {
  var result = ABAI_INSTITUTION[abaiSearchId];
  return result ? result['custrecord_uniq_instn_name'] : miss(RC_TABLES.INSTITUTION);
}
function translateInstitutionAddress(abaiSearchId, rcData) {
  return miss(RC_TABLES.INSTITUTION_ADDRESS); // FIXME
}
function translateDepartment(abaiSearchId, rcData) {
  var result = ABAI_COURSE_SEQUENCE[abaiSearchId];
  return result ? result['custrecord_course_sequence_department'] : miss(RC_TABLES.DEPARTMENT);
}
function translateCourse(abaiSearchId, rcData) {
  var result = RC_COURSE[abaiSearchId];
  return result ? result['internalid'] : miss(RC_TABLES.COURSE);
}
function translateContentHour(abaiSearchId, rcData) {
  return miss(RC_TABLES.CONTENT_HOURS); // FIXME
}
function translateAllocationHour(abaiSearchId, rcData) {
  return miss(RC_TABLES.ALLOCATION_HOURS);; // FIXME
}
function skip() {
  return;
}
function getRcInstitutionData(abaiData) {
  // Watch me append that new value into a static dictionary and also return it AT THE SAME TIME
  var instName = abaiData['custrecord_insttn_name'];
  var uniqueName = abaiData['custrecord_uniq_instn_name'];
  var internalid = KEY_INSTITUTION[abaiData['externalid']] ? KEY_INSTITUTION[abaiData['externalid']]['internalid'] : '';
  return ABAI_MAPPED_RC_INSTITUTIONS[abaiData['externalid']] = {
    'internalid': internalid,
    'custrecord_rc_instn_rm_id': abaiData['externalid'],
    'custrecord_rc_inst_credit_system': abaiData['custrecord_bacb_insti_cred_sys'],
    'custrecord_rc_inst_accrediting_body': abaiData['custrecord_bacb_insti_accr_body'],
    'custrecord_rc_inst_website': abaiData['custrecord_institn_website'],
    'custrecord_rc_inst_name': uniqueName ? uniqueName : instName,
  }
}
function getRcInstitutionAddressData(abaiData) {
  return {
    'externalid': abaiData['externalid'],
    'custrecord_rc_inst_add_inst': ABAI_INSTITUTION[abaiData['custrecord_instn_addr_inst_id']][ 'custrecord_uniq_instn_name' ],
    'custrecord_rc_inst_addr_crm_id': abaiData['custrecord_institutn_addr_crm_id'],
    'custrecord_rc_inst_add_address1': abaiData['custrecord_instn_addr_addr_line1'],
    'custrecord_rc_inst_add_address2': abaiData['custrecord_instn_addr_addr_line2'],
    'custrecord_rc_inst_add_city': abaiData['custrecord_instn_addr_city'],
    'custrecord_rc_inst_add_state': abaiData['custrecord_instn_addr_state_provnc'],
    'custrecord_rc_inst_add_country': abaiData['custrecord_instn_addr_country'],
    'custrecord_rc_inst_add_postal_code': abaiData['custrecord_instn_addr_postal_code'],
  }
}
function getRcCoordinatorData(abaiData) {
  return {
    'externalid': abaiData['externalid'],
    'coordinator_crm_identifier': abaiData['custrecord_coordinator_crm_identifier'],
    'custrecord_coordinator_bacb_id': abaiData['custrecord_coordinator_bacb_id'],
    'custrecord_coordinatr_first_name': abaiData['custrecord_coordinatr_first_name'],
    'custrecord_coordinatr_middle_name': abaiData['custrecord_coordinatr_middle_name'],
    'custrecord_coordinatr_last_name': abaiData['custrecord_coordinatr_last_name'],
    'custrecord_coordinator_email': abaiData['custrecord_coordinator_email'],
    'custrecord_coordinator_cordtr_flag': abaiData['custrecord_coordinator_cordtr_flag'],
    'custrecord_cordntr_non_cerfd_flg': abaiData['custrecord_cordntr_non_cerfd_flg'],
    'last_modified': abaiData['last_modified'],
    'coordinator_status': abaiData['coordinator_status']
  }
}
function getRcDepartmentData(abaiData) {
  try{
    return RC_DEPARTMENTS[abaiData['DepartmentExternalid']] = {
      'externalid': abaiData['DepartmentExternalid'],
      'custrecord_rc_depart_name': abaiData['crse_seq_department_name']? abaiData['crse_seq_department_name'] : 'UnNamedDepartment',
      'custrecord_rc_dept_institution_name': abaiData['custrecord_crse_seq_institutn']['custrecord_insttn_name'],
      'custrecord_rc_depart_institution': abaiData['custrecord_crse_seq_unique_institutn']['internalid'],
      'internalid': abaiData['custrecord_crse_seq_departmnt']['internalid'],
      'sequence_crm': abaiData['externalid'],
      'InstitutionCRM': abaiData['custrecord_crse_seq_unique_institutn']['externalid']
    }
  }
  catch (ex) {
    error('dept miss', JSON.stringify(abaiData));
    return RC_DEPARTMENTS[abaiData['externalid']] = {
      'externalid': abaiData['DepartmentExternalid'],
      'custrecord_rc_depart_name':  abaiData['crse_seq_department_name']? abaiData['crse_seq_department_name'] : 'UnNamedDepartment',
      'custrecord_rc_dept_institution_name': abaiData['custrecord_crse_seq_institutn']['custrecord_insttn_name'],
      'custrecord_rc_depart_institution': abaiData['custrecord_crse_seq_unique_institutn']['internalid'],
      'internalid': '',
      'sequence_crm': abaiData['externalid'],
      'InstitutionCRM': abaiData['custrecord_crse_seq_unique_institutn']['externalid']
    }
  }
}

function getRcCourseData(abaiData) {
  var RcCourse = KEY_COURSE[abaiData['externalid']];
  RC_TABLES.COURSE.TOTAL += 1;
  if ( !RcCourse ) {
    abaiData['internalid'] = '';
  }
  else {
    abaiData['internalid'] = RcCourse['internalid'];
  }
  var crsassCRM = ABAI_XREF.CourseToCourseSequence[abaiData['externalid']]['externalid'];
  var rcDepartmentId = ABAI_XREF.CourseToCourseSequence[abaiData['externalid']]['custrecord_crse_seq_crse_asign_crseseqnc']['externalid'];
  var alterations = '';
  for ( var key in abaiData['alterations'] ) {
    alterations += '{'+ abaiData['alterations'][key]['custrecord_altnte_crse_id_type'] + ':' + abaiData['alterations'][key]['custrecord_altnte_crse_id_value'] + '}';
  }
  return RC_COURSE[abaiData['externalid']] = {
    // Set all normal values
    'internalid': abaiData['internalid'],
    'custrecord_rc_crse_crm_id': abaiData['custrecord_course_crm_identifier'],
    'externalid': abaiData['custrecord_course_crm_identifier'],
    'custrecord_rc_course_title': abaiData['custrecord_course_title'].replace(/\"/g, ''),
    'custrecord_rc_course_number': abaiData['custrecord_course_number'],
    'custrecord_rc_course_credit_level': abaiData['custrecord_course_credit_level'],
    'custrecord_rc_course_credit_hours': abaiData['custrecord_course_credit_hours'],
    'custrecord_rc_course_instruction_mode': abaiData['custrecord_course_mode_of_instrctn'],
    'COURSE_SEQUENCE_COURSE_ASIGNMENT_CRM_ID': crsassCRM,
    'custrecord_rc_course_institution_name_uniq': abaiData['custrecord_course_institutn_id']['custrecord_uniq_instn_name'],
    'custrecord_rc_course_institution_name': abaiData['custrecord_course_institutn_id']['custrecord_insttn_name'],
    'custrecord_rc_course_inst': abaiData['custrecord_rc_course_dept']['InstitutionId'],
    'custrecord_rc_course_dept': KEY_DEPARTMENT[abaiData['custrecord_rc_course_dept']['externalid']]['internalid'],
    'rc_course_alterations': alterations
  }
}

function getBetterRcCourseData(abaiData /* NOT COURSE, IT TAKES CrsAssign */) {
  try{
    var course = ABAI_COURSE[abaiData['custrecord_crse_seq_crse_asign_crse']];
    var sequence = abaiData['custrecord_crse_seq_crse_asign_crseseqnc'];
    var internalid = KEY_COURSE[course['externalid']] ? KEY_COURSE[course['externalid']]['internalid'] : '';
    // if ( KEY_COURSE[course['externalid']]) {
    //   audit('COURSE KEY', JSON.stringify(internalid))
    // }
    // else {
    //   audit('no course', abaiData['externalid']);
    // }
    return RC_COURSE_BY_ASSGN[abaiData['externalid']] = {
      'custrecord_rc_crse_crm_id': course['custrecord_course_crm_identifier'],
      'externalid': course['custrecord_course_crm_identifier'],
      'custrecord_rc_course_title': course['custrecord_course_title'],
      'custrecord_rc_course_number': course['custrecord_course_number'],
      'custrecord_rc_course_credit_level': course['custrecord_course_credit_level'] == 'Graduate' ? '2' : '1',
      'custrecord_rc_course_credit_hours': course['custrecord_course_credit_hours'],
      // 'custrecord_rc_course_instruction_mode': course['custrecord_course_mode_of_instrctn'],
      'custrecord_rc_course_dept': sequence['custrecord_crse_seq_departmnt']['internalid'],
      'custrecord_rc_course_institution': sequence['custrecord_crse_seq_unique_institutn']['internalid'],
      'custrecord_rc_course_edition': sequence['fuckingEdition'],
      'custrecord_rc_course_crs_seq_crs_ass_crm': abaiData['externalid'],
      'internalid': internalid,
      'custrecord_rc_course_type': 'VCS (Verified)'

      // 'custrecord_crse_seq_crm_id': sequence['externalid'],
      // 'custrecord_crse_seq_departmnt': sequence['custrecord_crse_seq_departmnt'],
      // 'custrecord_crse_seq_apprvl_level': sequence['custrecord_crse_seq_apprvl_level'],
      // 'custrecord_inst_crm_id': sequence['custrecord_crse_seq_institutn']['externalid'],
      // 'custrecord_inst_name': sequence['custrecord_crse_seq_institutn']['custrecord_insttn_name'],

      // 'custrecord_crse_seq_name': sequence['name']
    }
  }
  catch (ex)
 {
   error('course error', JSON.stringify(abaiData));
   throw(ex)
 }
}

function getRcContentHoursData(abaiData) {
  var primaryKey = abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'] + ' ' + abaiData['SEQUENCE']['fuckingEdition'];
  if ( abaiData['custrecord_cnt_hrs_activ_strt_date'] ) {
    primaryKey += ' ';
    primaryKey += abaiData['custrecord_cnt_hrs_activ_strt_date']
  }
  // throw(primaryKey)
  RC_CONTENT_HOURS_PK[abaiData['externalid']] = {
    key: primaryKey,
    value: 0
  };
  var internalid = KEY_CONTENT_HOUR[primaryKey] ? KEY_CONTENT_HOUR[primaryKey]['internalid'] : '';// KEY_CONTENT_HOUR[primaryKey]['internalid'] : '';

  if ( RC_CONTENT_HOURS[primaryKey] ){
    duplicates += 1;
  }
  else {
    return RC_CONTENT_HOURS[primaryKey] = {
      'internalid': internalid,
      'externalid': primaryKey,
      'custrecord_rc_cnthrs_crm_id': abaiData['custrecord_content_hrs_crm_identifier'],
      'custrecord_rc_content_hr_edition': ContentHourEditionTable[abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['custrecord_crse_seq_crse_asign_crseseqnc']['fuckingEdition']],
      'fuckingEdition': abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['custrecord_crse_seq_crse_asign_crseseqnc']['fuckingEdition'],
      // Use XREF to get the courseID that links the RC_course dictionary, then get RC.internalid
      'custrecord_rc_content_hr_course': KEY_COURSE[abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['custrecord_crse_seq_crse_asign_crse']]['internalid'],
      'custrecord_rc_content_hr_start_date': stripEnd(abaiData['custrecord_cnt_hrs_activ_strt_date']),
      'fuckingStartDate': abaiData['custrecord_cnt_hrs_activ_strt_date'],
      'custrecord_rc_content_hr_end_date': stripEnd(abaiData['custrecord_cnt_hrs_activ_end_date']),
      'custrecord_rc_content_hr_start_year': yearSubstring(checkNull(abaiData['custrecord_cnt_hrs_activ_strt_year'])),
      'custrecord_rc_content_hr_end_year': yearSubstring(checkNull(abaiData['custrecord_cnt_hrs_activ_end_year'])),
      // 'custrecord_rc_content_hr_start_qtr': GlobalQuarters[abaiData['custrecord_cnt_hrs_activ_strt_quar']],
      // 'custrecord_rc_content_hr_end_qtr': GlobalQuarters[abaiData['custrecord_cnt_hrs_activ_end_quar']],
      // 'custrecord_rc_content_hr_start_sem': GlobalSemesters[abaiData['custrecord_cnt_hrs_activ_strt_sem']],
      // 'custrecord_rc_content_hr_end_sem': GlobalSemesters[abaiData['custrecord_cnt_hrs_activ_end_sem']],
      'customrecord_rc_crs_seq_crs_assgn_crm_id': abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'],
      'COURSE_CRM': abaiData['COURSE']['externalid'],
      'SEQUENCE_CRM': abaiData['SEQUENCE']['externalid'],
      'INSTITUTION_ID_internal': abaiData['SEQUENCE']['custrecord_crse_seq_institutn']['internalid'],
      'INSTITUTION_CRM': abaiData['SEQUENCE']['custrecord_crse_seq_institutn']['external'],
      'Allocations': []
    }
  }
}

function getRcAllocationHoursData(abaiData) {
  // throw(JSON.stringify(abaiData))
  var pkey = abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'] + ' ' + abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['SEQUENCE']['fuckingEdition'];
  if ( abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['custrecord_cnt_hrs_activ_strt_date'] ) {
    pkey += ' ';
    pkey += abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['custrecord_cnt_hrs_activ_strt_date']
  }
  var allocPrimaryKey = pkey + AllocTypeTable[abaiData['custrecord_cnt_area_hrs_allctn_type']];
  var internalid = KEY_ALLOCATION_HOUR[allocPrimaryKey] ? KEY_ALLOCATION_HOUR[allocPrimaryKey]['internalid'] : '';

  var allocation = {
    'internalid': internalid,
    'externalid': pkey + AllocTypeTable[abaiData['custrecord_cnt_area_hrs_allctn_type']],
    'custrecord_rc_hr_alloc_content_hours': KEY_CONTENT_HOUR[pkey]['internalid'],
    'custrecord_rc_hr_alloc_type': AllocTypeTable[abaiData['custrecord_cnt_area_hrs_allctn_type']],
    'custrecord_rc_hr_alloc_value': abaiData['custrecord_cnt_area_hrs_allctn_value'],
    'custrecord_rc_cntntarea_hrs_alloc_crm_id': abaiData['externalid'],
    'content_hours_pk': pkey,//.key,
    'fuckThisShitImOut': abaiData
  };
  // if ( !internalid ) {
  //   audit('pkey', pkey);
  //   audit('type', AllocTypeTable[abaiData['custrecord_cnt_area_hrs_allctn_type']])
  //   audit('newRecord', JSON.stringify(allocation));
  //   throw(JSON.stringify(abaiData));
  // }
  // FIXME - this is for final data only
  // RC_CONTENT_HOURS[pkey]['Allocations'].push(abaiData);
  return allocation;
}


////////////////////////////////////////////////////
///// SECTION: Main ABAI Script Functions //////////
////////////////////////////////////////////////////

function parseInstitutionKey(data) {
  return {
    'externalid': data[0], // this is whatever CRM gives us
    'internalid': data[1],
    'name': data[2],
    'duplicate': data[3] ? data[3] : ''
  }
}
function addInstitutionKey(data, internalid) {
  KEY_INSTITUTION[data['externalid']] = {
    'externalid': data['externalid'],
    'internalid': internalid,
    'name': data['name'],
    'duplicate': ''
  }
}
function parseDepartmentKey(data) {
  return {
    'externalid': data[0],
    'Department': data[1],
    'internalid': data[2],
    'Institution': data[3],
    'InstitutionId': data[4],
    'InstitutionCRM': data[5]
  }
}
function addDeparmentKey(data, internalid) {
  KEY_DEPARTMENT[data['externalid']] = {
    'externalid': data['externalid'],
    'Department': data['custrecord_rc_dept_institution_name'],
    'internalid': internalid,
    'Institution': data['custrecord_rc_dept_institution_name'],
    'InstitutionId': data['custrecord_rc_depart_institution'],
    'InstitutionCRM': data['InstitutionCRM']
  }
}
function parseCourseKey(data) {
  return {
    'externalid': data[0],
    'internalid': data[1],
    'RcDepartment': data[2],
    'custrecord_rc_course_title': data[3],
  }
}
function addCourseKey(data, internalid) {
  KEY_COURSE[data['externalid']] = {
    'externalid': data['externalid'],
    'internalid': internalid,
    'RcDepartment': data['custrecord_rc_course_dept'],
    'custrecord_rc_course_title': data['custrecord_rc_course_title']
  }
}
function parseContentHourKey(data) {
    return  { // Reminder - Externalid is not CRM - "SequenceAssignmentCRM + Edition + StartDate"
      'externalid': data[0],
      'internalid': data[1],
      'CourseCrm': data[2],
      'RcCourse': data[3]
    }
}
function addContentHourKey(data, internalid) {
  // debug(JSON.stringify(data))
  try {
    var primaryKey = data['customrecord_rc_crs_seq_crs_assgn_crm_id'] + ' '
      + data['fuckingEdition'];
    if ( data['fuckingStartDate'] ) {
      primaryKey += ' ';
      primaryKey += data['fuckingStartDate']
    }
      // + (data['fuckingStartDate'] ? ' ' + data['fuckingStartDate'] : '');
    KEY_CONTENT_HOUR[primaryKey] = {
      'externalid': primaryKey,
      'internalid': internalid,
      'CourseCrm': data['COURSE_CRM'],
      'RcCourse': KEY_COURSE[data['COURSE_CRM']]['internalid']
    }
  }
  catch (ex) {
    // audit('bad Ch key issue', JSON.stringify(data))
    // throw(ex)
    BAD_COURSE += 1;
  }

}
function parseAllocationHourKey(data) {
  // externalid	Internal ID	Content Hours	Date Created	Content Area Hours Allocation CRM ID
  return {
    'externalid': data[0],
    'internalid': data[1],
    'RcContentHour': data[2],
    'ContentHourExternalid': data[3],
    'RcCourse': data[4],
    'AllocationCRM': data[5]
  }
}
function addAllocationHourKey(data, internalid) {
  // throw(JSON.stringify(data));
  var contentHour = data['fuckThisShitImOut']['custrecord_cnt_area_hrs_allctn_cnt_hrs'];
  var primaryKey = contentHour['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'] + ' ' + contentHour['SEQUENCE']['fuckingEdition'];
  if ( contentHour['custrecord_cnt_hrs_activ_strt_date'] ) {
    primaryKey += ' ';
    primaryKey += contentHour['custrecord_cnt_hrs_activ_strt_date']
  }
  try {
    KEY_ALLOCATION_HOUR[data['externalid']] = {
      'externalid': data['externalid'],
      'internalid': internalid,
      'RcContentHour': KEY_CONTENT_HOUR[primaryKey]['internalid'],
      'ContentHourExternalid': primaryKey,
      'RcCourse': KEY_COURSE[contentHour['COURSE']['externalid']]['internalid'],
      'AllocCrm': data['fuckThisShitImOut']['externalid']
    }
  } catch (ex) {
    audit('AddAllocFail', JSON.stringify(data));
    // throw(ex);
  }
}

function parseInstitution(data) {
  // Headers: ID,Name,Credit_System,Accrediting_Body,WebSite,Last_Modified,Status
  // debug(JSON.stringify(KEY_INSTITUTION[data[0]]));
  try {
    var mainInstId = KEY_INSTITUTION[data[0]]['duplicate'];
  }
  catch (ex) {
    audit('fucking here', JSON.stringify(data));
    audit(data[0], JSON.stringify(KEY_INSTITUTION[data[0]]));
    // throw(ex)
  }
  return {
    'id': mainInstId ? KEY_INSTITUTION[mainInstId]['internalid']: '',
    'externalid': data[0],
    'custrecord_institn_crm_identifier': data[0],
    'custrecord_insttn_name': data[1],
    'custrecord_bacb_insti_cred_sys': data[2],
    'custrecord_bacb_insti_accr_body': data[3],
    'custrecord_institn_website': '',
    'custrecord_uniq_instn_name': mainInstId ? KEY_INSTITUTION[mainInstId]['name']: data[1],
    'custrecord_uniq_instn_id': mainInstId ? KEY_INSTITUTION[mainInstId]['externalid']: data[0],
  }
}

// This needs to map all course sequences to the available Keys in KEY_DEPARTMENT
// function parseDepo(data) {
//   var institution = KEY_INSTITUTION[data[3]];
//   // we need the actual ID and there are 1:N garbages
//   var uniqueInstitution = institution['duplicate']
//     ? KEY_INSTITUTION[institution['duplicate']]: institution;
//   var department = KEY_DEPARTMENT[uniqueInstitution['externalid'] + data[5]];
//   audit(data[3] + data[5] + '-' + data[0], JSON.stringify(department));

//   return {
//     'internalid': department ? department['internalid']: '',
//     'custrecord_rc_depart_institution': uniqueInstitution ? uniqueInstitution['internalid']: '',
//     'externalid': data[3] + data[5],
//     'custrecord_rc_dept_institution_name': uniqueInstitution['name'],
//     'instcrm': data[3],
//     'custrecord_rc_depart_name': data[5],
//   }
// }
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
  var institution = KEY_INSTITUTION[data[3]];
  if ( !institution ) {
    error( 'missed CS', JSON.stringify(data) );
    institution = [];
  }
  // we need the actual ID and there are 1:N garbages
  var uniqueInstitution = institution['duplicate']
    ? KEY_INSTITUTION[institution['duplicate']]: institution;
  var deptName = data[5] ? data[5] : 'UnNamedDepartment';
  var department = KEY_DEPARTMENT[ uniqueInstitution['externalid'] + deptName ] ;
  // if ( institution['duplicate']) {
  //   debug('duplicate found on ' + institution['externalid'] + deptName + '#');
  //   audit('uniqueInstitution', JSON.stringify(uniqueInstitution));
  //   audit('uniqueDepartment: ', JSON.stringify(department) );
  // }
  return {
    'externalid': data[0],
    'DepartmentExternalid': uniqueInstitution['externalid'] + (data[5] ? data[5] : 'UnNamedDepartment'),
    'custrecord_crse_seqnc_crm_identifier': data[0],
    'name': data[1],
    'fuckingEdition': data[2],
    'custrecord_crse_seq_institutn': ABAI_INSTITUTION[data[3]],
    'custrecord_crse_seq_unique_institutn': uniqueInstitution,
    'custrecord_crse_seq_coordintr': ABAI_COORDINATOR[data[4]] ? ABAI_COORDINATOR[data[4]]: '',
    'custrecord_crse_seq_departmnt': department,
    'crse_seq_department_name': data[5],
    'custrecord_crse_seq_apprvl_level': data[6],
    'custrecord_crse_seq_acad_strctre': data[7],
    'custrecord_crse_seq_website': websiteFix(data, 8),
  }
}
function parseCoordinator(data) {
  function nsTF(value) {
    return value == '1';
  }
  return {
    'externalid': data[0],
    'custrecord_coordinator_crm_identifier': data[0],
    'custrecord_coordinator_bacb_id': data[1],
    'custrecord_coordinatr_first_name': data[2],
    'custrecord_coordinatr_middle_name': data[3],
    'custrecord_coordinatr_last_name': data[4],
    'custrecord_coordinator_email': data[5],
    'custrecord_coordinator_cordtr_flag': nsTF(data[6]),
    'custrecord_cordntr_non_cerfd_flg': nsTF(data[7]),
    'last_modified': data[8],
    'coordinator_status': data[9]
  }
}
function parseCourse(data) {
  // debug(JSON.stringify(data));
  // throw('big oof');
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
    'custrecord_course_syllabi_name': data[8],
    'alterations': []
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
  return ABAI_ASSIGNMENT_XREF[data[1]] = {
    'externalid': data[0],
    'custrecord_crse_seqnc_crs_assign_crm_id': data[0],
    'custrecord_crse_seq_crse_asign_crse': data[1],
    'custrecord_crse_seq_crse_asign_crseseqnc': ABAI_COURSE_SEQUENCE[data[2]]
  }
}
function parseAltCourseId(data) {
  var temp = {
    'externalid': data[0],
    'custrecord_alternate_crse_crm_identifier': data[0],
    'custrecord_altnte_crse_id_type': data[2],
    'custrecord_altnte_crse_id_crse': data[1],
    'custrecord_altnte_crse_id_value': data[3],
  };
  ABAI_COURSE[data[1]]['alterations'].push(temp);
  return temp;
}
function parseContentHours(data) {
  function nullDate(date) {
    return date;// == 'NULL' ? '' : new Date(date);
  }

  return {
    'externalid': data[0],
    'custrecord_content_hrs_crm_identifier': data[0],
    'custrecord_content_hrs_type': data[2],
    'custrecord_cnt_hrs_crseseq_crseassignmnt': ABAI_ASSIGNMENT[data[1]],
    'COURSE': ABAI_COURSE[ABAI_ASSIGNMENT[data[1]]['custrecord_crse_seq_crse_asign_crse']],
    'SEQUENCE': ABAI_ASSIGNMENT[data[1]]['custrecord_crse_seq_crse_asign_crseseqnc'],
    'custrecord_cnt_hrs_activ_strt_date': (nullDate(data[3])),
    'custrecord_cnt_hrs_activ_end_date': (nullDate(data[4])),
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


function processFinalRecord() {
  function getHours(allocations) {
    var set = Object.assign({
      'A1': '',
      'B1': '',
      'C1': '',
      'C2': '',
      'D1': '',
      'D2': '',
      'D3': '',
      'D4': '',
      'D5': '',
      'E1': '',
      '5A': '',
      '5B (B1)': '',
      '5B (B2)': '',
      '5B (B3)': '',
      '5C1-C2': '',
      '5D1': '',
      '5D2-D5 (D2)': '',
      '5D2-D5 (D3)': '',
    });
    // audit('allocs', JSON.stringify(allocations))
    for ( var key in allocations) {
      set[allocMap[allocations[key]['custrecord_cnt_area_hrs_allctn_type']]] = (allocations[key]['custrecord_cnt_area_hrs_allctn_value']);
    }
    return set;
  }

  function pushFlat(record, recordindex) {

    var course = record['Allocations'][0]['custrecord_cnt_area_hrs_allctn_cnt_hrs']['COURSE'];
    var sequence = record['Allocations'][0]['custrecord_cnt_area_hrs_allctn_cnt_hrs']['SEQUENCE'];
    var alloc = record['Allocations'][0]['custrecord_cnt_area_hrs_allctn_cnt_hrs'];
    var regNum = sequence['name'].match(/^([\w\d])+( )/);
    var regType = sequence['name'].match(/( )(.+)+$/);
    var alterations = '';
    if ( course ) {
      for ( var key in course['alterations'] ) {
        alterations += '{'+ course['alterations'][key]['custrecord_altnte_crse_id_type'] + ':' + course['alterations'][key]['custrecord_altnte_crse_id_value'] + '}';
      }
    }
    if ( !course ) {
      fuckups += 1;
      return {
        id: recordindex
      }
    }

    return Object.assign({
      // id: recordindex,
      'RC Institution': course ? course['custrecord_course_institutn_id']['custrecord_insttn_name'] : '',
      'RC Department': sequence['custrecord_crse_seq_departmnt'],
      'RC Registered Course Name': sequence['name'],
      'VCS #': regNum ? regNum[0] : '',
      'VCS Name': regType ? regType[0]: '',
      'Course Title': course['custrecord_course_title'],
      'Course Number': course['custrecord_course_number'],
      'Course Credit Level': course['custrecord_course_credit_level'],
      'Course Credit Hours': course['custrecord_course_credit_hours'],
      'Edition': sequence['fuckingEdition'],
      'Alternates': alterations,
      'Start Date': checkNull(alloc['custrecord_cnt_hrs_activ_strt_date']),
      'End Date': checkNull(alloc['custrecord_cnt_hrs_activ_end_date']),
      'Start Year': yearSubstring(checkNull(alloc['custrecord_cnt_hrs_activ_strt_year'])),
      'End Year': yearSubstring(checkNull(alloc['custrecord_cnt_hrs_activ_end_year'])),
      'Start Semester': alloc['custrecord_cnt_hrs_activ_strt_sem'] ? alloc['custrecord_cnt_hrs_activ_strt_sem']: '',
      'End Semester': alloc['custrecord_cnt_hrs_activ_end_sem'] ? alloc['custrecord_cnt_hrs_activ_end_sem']: '',
      'Start Quarter': alloc['custrecord_cnt_hrs_activ_strt_quar'] ? alloc['custrecord_cnt_hrs_activ_strt_quar']: '',
      'End Quarter': alloc['custrecord_cnt_hrs_activ_end_quar'] ? alloc['custrecord_cnt_hrs_activ_end_quar'] : '',
      // rc_cntn_hours:
      // data_discrpncy_final_dta: '',

      // third_edition_cr_number: '',

    }, getHours(record['Allocations'])
    )
  }
  var daFlats = [];
  for ( var key in RC_CONTENT_HOURS ) {
    // audit('FLAT', JSON.stringify(RC_CONTENT_HOURS[key]))
    try{
      daFlats.push( pushFlat( RC_CONTENT_HOURS[key], key ) );
    }
    catch(ex) {
      debug( JSON.stringify(RC_CONTENT_HOURS[key]))
      throw(ex);
    }
    // break;
  }
  saveFile(daFlats, 'FINAL_FLAT');
  audit('FLAT COUNT', Object.keys(RC_CONTENT_HOURS).length + ', ' + Object.keys( daFlats ).length);
}



////////////////////////////////////////////////////
////// SECTION: Utility Functions   ////////////////
////////////////////////////////////////////////////

function check_governance() {
  var scheduletime = new Date();
  if ((startdate.getTime() + 3000000) <= scheduletime.getTime()
  || parseInt(nlapiGetContext().getRemainingUsage()) <= 1000)	{
    startdate = new Date();
		nlapiYieldScript();
	}
}
function checkNull(value) {
  var stuff = new Date(value).toLocaleDateString();
  if ( stuff == 'Invalid Date' || stuff == '12/31/1969') {
    return '';
  }
  return  stuff;//value == '12/31/1969' ? '' : new Date(value).toLocaleDateString();
}
function yearSubstring(value) {
  if ( value ) {
    return value.substring(value.length - 4);
  }
  return '';
}
function stripEnd(str) {
  if ( str ) {
    return str.replace(/ .+/, '')
  }
  return '';
}
function CSVToArray(strData, strDelimiter) {
  strDelimiter = strDelimiter || ",";
  var objPattern = new RegExp(
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    '(?:"([^"]*(?:""[^"]*)*)"|' +
    "([^\\" + strDelimiter + "\\r\\n]*))",
    "gi"
  );
  var arrData = [[]];
  var arrMatches = null;
  while ((arrMatches = objPattern.exec(strData))) {
    var strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      arrData.push([]);
    }
    var strMatchedValue;
    if (arrMatches[2]) {
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  return arrData;
}
