/**
 * SuiteDelete.js
 *
 * v1.0.0
 * 03/06/2020
 * Robert Imbler
 *
 * Scheduled Script:
 * delete every record of a given type
 *
 * NOTES:
 *  Get wrecked, NetSuite
 *
 */
// comparisons, 'isnot'

// var RUNTIME_CONTEXT = nlapiGetContext();
// const RECORD = 'customrecord_rc_final_data_record';
// const FILTER = "custrecord_rc_final_data_course_name";
// const comparision = 'isnot'
// const VALUE = 'Registered Course 4th Edition';// "VCS (Verified)";
// filter.push( new nlobjSearchFilter( 'custrecord_rc_cnthrs_editn',null,  "anyof", [4,5] ));

const RECORD = 'customrecord_rc_course';
const FILTER = 'custrecord_rc_crse_crm_id';
const comparision = 'isnot'
const VALUE = '';// "VCS (Verified)";

// const RECORD = 'customrecord_rc_alternative_course';
// const FILTER = 'custrecord_alternatecrse_crm_id';
// const comparision = 'isnot'
// const VALUE = '';// "VCS (Verified)";

// const RECORD = 'customrecord_rc_content_hours';
// const FILTER = 'custrecord_rc_cnthrs_crm_id';
// const comparision = 'isnot';
// const VALUE = '';

// const RECORD = 'customrecord_rc_hour_allocation';
// // const FILTER = "custrecord_rc_cntntarea_hrs_alloc_crm_id";
// // const comparision = 'isnot'
// // const VALUE = '';// "VCS (Verified)";
// const FILTER = 'custrecord_rc_hr_alloc_value';
// const comparision = 'is';
// const VALUE = '0';

// const RECORD = 'customrecord_rc_department';
// const FILTER = 'custrecord_rc_depart_name';
// const comparision = 'is'
// const VALUE = 'Registered Course';// "VCS (Verified)";


var startdate = new Date();

function main() {
  nlapiLogExecution('DEBUG', 'Deleting', '');
  nlapiLogExecution('DEBUG', 'Deleting', 'COWABUNGA IT IS');
  var filter = FILTER ? [new nlobjSearchFilter(FILTER, null, comparision, VALUE)] : null;

  var search = nlapiSearchRecord(RECORD, null, filter, null);
  // var section = search.getResults(start, end);
  var count = 0;
  while (search){
    nlapiLogExecution('DEBUG', 'Deleting', search.length + ' records');
    for ( var index in search ) {
      // nlapiLogExecution('DEBUG', 'Deleted', count + ' records');
      if ( index % 100 == 0 ) {
        check_governance();
        // nlapiLogExecution('AUDIT', 'Record', JSON.stringify(search[index]))
        nlapiLogExecution('DEBUG', 'Deleted', count + ' records');
      }
      nlapiDeleteRecord( RECORD, search[index].getId() );
      count += 1;
    }
    // search = null;
    search = nlapiSearchRecord(RECORD, null, filter, null);
  }
  nlapiLogExecution('DEBUG', 'TOTAL', count + ' records');
  nlapiLogExecution('DEBUG', 'Deleting', 'COWABUNGA IT SHALL EVER BE');
}

function check_governance() {
	var scheduletime = new Date();
  if ((startdate.getTime() + 3000000) <= scheduletime.getTime()
  || parseInt(nlapiGetContext().getRemainingUsage()) <= 1000)	{
    startdate = new Date();
		nlapiYieldScript();
	}
}
