/**
 * SCH_RC_ProcessData_SS2.js
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

/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */

define( [ "N/log", "N/record", "N/runtime", "N/search" ],
function ( log, record, runtime, search ) {
////////////////////////////////////////////////////
////////// SECTION: Global Parameters //////////////
////////////////////////////////////////////////////
const PRINT_AUDIT_MESSAGES = true;
const PRINT_DEBUG_MESSAGES = true;
var MISSED = {
  INSTITUTION: 0
}

const RUNTIME_CONTEXT = runtime.getCurrentScript();
// List of saved searches present in the Scheduled Script as parameters
const SavedSearch = {
  INSTITUTION : 'custscript_rcabai_institution',
  INSTITUTION_ADDRESS: 'custscript_rcabai_institution_address',
  COURSE_SEQUENCE: 'custscript_rcabai_course_sequence',
  // COORDINATOR: 'custscript_rcabai_cordin_search',
  COURSE: 'custscript_rcabai_course',
  AP_WAIVER: 'custscript_rcabai_ap_waiver',
  COURSE_SEQUENCE_COURSE_ASSIGNMENT: 'custscript_rcabai_course_assignment',
  ALTERNATE_COURSE_ID: 'custscript_rcabai_alt_course_id',
  CONTENT_HOURS: 'custscript_rcabai_content_hours',
  CONTENT_HOURS_ALLOCATION: 'custscript_rcabai_allocation_hours',
  DEPARTMENT: 'custscript_rcabai_department',
};
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
const ABAI_TABLES = {
  INSTITUTION: {
    Title: 'customrecord_institution',
    Columns: [
      'externalid', 'custrecord_institn_website', 'custrecord_insttn_name',
      ['custrecord_unique_name', 'custrecord_uniq_instn_name']
    ]
  },
  SEQUENCE: {
    Title: 'customrecord_course_sequence',
    Columns: [
      'custrecord_crse_seq_institutn',
      'custrecord_crse_seq_departmnt',
      'custrecord_course_sequence_department',
    ]
  },
  COURSE_SEQUENCE_XREF: {
    Title: 'customrecord_crse_seqnc_crse_assignmnt',
    Columns: [
      'custrecord_crse_seq_crse_asign_crseseqnc',
      'custrecord_crse_seq_crse_asign_crse',
    ]
  }
}

const LOG_TITLE = 'RC_ProcessData';

// Runtime Table Dictionaries
const ABAI_MAPPED_RC_INSTITUTIONS = {};
const RC_INSTITUTIONS = {};
const RC_INSTITUTION_ADDRESS = {};
const ABAI_INSTITUTIONS = {};
const RC_DEPARTMENTS = {}; // Logged by RC ID
const ABAI_SEQUENCE = {};
const ABAI_XREF = { // Eat my garbage excess data, NetSuite
  InternalId: {},
  CourseSequence: {}
};
const RC_COURSE = {};
const RC_CONTENT_HOURS = {};
const RC_ALLOCATION_HOURS = {};

////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Point ///////
////////////////////////////////////////////////////
function MainScript() {
  debug('');
  debug('======SCH_RC_ProcessData START======');
  // Load our reference Dictionaries
  loadTableData(ABAI_TABLES.INSTITUTION, ABAI_INSTITUTIONS, toDictionary);
  loadTableData(ABAI_TABLES.SEQUENCE, ABAI_SEQUENCE, toDictionary);
  loadTableData(ABAI_TABLES.COURSE_SEQUENCE_XREF, ABAI_XREF, toXrefDictionary);
  loadTableData(RC_TABLES.INSTITUTION, RC_INSTITUTIONS, toDictionary);
  loadTableData(RC_TABLES.INSTITUTION_ADDRESS, RC_INSTITUTION_ADDRESS, toDictionary);
  loadTableData(RC_TABLES.DEPARTMENT, RC_DEPARTMENTS, toDictionary);

  // With that done, check changes
  processAbaiToRcRecord( RC_TABLES.INSTITUTION, executeSavedSearch( SavedSearch.INSTITUTION ),
    RC_INSTITUTIONS, getRcInstitutionData, translateInstitution
  );
  processAbaiToRcRecord( RC_TABLES.INSTITUTION_ADDRESS, executeSavedSearch(SavedSearch.INSTITUTION_ADDRESS),
    RC_INSTITUTION_ADDRESS, getRcInstitutionAddressData, translateInstitutionAddress
  );
  processAbaiToRcRecord( RC_TABLES.DEPARTMENT, executeSavedSearch(SavedSearch.DEPARTMENT),
    RC_DEPARTMENTS, getRcDepartmentData, translateDepartment
  );
  processAbaiToRcRecord( RC_TABLES.COURSE, executeSavedSearch(SavedSearch.COURSE),
    RC_COURSE, getRcCourseData, translateCourse
  );
  processAbaiToRcRecord( RC_TABLES.CONTENT_HOURS, executeSavedSearch(SavedSearch.CONTENT_HOURS),
    RC_CONTENT_HOURS, getRcContentHoursData, translateContentHour
  );
  processAbaiToRcRecord( RC_TABLES.ALLOCATION_HOURS, executeSavedSearch(SavedSearch.CONTENT_HOURS_ALLOCATION),
    RC_ALLOCATION_HOURS, getRcAllocationHoursData, translateAllocationHour
  );

  // idkcheckitoutorsomething(executeSavedSearch( SavedSearch.INSTITUTION ));

  // debug(getTableData(RC_TABLES.INSTITUTION).length);
  debug(RC_TABLES.INSTITUTION.Title + ' missed: ' + RC_TABLES.INSTITUTION.Misses);
  debug(RC_TABLES.INSTITUTION_ADDRESS.Title + ' missed: ' + RC_TABLES.INSTITUTION_ADDRESS.Misses);
  debug(RC_TABLES.DEPARTMENT.Title + ' missed: ' + RC_TABLES.DEPARTMENT.Misses);
  debug(RC_TABLES.COURSE.Title + ' missed: ' + RC_TABLES.COURSE.Misses);
  debug(RC_TABLES.CONTENT_HOURS.Title + ' missed: ' + RC_TABLES.CONTENT_HOURS.Misses);
  debug(RC_TABLES.ALLOCATION_HOURS.Title + ' missed: ' + RC_TABLES.ALLOCATION_HOURS.Misses);
  debug('=======SCH_RC_ProcessData END========');
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
  var startIndex = 0; var endIndex = 1000;
  var abaiSection = abaiResultSet.getRange({start: startIndex, end: endIndex});
  if ( abaiSection.length == 0 ) {
    debug('No ABAI data for ' + rcTableInfo.Title);
  }
  while ( abaiSection.length > 0 ) {
    debug('Checking ABAI ' + startIndex + ' to ' + endIndex);
    // Probably don't ever put console logs in this loop, since any big issues will call like, thousands of times in a row
    for ( var abaiIndex in abaiSection ) {
      // get RC ID from ABAI data
      // audit('translate params: ', abaiSection[abaiIndex].getText({name: abaiMatchString}) + ',' + rcMatchString );
      var rcID = searchFunction(abaiSection[abaiIndex].getText({name: 'internalid'}), rcData);
      // Get fields to set from ABAI data
      if ( !rcID ) {
        debug( JSON.stringify(abaiSection[abaiIndex]));
      }
      var rcFieldsToSet = abaiFormatter( abaiSection[abaiIndex]);

      var objRecord = rcID ? record.load({ type: rcTableInfo.Title, id: rcID }) : record.create({ type: rcTableInfo.Title, isDynamic: true });
      // var objRecord = record.create({ type: rcTableInfo.Title, isDynamic: true });
      // For each field in the ABAI data, we set the value on the RC record
      for ( var rcField in rcFieldsToSet ) {
        if ( rcFieldsToSet.hasOwnProperty(rcField) ) {
          try {
            objRecord.setValue({
              fieldId: rcField,
              value: rcFieldsToSet[rcField]
            });
          }
          catch (ex) {
            error(rcTableInfo.Title, 'Could not set value ' + rcfield );
          }
        }
      }
      // FIXME - SAVE THE RECORD - but later when this doesn't suck
    }
    startIndex = endIndex;
    endIndex += 1000;
    abaiSection = []; // abaiResultSet.getRange({start: startIndex, end: endIndex});
  }
}

// LOG functions
function audit(title, message) { if ( PRINT_AUDIT_MESSAGES) log.audit(title, message); }
function debug(message) { if ( PRINT_DEBUG_MESSAGES ) log.debug(LOG_TITLE, message); }
function error(title, message) { log.error(title, message); }

// Data MGMT - convert ABAI to RC helpful layout as required
function passThrough(recordEntry) { return recordEntry };

function idkcheckitoutorsomething(stuff) {
  if ( stuff ) {
    var searchResult = stuff.getRange({start: 0, end: 2});
    audit('idkCheck', JSON.stringify(searchResult));
  }
  else {
    debug('failed');
  }
}

/**
 * Takes a given Script parameter, gets the deployment value and executes the saved search
 * and returns the results
 * @param {string} searchName
 * @returns {[results]} ResultSet
 */
function executeSavedSearch(searchName) {
  audit( 'executeSavedSearch', 'Loading saved search results: ' + searchName);
  var savedSearch = null;
  try {
    savedSearch = search.load({id: RUNTIME_CONTEXT.getParameter({name: searchName})}).run();
  }
  catch (ex) {
    error('Saved search ' + searchName + ' failed to execute properly', JSON.stringify(ex));
  }
  return savedSearch;
}
/**
 * Takes defined NetSuite (NS) Table from const object and returns all records and required fields
 * @param {object} nsTable
 * @param {object} storage - where you'd like the info saved
 * @param {function} process - how you would like to store the info
 * @returns {Array} [records]
 */
function loadTableData(nsTable, storage, process) {
  audit('getTableData', nsTable.Title);
  var searchColumns = [{name: 'internalid'}];
  nsTable.Columns.forEach( function(column) {
    if ( column instanceof Array && column.length ) {
      debug('getting column ' + column[0] + ' on ' + column[1]);
      searchColumns.push({ name: column[0], join: column[1] });
    }
    else {
      debug('getting column ' + column);
      searchColumns.push({ name: column });
    }

  });
  // run returns a ResultSet
  var nsSearch = search.create({ type: nsTable.Title, columns: searchColumns }).run();
  var count = 0; var startIndex = 0; var endIndex = 1000;
  // ResultSet.getRange returns [Result]
  var searchResult = nsSearch.getRange({ start: startIndex, end: endIndex });
  audit(nsTable.Title, JSON.stringify(searchResult[0]));
  while (searchResult.length > 0) {
    searchResult.forEach(function(result) {
      process( storage, result );
      count += 1; // so we can count agnostic to dictionary or array
    });
    endIndex = 1000 + (startIndex = endIndex);
    searchResult = nsSearch.getRange({ start: startIndex, end: endIndex });
  }
  audit(nsTable.Title, 'Length: ' + count);
}

function toDictionary(storage, value) {
  storage[value.getValue({name: 'internalid'})] = value;
}
function toArray(storage, value) {
  storage.push(value);
}
function toXrefDictionary(storage, value) {
  storage.InternalId[value.getValue({name: 'internalid'})] = value;
  storage.CourseSequence[value.getValue({name: 'custrecord_crse_seq_crse_asign_crse'})] = value;
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
    if ( abaiSearchId === rcSearchTable[searchIndex].getValue({name: rcSearchValue}) ) {
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
  var result = ABAI_INSTITUTIONS[abaiSearchId];
  return result ? result.getValue({name: 'custrecord_uniq_instn_name'}) : miss(RC_TABLES.INSTITUTION);
}
function translateInstitutionAddress(abaiSearchId, rcData) {
  return miss(RC_TABLES.INSTITUTION_ADDRESS); // FIXME
}
function translateDepartment(abaiSearchId, rcData) {
  var result = ABAI_SEQUENCE[abaiSearchId];
  return result ? result.getValue({name: 'custrecord_course_sequence_department'}) : miss(RC_TABLES.DEPARTMENT);
}
function translateCourse(abaiSearchId, rcData) {
  var result = RC_COURSE[abaiSearchId];
  return result ? result.getValue({name: 'internalid'}) : miss(RC_TABLES.COURSE);
}
function translateContentHour(abaiSearchId, rcData) {
  return miss(RC_TABLES.CONTENT_HOURS); // FIXME
}
function translateAllocationHour(abaiSearchId, rcData) {
  return miss(RC_TABLES.ALLOCATION_HOURS);; // FIXME
}


/**
 *
 * @param {Result} abaiData - ABAI Result record
 * @returns {object} Data package to load into 2.0 record
 */
function getRcInstitutionData(abaiData) {
  // Watch me append that new value into a static dictionary and also return it AT THE SAME TIME
  function InstitutionName() {
    var instName = abaiData.getValue({name: 'custrecord_insttn_name'});
    var uniqueName = abaiData.getValue({name: 'custrecord_uniq_instn_name'});
    return {
      'custrecord_rc_inst_name': uniqueName ? uniqueName : instName,
    }
  }
  return ABAI_MAPPED_RC_INSTITUTIONS[abaiData.getValue({name: 'internalid'})] = Object.assign( {
    'custrecord_rc_instn_rm_id': abaiData.getValue({name: 'internalid'}),
    'custrecord_rc_inst_credit_system': abaiData.getValue({name: 'custrecord_bacb_insti_cred_sys'}),
    'custrecord_rc_inst_accrediting_body': abaiData.getValue({name: 'custrecord_bacb_insti_accr_body'}),
    'custrecord_rc_inst_website': abaiData.getValue({name: 'custrecord_institn_website'}),
    }, InstitutionName()
  )
}
function getRcInstitutionAddressData(abaiData) {
  function getInstitution() {
    return  ABAI_INSTITUTIONS[abaiData.getValue({name: 'custrecord_instn_addr_inst_id'})].getValue({ name: 'custrecord_uniq_instn_name' });
  }
  return Object.assign({
    'externalid': abaiData.getValue({name: 'externalid'}),
    'custrecord_rc_inst_add_inst': getInstitution(),
    'custrecord_rc_inst_addr_crm_id': abaiData.getValue({name: 'custrecord_institutn_addr_crm_id'}),
    'custrecord_rc_inst_add_address1': abaiData.getValue({name: 'custrecord_instn_addr_addr_line1'}),
    'custrecord_rc_inst_add_address2': abaiData.getValue({name: 'custrecord_instn_addr_addr_line2'}),
    'custrecord_rc_inst_add_city': abaiData.getValue({name: 'custrecord_instn_addr_city'}),
    'custrecord_rc_inst_add_state': abaiData.getValue({name: 'custrecord_instn_addr_state_provnc'}),
    'custrecord_rc_inst_add_country': abaiData.getValue({name: 'custrecord_instn_addr_country'}),
    'custrecord_rc_inst_add_postal_code': abaiData.getValue({name: 'custrecord_instn_addr_postal_code'}),
  })
}


function getRcDepartmentData(abaiData) {
  return RC_DEPARTMENTS[abaiData.getValue({name: 'internalid'})] = {
    'custrecord_rc_depart_name': abaiData.getValue({name: 'custrecord_rc_depart_name'}),
    // 'custrecord_rc_depart_website': '',
    'custrecord_rc_dept_institution_name': RC_INSTITUTIONS[abaiData.getValue({name: 'custrecord_rc_depart_institution'})].getValue({name: 'custrecord_rc_inst_name'}),
    'custrecord_rc_depart_institution': RC_INSTITUTIONS[abaiData.getValue({name: 'custrecord_rc_depart_institution'})]
  }
}

function getRcCourseData(abaiData) {
  function getDeptAndInst(abaiData) {
    // var abaiDepartment = abaiData.getValue({name:  })
    var abaiInstitutionId = abaiData.getValue({name: 'custrecord_course_institutn_id'});
    var rcDepartmentId = ABAI_SEQUENCE[ABAI_XREF.CourseSequence[
      abaiData.getValue({name: 'internalid'})] // get the Course Sequence ID
      .getValue({name: 'custrecord_crse_seq_crse_asign_crseseqnc'}) // Get the Unique Department ID
    ]
    return {
      'custrecord_rc_course_institution': ABAI_MAPPED_RC_INSTITUTIONS[abaiInstitutionId].getValue({name: 'custrecord_rc_inst_name'}),
      'custrecord_rc_course_inst': ABAI_MAPPED_RC_INSTITUTIONS[abaiInstitutionId].getValue({name: 'internalid'}),
      'custrecord_rc_course_department': RC_DEPARTMENTS[rcDepartmentId].getValue({name: 'custrecord_rc_depart_name'}),
      'custrecord_rc_course_dept': rcDepartmentId
    }
  }
  return RC_COURSE[abaiData.getValue({name: 'internalid'})] = Object.assign({
    // Set all normal values
    'custrecord_rc_crse_crm_id': abaiData.getValue({name: 'custrecord_crse_seqnc_crm_identifier'}),
    'externalid': abaiData.getValue({name: 'custrecord_crse_seqnc_crm_identifier'}),
    'custrecord_rc_course_title': abaiData.getValue({name: 'custrecord_coursE_title'}),
    'custrecord_rc_course_number': abaiData.getValue({name: 'custrecord_course_number'}),
    'custrecord_rc_course_credit_level': abaiData.getValue({name: 'custrecord_course_credit_level'}),
    'custrecord_rc_course_credit_hours': abaiData.getValue({name: 'custrecord_course_credit_hours'}),
    'custrecord_rc_course_instruction_mode': abaiData.getValue({name: 'custrecord_course_mode_of_instrctn'})},
    // Add Deparment and Institution values
    getDeptAndInst(abaiData)
  )
}

function getRcContentHoursData(abaiData) {
  function checkNull(value) {
    return  value == '12/31/1969' ? null : value;
  }
  function yearSubstring(value) {
    return value && value.indexOf('.') > -1 ? value.substring(0, value.indexOf('.')) : null;
  }
  return RC_CONTENT_HOURS[abaiData.getValue({name: 'internalid'})] = Object.assign({
    'custrecord_rc_cnthrs_crm_id': abaiData.getValue({name: 'custrecord_content_hrs_crm_identifier'}),
    'custrecord_rc_content_hr_start_date': checkNull(abaiData.getValue({name: 'custrecord_cnt_hrs_activ_strt_date'})),
    'custrecord_rc_content_hr_end_date': checkNull(abaiData.getValue({name: 'custrecord_cnt_hrs_activ_end_date'})),
    'custrecord_rc_content_hr_start_year': yearSubstring(abaiData.getValue({name: 'custrecord_cnt_hrs_activ_strt_year'})),
    'custrecord_rc_content_hr_end_year': yearSubstring(abaiData.getValue({name: 'custrecord_cnt_hrs_activ_end_year'})),
    'custrecord_rc_content_hr_start_qtr': abaiData.getValue({name: 'custrecord_cnt_hrs_activ_strt_quar'}),
    'custrecord_rc_content_hr_end_qtr': abaiData.getValue({name: 'custrecord_cnt_hrs_activ_end_quar'}),
    'custrecord_rc_content_hr_start_sem': abaiData.getValue({name: 'custrecord_cnt_hrs_activ_strt_sem'}),
    'custrecord_rc_content_hr_end_sem': abaiData.getValue({name: 'custrecord_cnt_hrs_activ_end_sem'}),
    'custrecord_rc_content_hr_edition': abaiData.getValue({name: ''}),
    // Use XREF to get the courseID that links the RC_course dictionary, then get RC.internalid
    'custrecord_rc_content_hr_course': RC_COURSE[ABAI_XREF.InternalId[
      abaiData.getValue({name: 'custrecord_cnt_hrs_crseseq_crseassignmnt' })]].getValue({name: 'internalid'}),
  })
}

function getRcAllocationHoursData(abaiData) {
  // return Object.assign({

  // })
}



////////////////////////////////////////////////////
////// SECTION: Scheduled Script Entry Call  ///////
////////////////////////////////////////////////////
return {
  execute: MainScript
}});
