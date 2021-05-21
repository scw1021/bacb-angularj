/**
 * IllShowNetSuiteWhatIThinkOfUsageLimits.js
 *
 * v1.0.0
 * 03/05/2020
 * Robert Imbler
 *
 * Scheduled Script:
 *  Processes ABAI hard data into RC CSV files for direct import
 *
 * NOTES:
 *  NetSuite can die in a fire
 *
 */


////////////////////////////////////////////////////
////////// SECTION: Global Parameters //////////////
////////////////////////////////////////////////////
var likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense = '"institution_name","accredtype","accred_inst","institute_crm_id","department_name"\n';
var file = require('fs');
var evaluatedMax = 0;
var duplicates = 0;
var fuckkk = true;
const DELIMITER = ',';
const PRINT_AUDIT_MESSAGES = true;
const PRINT_DEBUG_MESSAGES = true;
var LOG_TITLE = 'ABAI_ProcessData';
var fuckups = 0;

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
    Misses: 0
  },
  INSTITUTION_ADDRESS: {
    Title: 'customrecord_rc_inst_address',
    Columns: ['custrecord_rc_inst_add_inst'],
    // ['', 'custrecord_rc_inst_add_inst'] ],
    Misses: 0
  },
  COORDINATOR: {
    Title: 'customrecord_rc_coordinator',
    Columns: ['custrecord_rc_depart_name','custrecord_rc_depart_institution'],
    Misses: 0
  },
  DEPARTMENT: {
    Title: 'customrecord_rc_department',
    Columns: ['custrecord_rc_depart_name','custrecord_rc_depart_institution'],
    Misses: 0
  },
  COURSE: {
    Title: 'customrecord_rc_course',
    Columns: ['custrecord_rc_crse_crm_id'],
    Misses: 0
  },
  COURSE_adv: {
    Title: 'customrecord_rc_course_advanced',
    Columns: ['custrecord_rc_crse_crm_id'],
    Misses: 0
  },
  CONTENT_HOURS: {
    Title: 'customrecord_rc_content_hours',
    Columns: ['custrecord_rc_content_hr_edition','custrecord_rc_content_hr_course',
    'custrecord_rc_content_hr_start_date','custrecord_rc_content_hr_end_date'],
    Misses: 0
  },
  ALLOCATION_HOURS: {
    Title: 'customrecord_rc_hour_allocation',
    Columns: ['externalid','custrecord_rc_cntntarea_hrs_alloc_crm_id',
    'custrecord_rc_hr_alloc_type','custrecord_rc_hr_alloc_content_hours',
    'custrecord_rc_hr_alloc_value'],
    Misses: 0
  },
};
// const ABAI_TABLES2 = {
//   INSTITUTION: {
//     Title: 'customrecord_institution',
//     Columns: [
//       'externalid', 'custrecord_institn_website', 'custrecord_insttn_name',
//       ['custrecord_unique_name', 'custrecord_uniq_instn_name']
//     ]
//   },
//   SEQUENCE: {
//     Title: 'customrecord_course_sequence',
//     Columns: [
//       'custrecord_crse_seq_institutn',
//       'custrecord_crse_seq_departmnt',
//       'custrecord_course_sequence_department',
//     ]
//   },
//   COURSE_SEQUENCE_XREF: {
//     Title: 'customrecord_crse_seqnc_crse_assignmnt',
//     Columns: [
//       'custrecord_crse_seq_crse_asign_crseseqnc',
//       'custrecord_crse_seq_crse_asign_crse',
//     ]
//   }
// }

const AllocTypeTable = {
  "Ethical & Professional Conduct": 'rc_cntnt_alloc_a1',
  "Concepts & Principles of Behavior Analysis": 'rc_cnt_alloc_b1',
  "Measurement (including data analysis)": 'rc_cntn_alloc_type_c1',
  "Experimental Design": 'rc_cnt_alloc_c2',
  "Identification of the Problem & Assessment": 'rc_cntn_alloc_type_d1',
  "Fundamental Elements of Behavior Change & Specific Behavior Change Procedures": 'rc_cntn_alloc_type_d2',
  "Intervention & Behavior Change Considerations": 'rc_cntn_alloc_type_d3',
  "Behavior Change Systems": 'rc_cntn_alloc_type_d4',
  "Implementation, Management, and Supervision": 'rc_cntn_alloc_type_d5v',
  "Discretionary": 'rc_cntn_alloc_type_e1',
  "BACB Compliance Code and Disciplinary Systems; Professionalism": 'rc_cntn_alloc_type_5av',
  "Philosophical Underpinnings": 'rc_cntn_alloc_type_5d',
  "Concepts & Principles": 'rc_cntn_alloc_type_5g',
  "Philosophical Underpinnings; Concepts & Principles (BCaBA use only)": 'rc_cntn_alloc_type_5h',
  "Measurements, Data Display and Interpretation; Experimental Design": 'rc_cntn_alloc_type_5e',
  "Behavior Assessment": 'rc_cntn_alloc_type_5b',
  "Behavior-Change Procedures; Selecting and Implementing Interventions": 'rc_cntn_alloc_type_5c',
  "Personnel Supervision and Management": 'rc_cntn_alloc_type_5f'
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


const UNIQUE_INSTITUTIONS = new Object();
const ABAI_INSTITUTION = {};
const ABAI_DEPARTMENT = {};
const ABAI_INSTITUTION_ADDRESS = {};
const ABAI_COORDINATOR = {};
const ABAI_COURSE_SEQUENCE = {};
const ABAI_COURSE = {};
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
const RC_COORDINATOR = {};
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
  // processFile( // UNIQUE INSTITUTION
  //   './ABAI_RAW/UNIQUE.csv',
  //   'A Spicy Boy', parseUniqueInstitution, UNIQUE_INSTITUTIONS
  // );
  processFile( // INSTITUTION
    './ABAI_RAW/unique.csv',//abaiBatchRecord[ 'custrecord_institue_fileid' ),
    ABAI_TABLES.INSTITUTION, parseInstitution, ABAI_INSTITUTION,
  );
  // debug(JSON.stringify(ABAI_INSTITUTION));
  file.writeFileSync('./RC_RAW/' + 'fuckthisgarbage' + '.json', JSON.stringify(ABAI_INSTITUTION) );
  processFile( // DEPARTMENT ID
    './ABAI_RAW/NetSuiteInstitution-Department.csv',//abaiBatchRecord[ 'custrecord_institue_fileid' ),
    'depo', parseDepo, ABAI_DEPARTMENT,
  );
  // debug(JSON.stringify(ABAI_INSTITUTION));
  file.writeFileSync('./RC_RAW/' + 'fuckthisgarbageDepartment' + '.json', JSON.stringify(ABAI_DEPARTMENT) );
  // debug('Matched: ' + matchedInstitutions + ' : '  + unMatchedInstitutions)
  processFile(  // INSTITUTION ADDRESS
    './ABAI_RAW/institution_address.csv',//abaiBatchRecord['custrecord_institueaddr_fileid'),
    ABAI_TABLES.INSTITUTION_ADDRESS, parseInstitutionAddress, ABAI_INSTITUTION_ADDRESS
  );
  file.writeFileSync('./RC_RAW/' + 'garbageIA' + '.json', JSON.stringify(ABAI_INSTITUTION_ADDRESS) );
  processFile( // COORDINATOR
    './ABAI_RAW/coordinator.csv',//abaiBatchRecord['custrecord_coordinaor_fileid'),
    ABAI_TABLES.COORDINATOR, parseCoordinator, ABAI_COORDINATOR
  );
  file.writeFileSync('./RC_RAW/' + 'garbagecoord' + '.json', JSON.stringify(ABAI_COORDINATOR) );
  processFile( // COURSE SEQUENCE
    './ABAI_RAW/course_sequence.csv',//abaiBatchRecord['custrecord_coursesseq_fileid'),
    ABAI_TABLES.COURSE_SEQUENCE, parseCourseSequence, ABAI_COURSE_SEQUENCE
  );
  file.writeFileSync('./RC_RAW/' + 'garbageCS' + '.json', JSON.stringify(ABAI_COURSE_SEQUENCE) );
  processFile( // COURSE
    './ABAI_RAW/course.csv',//abaiBatchRecord['custrecord_course_fileid'),
    ABAI_TABLES.COURSE, parseCourse, ABAI_COURSE
  );
  file.writeFileSync('./RC_RAW/' + 'garbageCourse' + '.json', JSON.stringify(ABAI_COURSE) );
  processFile( // AP WAIVER
    './ABAI_RAW/ap_waiver.csv', //abaiBatchRecord['custrecord_apwaiver_fileid'),
    ABAI_TABLES.APWAIVER, parseApWaiver, ABAI_AP_WAIVER
  );
  file.writeFileSync('./RC_RAW/' + 'garbageWaiver' + '.json', JSON.stringify(ABAI_AP_WAIVER) );
  processFile( // INSTRUCTOR GROUP
    './ABAI_RAW/instructor_group.csv',//abaiBatchRecord['custrecord_instructorgrp_fileid'),
    ABAI_TABLES.INSTRUCTOR_GROUP, parseInstructor, ABAI_INSTRUCTOR
  );
  processFile( // COURSE SEQUENCE ASSIGNMENT
    './ABAI_RAW/course_sequence_course_assignment.csv',//abaiBatchRecord['custrecord_courseseq_crsass_fileid'),
    ABAI_TABLES.COURSE_ASSIGNEMNT, parseAssignment, ABAI_ASSIGNMENT
  );
  file.writeFileSync('./RC_RAW/' + 'garbageCSA' + '.json', JSON.stringify(ABAI_ASSIGNMENT) );
  file.writeFileSync('./RC_RAW/' + 'garbageCSA2' + '.json', JSON.stringify(ABAI_XREF.CourseToCourseSequence) );
  processFile( // ALT COURSE ID
    './ABAI_RAW/alternative_courseID.csv', //abaiBatchRecord['custrecord_alt_courseid_fileid'),
    ABAI_TABLES.ALT_COURSE_ID, parseAltCourseId, ABAI_ALT_ID
  );
  file.writeFileSync('./RC_RAW/' + 'altCourse' + '.json', JSON.stringify(ABAI_ALT_ID) );
  processFile( // CONTENT HOURS
    './ABAI_RAW/content_hours.csv',//abaiBatchRecord['custrecord_cont_hours_fileid'),
    ABAI_TABLES.CONTENT_HOURS, parseContentHours, ABAI_CONTENT_HOURS
  );
  file.writeFileSync('./RC_RAW/' + 'CHGarbage' + '.json', JSON.stringify(ABAI_CONTENT_HOURS) );
  processFile( // ALLOCATION HOURS
    './ABAI_RAW/content_area_hours_allocation.csv', //abaiBatchRecord['custrecord_cont_hsallocat_fileid'),
    ABAI_TABLES.ALLOCATION, parseAllocation, ABAI_ALLOCATION_HOURS
  );
  file.writeFileSync('./RC_RAW/' + 'garbageAllocation' + '.json', JSON.stringify(ABAI_ALLOCATION_HOURS) );
  audit('MainScript', 'FILE LOAD COMPLETE');
    file.writeFileSync('./RC_RAW/' + 'xref_sequence' + '.json', JSON.stringify(ABAI_XREF.CourseToCourseSequence));


  audit('MainScript', '=======END=======');
}

////////////////////////////////////////////////////
////////// SECTION: Helper/Generic Functions ///////
////////////////////////////////////////////////////

var errorCount = 0;
function processFile(fileId, recordType,  parseFunction, storage, moreGarbage) {
  if ( !fileId ) {
    error(recordType, 'fileId is null');
    return;
  }
  audit('processFile', 'Starting: ' + recordType)
  var count = 0;
  var fileContent = file.readFileSync(fileId).toString().split(/\n|\n\r/);;
  if ( fileContent ) {
    for ( var line = 1; line < fileContent.length; line++ ) {
      // check_governance();
      if (!( fileContent[line] )) {
        continue;
      }
      var dataContent = CSVToArray(fileContent[line])[0];
      if ( !dataContent[0] || dataContent[0] == ' ' ) {
        debug('YEEEET');
        continue;
      }
      if ( dataContent ) {
        var tempRecord = createRecord(recordType, dataContent, parseFunction)
        if ( recordType == 'customrecord_course_sequence' ) {
          ABAI_XREF.CourseSequence[tempRecord['externalid']] = tempRecord
          try {
            ABAI_XREF.Institution[tempRecord['custrecord_crse_seq_institutn']['externalid']] = tempRecord;
          }
          catch (e) {
            console.log('Missed Course Sequence ID: ', tempRecord['externalid']);
            console.log('Please match this ID with the CourseSequence from ABAI_RAW and create a new Institution entry in "unique.csv"');
            throw(e);
          }
        }
        if ( recordType == 'customrecord_crse_seqnc_crse_assignmnt' ) {
          ABAI_XREF.CourseToCourseSequence[tempRecord['custrecord_crse_seq_crse_asign_crse']] = tempRecord;
        }
        storage[tempRecord['externalid']] = tempRecord;

        count += 1;
      }
    }
  }
  fileContent = null;
  debug(count + ' records created');
  // audit('processFile', recordType + ' processing complete');
}

// LOG functions
function audit(title, message) { if ( PRINT_AUDIT_MESSAGES) cust_log('AUDIT',title, message); }
function debug(message) { if ( PRINT_DEBUG_MESSAGES ) cust_log('DEBUG',LOG_TITLE, message); }
function error(title, message) { cust_log('ERROR',title, message); }
function cust_log(type, title, message) {
  console.log( type.padEnd(8) + new Date().toLocaleTimeString().padEnd(13) + title.padEnd(20) + message);
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

function createRecord(type, data, parseFunction) {
  // var abaiRecord = nlapiCreateRecord(type);// record.create({type: type, isDynamic: true});
  // debug(JSON.stringify(abaiRecord));
  // setValues(abaiRecord, parseFunction(data));
  // FIXME - save when we are done debugging
  // var savedRecordId = abaiRecord.save();
  // return record.load({ type: type, id: savedRecordId });
  return  parseFunction(data);
}

////////////////////////////////////////////////////
///// SECTION: Main/Specific Script Functions //////
////////////////////////////////////////////////////

function parseUniqueInstitution(data) {
  return {
    'internalid': data[0],
    'Name': data[1],
    'Credit_System': data[2],
    'Credit_System_Other': data[3],
    'Accrediting_Body': data[4],
    'CRMID': data[5],
    'Matched': false // if it's UNIQUE THEN WE BETTER FORKING CHECK
  }
}
var unMatchedInstitutions = 0;
var matchedInstitutions = 0;
function matchInstitution(abai) {
  // process the abai GARBAGE into something usable maybe
  try{
    var matchString = abai['custrecord_institn_crm_identifier'];
    // matchString = matchInstitution.replace('/', '');
    // matchString = matchInstitution.replace(/-.+/, '');
    // try straight out to find a match

    for ( var key in UNIQUE_INSTITUTIONS ) {
      if ( UNIQUE_INSTITUTIONS[key][UniqueId]) {
        audit
      }
      if ( UNIQUE_INSTITUTIONS[key]['Mathced'] ){
        continue; // skip matches
      }
      // best case
      if ( UNIQUE_INSTITUTIONS[key]['CRMID'] == matchString){
        // debug(UNIQUE_INSTITUTIONS[key]['Name'] + ' matches ' +  abai['custrecord_insttn_name'])
        abai['custrecord_uniq_instn_name'] = UNIQUE_INSTITUTIONS[key]['Name'];
        abai['custrecord_uniq_insttn_id'] = UNIQUE_INSTITUTIONS[key]['internalid'];
        UNIQUE_INSTITUTIONS[key]['Matched'] = true;
        matchedInstitutions += 1;
        return abai;
      }
    }
    // Um so I guess we assume the thing is unique?? Fucking IDK
    // error('Match Institution', 'No result for ' + abai['custrecord_insttn_name'] + '\n' + abai['custrecord_institn_crm_identifier']);
    unMatchedInstitutions += 1;
    return abai;
  }
  catch (ex) {
    error('Match Failed', JSON.stringify(ex));
  }

}

function parseInstitution(data) {
  // Headers: ID,Name,Credit_System,Accrediting_Body,WebSite,Last_Modified,Status
  return {
    'internalid': data[0],
    'externalid': data[4],
    'custrecord_institn_crm_identifier': data[4],
    'custrecord_insttn_name': data[3],
    'custrecord_bacb_insti_cred_sys': data[1],
    'custrecord_bacb_insti_accr_body': data[2],
    'custrecord_institn_website': '',
    'custrecord_uniq_instn_name': data[5],
    'custrecord_uniq_instn_id': data[7],
  }
}
function parseDepo(data) {
  return {
    'externalid': data[1] + '-' + data[2],
    'institution': data[0],
    'instcrm': data[1],
    'DeptName': data[2],
    'DeptId': data[3]
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
  if ( !ABAI_INSTITUTION[data[3]] ) {
    console.log(Object.keys(ABAI_INSTITUTION).length );
    console.log(data[3]);
    console.log(data);
  }
  return {
    'externalid': data[0],
    'custrecord_crse_seqnc_crm_identifier': data[0],
    'name': data[1],
    'fuckingEdition': data[2],
    'custrecord_crse_seq_institutn': ABAI_INSTITUTION[data[3]],
    'custrecord_crse_seq_coordintr': ABAI_COORDINATOR[data[4]] ? ABAI_COORDINATOR[data[4]]: '',
    'custrecord_crse_seq_departmnt': data[5],
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

// function check_governance() {
// 	var scheduletime = new Date();
//   if ((startdate.getTime() + 3000000) <= scheduletime.getTime()
//   || parseInt(nlapiGetContext().getRemainingUsage()) <= 1000)	{
//     startdate = new Date();
// 		nlapiYieldScript();
// 	}
// }
////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Call  ///////
////////////////////////////////////////////////////
// function processDataFiles() {
  MainScript();
  MainScript_RC();
// }
/**
 * SCH_RC_ProcessData.js
 *
 * v1.0.0
 * 02/27/2020
 * Robert Imbler
 *
 * Scheduled Script:
 *  Processes ABAI data into our RC tables
 *
 * NOTES:
 *
 *
 */
////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Point ///////
////////////////////////////////////////////////////
function MainScript_RC() {
  LOG_TITLE = 'RC_ProcessData';
  debug('');
  debug('======SCH_RC_ProcessData START======');

  // With that done, check changes
  processAbaiToRcRecord( RC_TABLES.INSTITUTION, ABAI_INSTITUTION,
    RC_INSTITUTIONS, getRcInstitutionData, translateInstitution
  );
  // processAbaiToRcRecord( RC_TABLES.INSTITUTION_ADDRESS, ABAI_INSTITUTION_ADDRESS,
  //   RC_INSTITUTION_ADDRESS, getRcInstitutionAddressData, translateInstitutionAddress
  // );
  processAbaiToRcRecord( RC_TABLES.COORDINATOR, ABAI_COORDINATOR, RC_COORDINATOR, getRcCoordinatorData, skip);
  processAbaiToRcRecord( RC_TABLES.DEPARTMENT, ABAI_COURSE_SEQUENCE,
    RC_DEPARTMENTS, getRcDepartmentData, translateDepartment
  );
  processAbaiToRcRecord( RC_TABLES.COURSE, ABAI_COURSE,
    RC_COURSE, getRcCourseData, translateCourse
  );
  // Do a better course analysis
  processAbaiToRcRecord(RC_TABLES.COURSE_adv, ABAI_ASSIGNMENT,
    RC_COURSE_BY_ASSGN, getBetterRcCourseData, skip
  );
  saveAdvancedFile();
  processAbaiToRcRecord( RC_TABLES.CONTENT_HOURS, ABAI_CONTENT_HOURS,
    RC_CONTENT_HOURS, getRcContentHoursData, translateContentHour
  );
  processAbaiToRcRecord( RC_TABLES.ALLOCATION_HOURS,ABAI_ALLOCATION_HOURS,
    RC_ALLOCATION_HOURS, getRcAllocationHoursData, translateAllocationHour
  );
  file.writeFileSync('./RC_RAW/' + 'mixtape' + '.csv', likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense );

  // idkcheckitoutorsomething(executeSavedSearch( SavedSearch.INSTITUTION ));
  processFinalRecord();
  audit('fuckups', fuckups)
  debug('=======SCH_RC_ProcessData END========');
}

function saveAdvancedFile() {
  var courseArray = [];
  for ( var key in RC_COURSE_BY_ASSGN ) {
    courseArray.push( RC_COURSE_BY_ASSGN[key] );
  }
  saveFile(courseArray, 'Coursework_Advanced');
}

////////////////////////////////////////////////////
////////// SECTION: Helper/Generic Functions ///////
////////////////////////////////////////////////////

/**
 * Takes the ABAI records and matches/updates the associated RC table values
 * @param {RC_Table} rcTableInfo - info for the Record(table) we are processing
 * @param {ResultSet} abaiResultSet - data from saved search
 * @param {array} rcData - Array of RC records for parsing
 * @param {function} abaiFormatter - function to convert ABAI data to setField array object
 * @param {function} searchFunction - function to change matching process
 */
function processAbaiToRcRecord(
  // Data
  rcTableInfo, abaiResultSet, rcData,
  // Callback Functions
  abaiFormatter, searchFunction
) {
  audit('','')
  audit('======START======',rcTableInfo.Title);
  var savedRecords = [];
  if ( abaiResultSet.length == 0 ) {
    debug('No ABAI data for ' + rcTableInfo.Title);
  }
  for ( var abaiIndex in abaiResultSet ) {
    try {
      var temp = abaiFormatter( abaiResultSet[abaiIndex]);
    }
    catch ( ex ) {
      debug('');error('formatter', ex);debug('');
      error('Response: ', JSON.stringify(abaiResultSet[abaiIndex]));
      debug('')
      throw(ex)
    }
    if ( temp ) {
      savedRecords.push(temp);
    }
  }
  saveFile( savedRecords, rcTableInfo.Title );
  audit('=======END=======',rcTableInfo.Title);
}

function saveFile(savedRecords, rcTableTitle){
  var somekindofCSVstringorwhateverijustdontevencare = '';
  if ( savedRecords.length ) {
    // debug(JSON.stringify(savedRecords[0]))
    for (var key in savedRecords[0] ) {
      somekindofCSVstringorwhateverijustdontevencare += "\""
      somekindofCSVstringorwhateverijustdontevencare += key;
      somekindofCSVstringorwhateverijustdontevencare += "\""
      somekindofCSVstringorwhateverijustdontevencare += DELIMITER;
    }
    somekindofCSVstringorwhateverijustdontevencare += '\n';

    for (var line in savedRecords) {
      for (var key in savedRecords[line]) {
        somekindofCSVstringorwhateverijustdontevencare += "\""
        somekindofCSVstringorwhateverijustdontevencare += savedRecords[line][key];
        somekindofCSVstringorwhateverijustdontevencare += "\""
        somekindofCSVstringorwhateverijustdontevencare += DELIMITER;
      }
      somekindofCSVstringorwhateverijustdontevencare += '\n';
    }
  }
  file.writeFileSync('./RC_RAW/' + rcTableTitle + '.csv', somekindofCSVstringorwhateverijustdontevencare );
}

////////////////////////////////////////////////////
///// SECTION: Main/Specific Script Functions //////
////////////////////////////////////////////////////

/**
 *
 * @param {string} abaiSearchId - ID of the ABAI-based record
 * @param {array} rcSearchTable - RC table/array of values
 * @param {string} rcSearchValue - RC Table column to match
 * @returns {string} RC Record StringID or null if no match
 */
function translateAbaiToRcId(abaiSearchId, rcSearchTable, rcSearchValue) {
  // debug('rcSearchValue: ' + rcSearchValue);
  for ( var searchIndex in rcSearchTable ) {
    if ( abaiSearchId === rcSearchTable[searchIndex][rcSearchValue] ) {
      return rcSearchTable[searchIndex]['id'];
    }
  }
  debug('translateABAI missed ' + abaiSearchId);
  MISSED.INSTITUTION += 1;
  return null;
}
function miss(table) {
  table.Misses += 1;
  return null;
}
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

/**
 *
 * @param {Result} abaiData - ABAI Result record
 * @returns {object} Data package to load into 2.0 record
 */
function getRcInstitutionData(abaiData) {
  // Watch me append that new value into a static dictionary and also return it AT THE SAME TIME
  function InstitutionName() {
    var instName = abaiData['custrecord_insttn_name'];
    var uniqueName = abaiData['custrecord_uniq_instn_name'];
    return {
      'custrecord_rc_inst_name': uniqueName ? uniqueName : instName,
    }
  }
  return ABAI_MAPPED_RC_INSTITUTIONS[abaiData['externalid']] = Object.assign( {
    'custrecord_rc_instn_rm_id': abaiData['externalid'],
    'custrecord_rc_inst_credit_system': abaiData['custrecord_bacb_insti_cred_sys'],
    'custrecord_rc_inst_accrediting_body': abaiData['custrecord_bacb_insti_accr_body'],
    'custrecord_rc_inst_website': abaiData['custrecord_institn_website'],
    }, InstitutionName()
  )
}
function getRcInstitutionAddressData(abaiData) {
  function getInstitution() {
    return  ABAI_INSTITUTION[abaiData['custrecord_instn_addr_inst_id']][ 'custrecord_uniq_instn_name' ];
  }
  return Object.assign({
    'externalid': abaiData['externalid'],
    'custrecord_rc_inst_add_inst': getInstitution(),
    'custrecord_rc_inst_addr_crm_id': abaiData['custrecord_institutn_addr_crm_id'],
    'custrecord_rc_inst_add_address1': abaiData['custrecord_instn_addr_addr_line1'],
    'custrecord_rc_inst_add_address2': abaiData['custrecord_instn_addr_addr_line2'],
    'custrecord_rc_inst_add_city': abaiData['custrecord_instn_addr_city'],
    'custrecord_rc_inst_add_state': abaiData['custrecord_instn_addr_state_provnc'],
    'custrecord_rc_inst_add_country': abaiData['custrecord_instn_addr_country'],
    'custrecord_rc_inst_add_postal_code': abaiData['custrecord_instn_addr_postal_code'],
  })
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
  function getDepoId() {
    var instcrm = abaiData['custrecord_crse_seq_institutn']['externalid'];
    var deptname = abaiData['custrecord_crse_seq_departmnt']
    var id = '';
    if ( ABAI_DEPARTMENT[instcrm + '-' + deptname] ) {
      id = ABAI_DEPARTMENT[instcrm + '-' + deptname]['internalid']
    }
    else {
      var instName = ABAI_INSTITUTION[instcrm]['custrecord_insttn_name'];
      var cred = ABAI_INSTITUTION[instcrm]['custrecord_bacb_insti_cred_sys'];
      var accr = ABAI_INSTITUTION[instcrm]['custrecord_bacb_insti_accr_body'];
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += instName;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += DELIMITER;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += cred;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += DELIMITER;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += accr;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += DELIMITER;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += instcrm;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += DELIMITER;
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += deptname ? deptname : 'UnNamedDepartment';
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += "\""
      likeActualGarbageWhyDoIDoTheseThingsItDoesntMakeSense += '\n';
    }
    return {
      'department_internalid': id
    }
  }
  return RC_DEPARTMENTS[abaiData['externalid']] = Object.assign({
    'custrecord_rc_depart_name': abaiData['custrecord_crse_seq_departmnt'],
    'custrecord_rc_dept_institution_name': abaiData['custrecord_crse_seq_institutn']['custrecord_insttn_name'],
    'custrecord_rc_depart_institution': abaiData['custrecord_crse_seq_institutn']['externalid'],
    'rc_department_coordinator': abaiData['custrecord_crse_seq_coordintr']['externalid']

  },getDepoId()
  )
}

function getRcCourseData(abaiData) {
  function getDeptAndInst(abaiData) {
    var crsassCRM = ABAI_XREF.CourseToCourseSequence[abaiData['externalid']] ? ABAI_XREF.CourseToCourseSequence[abaiData['externalid']]['externalid'] : '';
    var rcDepartmentId = ABAI_XREF.CourseToCourseSequence[abaiData['externalid']] ? ABAI_XREF.CourseToCourseSequence[abaiData['externalid']]['custrecord_crse_seq_crse_asign_crseseqnc']['externalid'] : '';
    var alterations = '';
    for ( var key in abaiData['alterations'] ) {
      alterations += '{'+ abaiData['alterations'][key]['custrecord_altnte_crse_id_type'] + ':' + abaiData['alterations'][key]['custrecord_altnte_crse_id_value'] + '}';
    }
    return {
      'COURSE_SEQUENCE_COURSE_ASIGNMENT_CRM_ID': crsassCRM,
      'custrecord_rc_course_institution_name_uniq': abaiData['custrecord_course_institutn_id']['custrecord_uniq_instn_name'],
      'custrecord_rc_course_institution_name': abaiData['custrecord_course_institutn_id']['custrecord_insttn_name'],
      'custrecord_rc_course_inst': abaiData['custrecord_course_institutn_id']['externalid'],
      'custrecord_rc_course_dept': ABAI_COURSE_SEQUENCE[rcDepartmentId] ? ABAI_COURSE_SEQUENCE[rcDepartmentId]['custrecord_crse_seq_departmnt'] ? ABAI_COURSE_SEQUENCE[rcDepartmentId]['custrecord_crse_seq_departmnt'] : 'UnNamedDepartment' : 'UnNamedDepartment',
      'rc_course_alterations': alterations
    }
  }
  return RC_COURSE[abaiData['internalid']] = Object.assign({
    // Set all normal values
    'custrecord_rc_crse_crm_id': abaiData['custrecord_course_crm_identifier'],
    'externalid': abaiData['custrecord_course_crm_identifier'],
    'custrecord_rc_course_title': abaiData['custrecord_course_title'].replace(/\"/g, ''),
    'custrecord_rc_course_number': abaiData['custrecord_course_number'],
    'custrecord_rc_course_credit_level': abaiData['custrecord_course_credit_level'],
    'custrecord_rc_course_credit_hours': abaiData['custrecord_course_credit_hours'],
    'custrecord_rc_course_instruction_mode': abaiData['custrecord_course_mode_of_instrctn']},

    // Deparment and Institution values
    getDeptAndInst(abaiData)
  )
}

function getBetterRcCourseData(abaiData) {
  var course = ABAI_COURSE[abaiData['custrecord_crse_seq_crse_asign_crse']] ? ABAI_COURSE[abaiData['custrecord_crse_seq_crse_asign_crse']] : {};
  var sequence = abaiData['custrecord_crse_seq_crse_asign_crseseqnc'];

  return RC_COURSE_BY_ASSGN[abaiData['externalid']] = Object.assign({
    'custrecord_rc_crse_crm_id': course['custrecord_course_crm_identifier'],
    'externalid': course['custrecord_course_crm_identifier'],
    'custrecord_rc_course_title': course['custrecord_course_title'],
    'custrecord_rc_course_number': course['custrecord_course_number'],
    'custrecord_rc_course_credit_level': course['custrecord_course_credit_level'],
    'custrecord_rc_course_credit_hours': course['custrecord_course_credit_hours'],
    'custrecord_rc_course_instruction_mode': course['custrecord_course_mode_of_instrctn'],
    'custrecord_crse_seq_crm_id': sequence['externalid'],
    'custrecord_crse_seq_departmnt': sequence['custrecord_crse_seq_departmnt'],
    'custrecord_crse_seq_apprvl_level': sequence['custrecord_crse_seq_apprvl_level'],
    'custrecord_inst_crm_id': sequence['custrecord_crse_seq_institutn']['externalid'],
    'custrecord_inst_name': sequence['custrecord_crse_seq_institutn']['custrecord_insttn_name'],
    'custrecord_rc_course_edition': sequence['fuckingEdition'],
    'custrecord_rc_crs_seq_crs_assgn': abaiData['externalid'],
    'custrecord_crse_seq_name': sequence['name']
  }
  )
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
function getRcContentHoursData(abaiData) {
  var primaryKey = abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'] + ' '
    + abaiData['SEQUENCE']['fuckingEdition'];
  if ( abaiData['custrecord_cnt_hrs_activ_strt_date'] ){
    primaryKey += ' '
    + abaiData['custrecord_cnt_hrs_activ_strt_date']
  }
  RC_CONTENT_HOURS_PK[abaiData['externalid']] = {
    key: primaryKey,
    value: 0
  };

  if ( RC_CONTENT_HOURS[primaryKey] ){
    duplicates += 1;
  }
  else {
    return RC_CONTENT_HOURS[primaryKey] = Object.assign({
      'content_hours_pk': primaryKey,
      'custrecord_rc_cnthrs_crm_id': abaiData['custrecord_content_hrs_crm_identifier'],
      'custrecord_rc_content_hr_edition': abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['custrecord_crse_seq_crse_asign_crseseqnc']['fuckingEdition'],
      // Use XREF to get the courseID that links the RC_course dictionary, then get RC.internalid
      'custrecord_rc_content_hr_course': abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['custrecord_crse_seq_crse_asign_crse'],
      'custrecord_rc_content_hr_start_date': checkNull(abaiData['custrecord_cnt_hrs_activ_strt_date']),
      'custrecord_rc_content_hr_end_date': checkNull(abaiData['custrecord_cnt_hrs_activ_end_date']),
      'custrecord_rc_content_hr_start_year': yearSubstring(checkNull(abaiData['custrecord_cnt_hrs_activ_strt_year'])),
      'custrecord_rc_content_hr_end_year': yearSubstring(checkNull(abaiData['custrecord_cnt_hrs_activ_end_year'])),
      'custrecord_rc_content_hr_start_qtr': abaiData['custrecord_cnt_hrs_activ_strt_quar'],
      'custrecord_rc_content_hr_end_qtr': abaiData['custrecord_cnt_hrs_activ_end_quar'],
      'custrecord_rc_content_hr_start_sem': abaiData['custrecord_cnt_hrs_activ_strt_sem'],
      'custrecord_rc_content_hr_end_sem': abaiData['custrecord_cnt_hrs_activ_end_sem'],
      'customrecord_rc_crs_seq_crs_assgn_crm_id': abaiData['custrecord_cnt_hrs_crseseq_crseassignmnt']['externalid'],
      'COURSE_CRM': abaiData['COURSE'] ? abaiData['COURSE']['externalid'] : '',
      'SEQUENCE_CRM': abaiData['SEQUENCE']['externalid'],
      'INSTITUTION_ID_internal': abaiData['SEQUENCE']['custrecord_crse_seq_institutn']['internalid'],
      'INSTITUTION_CRM': abaiData['SEQUENCE']['custrecord_crse_seq_institutn']['external'],
      'Allocations': []
    })
  }
}

function getRcAllocationHoursData(abaiData) {
  var pkey = RC_CONTENT_HOURS_PK[abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['externalid']]
  pkey.value += parseInt(abaiData['custrecord_cnt_area_hrs_allctn_value']);

  var allocation = Object.assign({
    'custrecord_rc_hr_alloc_content_hours': abaiData['custrecord_cnt_area_hrs_allctn_cnt_hrs']['externalid'],
    'custrecord_rc_hr_alloc_type': abaiData['custrecord_cnt_area_hrs_allctn_type'],
    'custrecord_rc_hr_alloc_value': abaiData['custrecord_cnt_area_hrs_allctn_value'],
    'custrecord_rc_cntntarea_hrs_alloc_crm_id': abaiData['externalid'],
    'content_hours_pk': pkey.key
  });
  RC_CONTENT_HOURS[pkey.key]['Allocations'].push(abaiData);
  return allocation;
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
