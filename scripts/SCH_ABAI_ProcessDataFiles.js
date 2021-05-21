/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00
 * 
 */
var count = 0;
var startdate = new Date();
var context = nlapiGetContext();
//var parentFolderID= '37'; // create a Folder with Name "ABAI Error" and set the Folder ID here. ..
var parentFolderID= context.getSetting('SCRIPT','custscript_parent_folderid');
var processedFolderId= context.getSetting('SCRIPT','custscript_porcessed_folder_id');
var failedFiles = [];
var folderid = null;

var faileddataset = [];

/**
 * Saved Searches...
 
var customrecord_institution_id      			= '76'; //context.getSetting('SCRIPT','custscript_abai_intg_log_recid');
var customrecord_ap_waiver_id        			= '78'; //context.getSetting('SCRIPT','custscript_abai_intg_log_recid');
var customrecord_course_sequence_id  			= '79';
var customrecord_bacb_course_id      			= '80';
var customrecord_coordinator_id      			= '81';
var customrecord_instrctr_group_id   			= '';
var customrecord_crse_seqnc_crse_assignmnt_id   = '82';
var customrecord_altrnte_crseid_id   		    = '83';
var customrecord_content_area_hrs_alloc_id   	= '84';
var customrecord_content_hours_id     		    = '85';
var customrecord_institution_address_id  		= '77';*/

var customrecord_institution_id      			= context.getSetting('SCRIPT','custscript_institution_id');
var customrecord_ap_waiver_id        			= context.getSetting('SCRIPT','custscript_ap_waiver_src');
var customrecord_course_sequence_id  			= context.getSetting('SCRIPT','custscript_crs_seq');
var customrecord_bacb_course_id      			= context.getSetting('SCRIPT','custscript_crs_id_src');
var customrecord_coordinator_id      			= context.getSetting('SCRIPT','custscript_cord_src');
var customrecord_crse_seqnc_crse_assignmnt_id   = context.getSetting('SCRIPT','custscript_cour_seq_crc_assig');
var customrecord_altrnte_crseid_id   		    = context.getSetting('SCRIPT','custscript_alternate_course_id');
var customrecord_content_area_hrs_alloc_id   	= context.getSetting('SCRIPT','custscript_content_hours_alloc_src');
var customrecord_content_hours_id     		    = context.getSetting('SCRIPT','custscript_content_hours_scr');
var customrecord_institution_address_id  		= context.getSetting('SCRIPT','custscript_insist_addr');




/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function processDataFiles(type) {

	log('Execution Started');
	try {

		processor();
	} catch (e) {
		var exception_details;

		if (e instanceof nlobjError) {
			exception_details = 'Script Execution Failed with Code::'
				+ e.getCode() + '::Error Details::' + e.getDetails();
		} else {

			exception_details = 'Script Execution Failed with Error Details::'
				+ e.toString();
		}
		log('The Exception Details ::' + exception_details);

	}
	log('Execution ENDED');

}

function printException(e) {

	var exception_details;

	if (e instanceof nlobjError) {
		exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
	} else {

		exception_details = 'JAVA Execution::'
			+ e.toString();
	}
	log('The Exception Details ::' + exception_details);

}

function parseInstitutionAddressFilecontent(fileid) {

	log('Institution Address File ID::' + fileid);
	var failedLines=[];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 				= replaceOriginalData(datacontent[0]);
			var institutionid   = replaceOriginalData(datacontent[1]);
			var addr1 			= replaceOriginalData(datacontent[2]);
			var addr2 			= replaceOriginalData(datacontent[3]);
			var city 			= replaceOriginalData(datacontent[4]);
			var stateprovince 	= replaceOriginalData(datacontent[5]);
			var postalcode 		= replaceOriginalData(datacontent[6]);
			var country 		= replaceOriginalData(datacontent[7]);

			var statusDet  = datacontent[9];
			//var status = getListVal(statusDet)



			if (id == '' || id == undefined || id == ' ') {
				continue;
			}

			if (stateprovince == '') {
				stateprovince = null;
			}

			var dataobj = {};

			dataobj.instituionid = institutionid;
			dataobj.addrline1 = addr1;
			dataobj.addrline2 = addr2;
			dataobj.city = city;
			dataobj.stateprovince = stateprovince;
			dataobj.country = country;
			dataobj.postalcode = postalcode;
			dataobj.id = id;
			dataobj.status= statusDet;

			try {
				createInstitutionAddressRecord(dataobj);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:InstitutionAddress::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}

		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'InstituionAddress_Error_File');
		}

		check_governance();
	}

}

function getListVal(value){

	if(value && value!=undefined ){
	var convertedstr = (value.trim()).toLowerCase();
	
	if(convertedstr == 'active'){
		log('Returnug 1::for :'+value );
		return "1";
	}else if(convertedstr == 'inactive'){
		log('Returnug 2::for :'+value );
		return "2";
	}else if(convertedstr == "approved"){
		log('Returnug 3::for :'+value );
		return "3";
	}else{
		log('Returnug Null::for :'+value );
		return null;
	}
	}
	else{
	return null;	
	}

}

function parseInstitutionFileContent(fileid) {

	var failedLines = [];


	log('File ID::' + fileid);

	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');
			
			//var datacontent = filcontent[itr].split(',');

			var id 				= replaceOriginalData(datacontent[0]);
			var institutionname = replaceOriginalData(datacontent[1]);
			var creditsystem 	= replaceOriginalData(datacontent[2]);
			var accredingbody	= replaceOriginalData(datacontent[3]);
			var addresswebsite  = replaceOriginalData(datacontent[4]);
			var statusDet       = replaceOriginalData(datacontent[6]);

			//var status = getListVal(statusDet)



			if (addresswebsite) {
				var firstchar = addresswebsite.substring(0, 4);
				if (firstchar != 'http' && firstchar != 'ftp') {
					addresswebsite = 'http://' + addresswebsite;
				}
			}

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.creditsystem = creditsystem;
			//dataobject.creditsystemother = creditsystemoth;
			dataobject.accrbody = accredingbody;
			dataobject.website = addresswebsite;
			dataobject.institutename = institutionname;
			dataobject.status = statusDet;

			try {
				createInstitutionRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Institution::ID' + id);

				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}

		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'Instituion_Error_File');
		}

		check_governance();

	}
}


function createErrorFile(failedLines,fileName_F){

	if(folderid){

		var contents_csv= '';
		for (var z1 = 0; z1 < failedLines.length; z1++) { 
			//log.debug('Search Res ','Test in Loop:'+contents_);
			contents_csv += failedLines[z1].toString()+'\n'; 
		} 
		var scheduletime=new Date();
		var timestamp = scheduletime.getTime();
		var filename=fileName_F+'_'+timestamp+'.csv';

		var objFile = nlapiCreateFile(filename, 'CSV', contents_csv);

		objFile.setFolder(folderid);

		var fileoid = nlapiSubmitFile(objFile);

		log(' Error File Saved :'+fileoid);


	}else{
		createdFolder();
	}

}


function createdFolder(){

	var date = new Date();

	var dat   = date.getDate();
	var Month = date.getMonth();
	var year  = date.getFullYear();
	var Time  = date.getTime();

	var timeStamp = dat+'_'+Month+'_'+year+'_'+Time;

	var folder = nlapiCreateRecord('folder');
	folder.setFieldValue('name','ErrorFolder_ABAI_'+timeStamp);
	folder.setFieldValue('parent',parentFolderID);

	folderid = nlapiSubmitRecord(folder,true,true);
	log('folderid::' + folderid);


}

function parseInstitutionFileContentcoursesequence(fileid) {

	log('File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 				   = replaceOriginalData(datacontent[0]);
			var name 			   = replaceOriginalData(datacontent[1]);
			var Institution_ID     = replaceOriginalData(datacontent[2]);
			var Coordinator_ID     = replaceOriginalData(datacontent[3]);
			var Department         = replaceOriginalData(datacontent[4]);
			var Approval_Level     = replaceOriginalData(datacontent[5]);
			var Academic_Structure = (replaceOriginalData(datacontent[6])).trim();
			var Website 		   = replaceOriginalData(datacontent[7]);
			var Renewal_Date       = replaceOriginalData(datacontent[8]);
			var status			   = replaceOriginalData(datacontent[10]);

			
			if(Website){ 
				
				var firstchar = Website.substring(0,4); 
				if(firstchar != 'http' && firstchar != 'ftp'){
				 Website = 'http://'+Website;
				} 
		     }
			 

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.name = name;
			dataobject.Institution_ID = Institution_ID;
			dataobject.Coordinator_ID = Coordinator_ID;
			dataobject.Department = Department;
			dataobject.Approval_Level = Approval_Level;
			dataobject.Academic_Structure = Academic_Structure;
			dataobject.Website = Website;
			dataobject.Renewal_Date = Renewal_Date;
			dataobject.status = status;
			

			try {
				createCourseSequenceRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Course Sequence::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}

		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'CourseSequence_Error_File');
		}

		check_governance();
	}
}

function parseCourseSequence(fileid) {

	log('File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 				   = replaceOriginalData(datacontent[0]);
			var name 			   = replaceOriginalData(datacontent[1]);
			var edition 		   = replaceOriginalData(datacontent[2]);
			var Institution_ID 	   = replaceOriginalData(datacontent[3]);
			var Coordinator_ID 	   = replaceOriginalData(datacontent[4]);
			var Department 		   = replaceOriginalData(datacontent[5]);
			var Approval_Level 	   = replaceOriginalData(datacontent[6]);
			var Academic_Structure = datacontent[7]?(replaceOriginalData(datacontent[7])).trim():datacontent[7];
			var Website 		   = replaceOriginalData(datacontent[8]);
			var statusDet  		   = replaceOriginalData(datacontent[10]);
			

			if (Website) {
				var firstchar = Website.substring(0, 4);
				if (firstchar != 'http' && firstchar != 'ftp') {
					Website = 'http://' + Website;
				}
			}

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}

			var dataobject = {};

			dataobject.id = id;
			dataobject.name = name;
			dataobject.Institution_ID = Institution_ID;
			dataobject.Coordinator_ID = Coordinator_ID;
			dataobject.Department = Department;
			dataobject.Approval_Level = Approval_Level;
			dataobject.Academic_Structure = Academic_Structure;
			dataobject.Website = Website;
			dataobject.status = statusDet;
			dataobject.edition = edition;

			try {
				createCourseSequenceRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:CourseSequence::ID' + id);

				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'CourseSequence_Error_File');
		}

		check_governance();
	}
}

/**
 * function to process the Content File and create the File Data Content...
 * 
 * @param fileid
 */

function parseCourseFilecontent(fileid) {

	log('File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');


			var id 							= replaceOriginalData(datacontent[0]);
			var Title 						= replaceOriginalData(datacontent[1]);
			var Number 						= replaceOriginalData(datacontent[2]);
			var Institution_ID 				= replaceOriginalData(datacontent[3]);
			var Credit_Level 				= replaceOriginalData(datacontent[4]);
			var Credit_Hours 				= replaceOriginalData(datacontent[5]);
			var Offers_Verified_Experience = replaceOriginalData(datacontent[6]);
			var Mode_Of_Instruction = replaceOriginalData(datacontent[7]);
			
			var statusDet  = datacontent[9];
			//var status = getListVal(statusDet);

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.Title = Title;
			dataobject.Number = Number;
			dataobject.Institution_ID = Institution_ID;
			dataobject.Credit_Level = Credit_Level;
			dataobject.Credit_Hours = Credit_Hours;
			dataobject.Offers_Verified_Experience = Offers_Verified_Experience;
			dataobject.Mode_Of_Instruction = Mode_Of_Instruction;
			dataobject.status = statusDet;

			try {
				createCourseRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ', 'TYPE:Course::ID'
						+ id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'FileContent_Error_File');
		}

		check_governance();
	}
}

function parseCoordinatorFileContent(fileid) {

	log('File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');


			var id 							  = replaceOriginalData(datacontent[0]);
			var BACB_ID 					  = replaceOriginalData(datacontent[1]);
			var First_Name 					  = replaceOriginalData(datacontent[2]);
			var Middle_Name 				  = replaceOriginalData(datacontent[3]);
			var Last_Name 					  = replaceOriginalData(datacontent[4]);
			var Email 			 			  = replaceOriginalData(datacontent[5]);
			var Coordinator_Flag			  = replaceOriginalData(datacontent[6]);
			var Non_Certified_Instructor_Flag = replaceOriginalData(datacontent[7]);
			var statusDet  					  = replaceOriginalData(datacontent[9]);
			//var status = getListVal(statusDet);
			
			
			

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			if (Coordinator_Flag == 1) {
				Coordinator_Flag = 'T';
			} else {
				Coordinator_Flag = 'F';
			}

			if (Non_Certified_Instructor_Flag == 1) {
				Non_Certified_Instructor_Flag = 'T';
			} else {
				Non_Certified_Instructor_Flag = 'F';
			}

			var dataobject = {};

			dataobject.id = id;
			dataobject.BACB_ID = BACB_ID;
			dataobject.First_Name = First_Name;
			dataobject.Middle_Name = Middle_Name;
			dataobject.Last_Name = Last_Name;
			dataobject.Email = Email;
			//dataobject.Accept_Affidavit = Accept_Affidavit;
			//dataobject.Highest_Degree_Major = Highest_Degree_Major;
			//dataobject.Highest_Degree = Highest_Degree;
			dataobject.Coordinator_Flag = Coordinator_Flag;
			dataobject.Non_Certified_Instructor_Flag = Non_Certified_Instructor_Flag;
			dataobject.status = statusDet;

			try {
				createCoordinatorRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Coordinator::ID' + id);

				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}

		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'Coordinator_Error_File');
		}

		check_governance();
	}
}

function InititateCourseSequenceCourseAssignment(fileid) {

	log('File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id = datacontent[0];
			var Course_ID = datacontent[1];
			var Course_Sequence = datacontent[2];
			
			var statusDet  = datacontent[4];
			//var status = getListVal(statusDet);

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.Course_ID = Course_ID;
			dataobject.Course_Sequence = Course_Sequence;
			dataobject.status = statusDet;
			
			

			try {
				createCourseSeqCourseAssg(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Course Seq Course Assign ::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}

		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'CourseSeq_CourseAssg_Error_File');
		}

		check_governance();
	}
}

/**
 * Function to process the Instructor Group File Content.
 * 
 * @param fileid
 */

function initiateInstructorGroupFilecontent(fileid) {

	log('IG File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('IG institution file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id = datacontent[0];
			var Course_Sequence_ID = datacontent[1];
			var Coordinator_ID = datacontent[2];

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.Course_Sequence_ID = Course_Sequence_ID;
			dataobject.Coordinator_ID = Coordinator_ID;

			try {
				createInstructorGroupRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Instrucctor Group::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'InstructorGroup_Error_File');
		}

		check_governance();
	}
}

function InititateAlternateCourse(fileid) {

	log('Alternate Course File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('Alternate Course file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 			= replaceOriginalData(datacontent[0]);
			var Course_ID 	= replaceOriginalData(datacontent[1]);
			var Type 		= replaceOriginalData(datacontent[2]);
			var Value 		= replaceOriginalData(datacontent[3]);

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.Course_ID = Course_ID;
			dataobject.Type = Type;
			dataobject.Value = Value;

			try {
				createAlternateCourseIDRecords(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Alternate Course::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'AlternateCourse_Error_File');
		}

		check_governance();
	}
}

function parseCountentHours(fileid) {

	log('Content Hours File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('Content Hours file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 										= replaceOriginalData(datacontent[0]);
			var Course_Sequence_Course_Assignment_ID    = replaceOriginalData(datacontent[1]);
			var Type 									= replaceOriginalData(datacontent[2]);
			var Active_Start_Date 						= replaceOriginalData(datacontent[3]);
			var Active_End_Date 						= replaceOriginalData(datacontent[4]);
			var Active_Start_Year 						= replaceOriginalData(datacontent[5]);
			var Active_End_Year 						= replaceOriginalData(datacontent[6]);
			var Active_Start_Quarter 					= replaceOriginalData(datacontent[7]);
			var Active_End_Quarter 						= replaceOriginalData(datacontent[8]);
			var Active_Start_Semester 					= replaceOriginalData(datacontent[9]);
			var Active_End_Semester						= replaceOriginalData(datacontent[10]);
			
			var statusDet  = datacontent[12];
			//var status = getListVal(statusDet);

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}

			if (Active_Start_Date == 'NULL') {
				Active_Start_Date = '';
			} else {
				Active_Start_Date = new Date(Active_Start_Date);
			}

			if (Active_End_Date == 'NULL') {
				Active_End_Date = '';
			} else {
				Active_End_Date = new Date(Active_End_Date);
			}

			if (Active_Start_Year == 'NULL' || Active_Start_Year == '' || Active_Start_Year == undefined || Active_Start_Year == null) {
				Active_Start_Year = '';
			} else {
				Active_Start_Year = (new Date(Active_Start_Year)).getFullYear();
			}

			if (Active_End_Year == 'NULL' || Active_End_Year == '' || Active_End_Year == undefined || Active_End_Year == null) {
				Active_End_Year = '';
			} else {
				Active_End_Year = (new Date(Active_End_Year)).getFullYear();
			}

			var dataobject = {};

			dataobject.id = id;
			dataobject.Course_Sequence_Course_Assignment_ID = Course_Sequence_Course_Assignment_ID;
			dataobject.Type = Type;
			dataobject.Active_Start_Date = Active_Start_Date;
			dataobject.Active_End_Date = Active_End_Date;
			dataobject.Active_Start_Year = Active_Start_Year;
			dataobject.Active_End_Year = Active_End_Year;
			dataobject.Active_Start_Quarter = Active_Start_Quarter;
			dataobject.Active_End_Quarter = Active_End_Quarter;
			dataobject.Active_Start_Semester = Active_Start_Semester;
			dataobject.Active_End_Semester = Active_End_Semester;
			
			dataobject.status = statusDet;

			try {
				createContentHoursRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Content Hours::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'ContentHours_Error_File');
		}

		check_governance();
	}
}

/**
 * Function to create the AP Waiver Record.
 * 
 * @param fileid
 */

function parseAPWaiverFilecontent(fileid) {

	log('AP Waiver File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('AP Waiver file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			
			var contentData = handleStringCases(filcontent[itr]);
			var datacontent = contentData.split(',');

			var id 					= replaceOriginalData(datacontent[0]);
			var nameid 				= replaceOriginalData(datacontent[1]);
			var Type 				= replaceOriginalData(datacontent[2]);
			var CourseSequenceId 	= replaceOriginalData(datacontent[3]);
			var StartDate 			= replaceOriginalData(datacontent[4]);
			var EndDate 			= replaceOriginalData(datacontent[5]);
			var statusDet  			= replaceOriginalData(datacontent[7]);
		//	var status = getListVal(statusDet);
			

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}

			var dataobject = {};

			dataobject.id = id;
			dataobject.type = Type;
			dataobject.CourseSequenceId = CourseSequenceId;
			dataobject.StartDate = new Date(StartDate);
			dataobject.EndDate = new Date(EndDate);
			
			dataobject.status =statusDet;
			dataobject.nameid = nameid;
			

			try {
				createAPWaiverRecord(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:AP Waiver ::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'APWAIVER_Error_File');
		}

		check_governance();
	}
}

function parseCountentAreaHoursAllocation(fileid) {

	log('Content Area Hours File ID::' + fileid);
	var failedLines = [];
	var filcontent = nlapiLoadFile(fileid).getValue().split(/\n|\n\r/);
	log('Content Area Hours file processing started');

	if (filcontent) {
		log('File Length ::' + filcontent.length);

		for (var itr = 1; itr < filcontent.length; itr++) {

			// check_governance();
			check_governance();
			//log('In Content Hours Alloc - Actual Data  ::' +(filcontent[itr]));
			var contentData = handleStringCases(filcontent[itr]);
			//log('In Content Hours Alloc - after parsing ::' + JSON.stringify(contentData));
			var datacontent = contentData.split(',');
			//log('In Content Hours Alloc - datacontent::' + JSON.stringify(datacontent));
			var id 					= replaceOriginalData(datacontent[0]);
			var Content_Hours_ID 	= replaceOriginalData(datacontent[1]);
			var Type 				= replaceOriginalData(datacontent[2]);
			//log('In Content Hours Alloc - Type::' + Type+'Type Length:');
			
			if(type && type !=''){
			//log('In Content Hours Alloc - Type::' + Type+'Type Length:'+type.length);	
			}
			var Value 				= replaceOriginalData(datacontent[3]);
			var statusDet  			= replaceOriginalData(datacontent[5]);
			//var status = getListVal(statusDet);

			if (id == '' || id == undefined || id == ' ') {
				continue;
			}
			var dataobject = {};

			dataobject.id = id;
			dataobject.Content_Hours_ID = Content_Hours_ID;
			dataobject.Type = Type;
			dataobject.Value = Value;
			dataobject.status = statusDet;

			try {
				createContentHoursAllocRecords(dataobject);
			} catch (e) {
				nlapiLogExecution('DEBUG', 'DATA FAILED ',
						'TYPE:Content Hours Alloc::ID' + id);
				var exception_details;
				if (e instanceof nlobjError) {
					exception_details = 'Failed ::'+ e.getCode() + '::Error Details::' + e.getDetails();
				} else {
					exception_details = 'JAVA Execution::'
						+ e.toString();
				}
				log('The Exception Details ::' + exception_details);

				var exceptionDetails_arr = [];
				exceptionDetails_arr.push(exception_details);

				var dataDetails = filcontent[itr].split(',');
				exceptionDetails_arr.push(dataDetails);

				failedLines.push(exceptionDetails_arr);
				continue;
			}

			check_governance();
		}
		if(failedLines.length>0){
			var headerRow = 'Error Description'+','+filcontent[0];
			failedLines.unshift(headerRow);

			createErrorFile(failedLines,'ContentHoursAreaAlloc_Error_File');
		}

		check_governance();
	}
}

function log(msg) {
	nlapiLogExecution('DEBUG', 'ABAI INTEGRATION', msg);
}

function logit(msg) {
	nlapiLogExecution('DEBUG', 'ABAI INTEGRATION', msg);
}

function movefiletoProcessFolder(institutionfileid){

	var filcontent = nlapiLoadFile(institutionfileid);

	var fileName = filcontent.getName();

	var sysNoteName  = sysDate(fileName);

	filcontent.setName(sysNoteName) 
	filcontent.setFolder(processedFolderId);
	

	var fileid = nlapiSubmitFile(filcontent);


}


function reverseExpiredLogic(recordtype,fieldid,searchid,expiredfieldid){
	
	logit('Execution Started for unchecking recordtype:'+recordtype);
	
	var loadSearch = nlapiLoadSearch(recordtype,searchid);
	var runsearch  = loadSearch.runSearch();
	var start= 0;var endindex = 1000;
	
	do{
			
		var searchResults = runsearch.getResults(start,endindex);
		if(searchResults && searchResults.length>0){
			
			for(var itr=0;itr<searchResults.length;itr++){
				
				
				var internalid  	   = searchResults[itr].getValue('internalid');
				var ispresentincsv     = searchResults[itr].getValue(fieldid);
				
				var recordid           = nlapiLoadRecord(recordtype,internalid);
				if(ispresentincsv == 'T'){
					recordid.setFieldValue(fieldid, 'F');
				}else{
					recordid.setFieldValue(expiredfieldid, new Date());
				}
				
				var idsupdated= nlapiSubmitRecord(recordid, true, true);
				logit('recordtype::'+recordtype+ 'updated::'+ idsupdated);
				
				check_governance();
				
			}
			 start    = endindex;
			 endindex = endindex+1000;
		}
		
	}while(searchResults.length>0);
	logit('Execution Ended for recordtype:'+recordtype);
	
	
}

/**
 * This function will delete all the record id's which are passed from the
 * script parameter
 * 
 * @returns void
 */

function processor() {

	var batchrecordid = context.getSetting('SCRIPT',
	'custscript_abai_intg_log_recid');
	logit('batchrecordid:' + batchrecordid);
	var loadRec = nlapiLoadRecord('customrecord_abai_int_batch_logger',
			batchrecordid);

	var institutionfileid = loadRec.getFieldValue('custrecord_institue_fileid'); // get
	// the
	// institution
	// File
	// ID
	var institutionaddres = loadRec.getFieldValue('custrecord_institueaddr_fileid'); // get the
	// Institution
	// Address File
	// ID
	var coursesequence 			= loadRec.getFieldValue('custrecord_coursesseq_fileid');
	var coordinator 			= loadRec.getFieldValue('custrecord_coordinaor_fileid');
	var course 				    = loadRec.getFieldValue('custrecord_course_fileid');
	var apwaiver 				= loadRec.getFieldValue('custrecord_apwaiver_fileid');
	var instructorgroup 		= loadRec.getFieldValue('custrecord_instructorgrp_fileid');
	var courseseq_crsassig 		= loadRec.getFieldValue('custrecord_courseseq_crsass_fileid');
	var alternativecourseid 	= loadRec.getFieldValue('custrecord_alt_courseid_fileid');
	var contenthours 			= loadRec.getFieldValue('custrecord_cont_hours_fileid');
	var contAreaHrsallocat 		= loadRec.getFieldValue('custrecord_cont_hsallocat_fileid');

	{

		logit('institutionfileid:' + institutionfileid);
		logit('institutionaddres:' + institutionaddres);
		logit('coursesequence:' + coursesequence);
		logit('coordinator:' + coordinator);

		if (institutionfileid){
			// ......create the institution record reading the file....//
			parseInstitutionFileContent(institutionfileid);
			// .......End of the institution record.....//
			movefiletoProcessFolder(institutionfileid);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_institution','custrecord_prsnt_csv_instn',customrecord_institution_id,'custrecord_dt_dissapr_instn');
		}

		if (institutionaddres){
			// ......create the institution address record reading the
			// file....//
			parseInstitutionAddressFilecontent(institutionaddres);
			// .......End of the institution address record.....//
			movefiletoProcessFolder(institutionaddres);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_institution_address','custrecord_prsnt_csv_instn_addr',customrecord_institution_address_id,'custrecord_dt_dissapr_instn_addr');
		}

		if (coordinator){
			// ......create the co ordinator record reading the file....//
			parseCoordinatorFileContent(coordinator);
			// .......End of the co ordinator record.....//
			movefiletoProcessFolder(coordinator);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_coordinator','custrecord_prsnt_csv_crdntr',customrecord_coordinator_id,'custrecord_dt_dissapr_crdntr');
		}

		if (coursesequence){
			// ......create the course sequence record reading the file....//
			parseCourseSequence(coursesequence);
			// parseCoourseSequenceFilecontent(coursesequence);
			movefiletoProcessFolder(coursesequence);
			// .......End of the course sequence address record.....//
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_course_sequence','custrecord_prsnt_csv_crse_seq',customrecord_course_sequence_id,'custrecord_dt_dissapr_crse_seq');
		}
		if (course){
			// ......create the course record reading the file....//
			parseCourseFilecontent(course);
			movefiletoProcessFolder(course);
			// .......End of the course address record.....//
			//un check the expired logic
			reverseExpiredLogic('customrecord_bacb_course','custrecord_prsnt_csv_crse',customrecord_bacb_course_id,'custrecord_dt_dissapr_crse');
		}

		// if(coursesequence){

		if (apwaiver){
			// ......create the ap waiver record reading the file....//
			parseAPWaiverFilecontent(apwaiver);
			// .......End of the ap waiver address record.....//
			movefiletoProcessFolder(apwaiver);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_ap_waiver','custrecord_is_prsnt_ap_waivr',customrecord_ap_waiver_id,'custrecord_dt_dissapr_ap_waiver');
			
		}

		//if (instructorgroup)
		// ......create the instructor Group record reading the file....//
		//initiateInstructorGroupFilecontent(instructorgroup);
		// .......End of the instructor Group record.....//

		if (courseseq_crsassig){
			// ......create the course sequence cource assignment record reading
			// the file....//
			InititateCourseSequenceCourseAssignment(courseseq_crsassig);
			// .......End of thecourse sequence cource assignment record.....//
			movefiletoProcessFolder(courseseq_crsassig);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_crse_seqnc_crse_assignmnt','custrecord_prsnt_csv_crse_seq_crs_asn',customrecord_crse_seqnc_crse_assignmnt_id,'custrecord_dt_dissapr_crs_seq_crs_asn');
			
		}

		if (alternativecourseid){
			// ......create the alternative course id reading the file....//
			InititateAlternateCourse(alternativecourseid);
			// .......End of the alternative course id record.....//
			movefiletoProcessFolder(alternativecourseid);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_altrnte_crseid','custrecord_prsnt_csv_altn_crse',customrecord_altrnte_crseid_id,'custrecord_dt_dissapr_altnt_course');
			
			
		}

		if (contenthours){
			// ......create the content hours allocation reading the file....//
			parseCountentHours(contenthours);
			// .......End of the content hours allocation id record.....//
			movefiletoProcessFolder(contenthours);
			
			//un check the expired logic
			reverseExpiredLogic('customrecord_content_hours','custrecord_prsnt_csv_cnt_hrs',customrecord_content_hours_id,'custrecord_dt_dissapr_cnt_hrs');
		}

		if (contAreaHrsallocat){
			// ......create the content area hours allocation reading the
			// file....//
			parseCountentAreaHoursAllocation(contAreaHrsallocat);
			// .......End of the content area hours allocation id record.....// 
			movefiletoProcessFolder(contAreaHrsallocat);
			

			//un check the expired logic
			reverseExpiredLogic('customrecord_content_area_hrs_alloc','custrecord_is_prsnt_csv_cntnt_ar_hrs',customrecord_content_area_hrs_alloc_id,'custrecord_dt_dissapr_cntnt_ar_hrs_alloc');
			
		}
		
		var status = nlapiScheduleScript('customscript_sch_process_sync_data','customdeploy_sch_rcprocess_syncdata');
		logit('status of RC Sync ::'+status);
	}

}


function sysDate(NameFull) {
	var date = new Date();

	var day = date.getDate();
	var month = date.getMonth()+1;
	var year  = date.getFullYear();

	var timeinMili = startdate.getTime();

	var fileNameDet = NameFull.split('.');

	var fileName  = fileNameDet[0];
	var extension = fileNameDet[1];

	var fullName = fileName+'_'+day.toString()+month.toString()+year.toString()+'_'+timeinMili+'.'+extension;
	logit('fullName::'+fullName);
	return fullName ;
}


function searchRecord(type,externalid){

	if(type && externalid){

		var filters  = [];
		var cols 	 = [];

		filters.push(new nlobjSearchFilter('externalid',null,'anyof',externalid));

		cols.push(new nlobjSearchColumn('internalid'));

		var searchRes = nlapiSearchRecord(type,null,filters,cols);
		if(searchRes && searchRes.length>0){

			var id = searchRes[0].getValue('internalid');
			return id;
		}else{
			return null;
		}
	}else{
		return null;
	}



}

function checkUpdateRequest(externalid,recordType){

	if(externalid && recordType){

		var filters = [], cols = [];
		filters.push(new nlobjSearchFilter('externalid',null,'anyof',externalid));

		cols.push(new nlobjSearchColumn('internalid'));

		var searchRes = nlapiSearchRecord(recordType,null,filters,cols);

		if(searchRes && searchRes.length>0){
			return searchRes[0].getValue('internalid');
		}else{
			return null;
		}	

	}else{
		return null;
	}


}

/**
 * Function to create the Institution Record..
 * 
 * @param dataobj
 */
function createInstitutionRecord(dataobj) {
	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_institution');
	var institutionrecord;
	var createRecord = false;

	if(isUpdateid){
		institutionrecord = nlapiLoadRecord('customrecord_institution',isUpdateid);
		var isExpired     = institutionrecord.getFieldValue('custrecord_dt_dissapr_instn');
		if(isExpired ){
			institutionrecord.setFieldValue('custrecord_dt_dissapr_instn',null);
		}
		
	}else{

		institutionrecord = nlapiCreateRecord('customrecord_institution');
		
		createRecord = true;
	}
	
	institutionrecord.setFieldValue('custrecord_prsnt_csv_instn', 'T');
	
	institutionrecord.setFieldValue('externalid', dataobj.id);
	institutionrecord.setFieldValue('custrecord_institn_crm_identifier', dataobj.id);

	institutionrecord.setFieldValue('custrecord_bacb_insti_cred_sys',dataobj.creditsystem);
	//institutionrecord.setFieldValue('custrecord_insttn_credit_sys_othr',
	//dataobj.creditsystemother);
	institutionrecord.setFieldValue('custrecord_bacb_insti_accr_body',dataobj.accrbody);
	institutionrecord.setFieldValue('custrecord_institn_website',dataobj.website);
	institutionrecord.setFieldValue('custrecord_insttn_name',dataobj.institutename);
	institutionrecord.setFieldValue('custrecord_insttn_status',dataobj.status);
			
	if(createRecord){
		institutionrecord.setFieldValue('custrecord_flag_new_institution',"T");
	}else{
		
		var isUniqueInsexist = institutionrecord.getFieldValue('custrecord_uniq_instn_name');
		if(isUniqueInsexist){
			institutionrecord.setFieldValue('custrecord_flag_new_institution',"F");
		}
		
	}

	var institutionid = nlapiSubmitRecord(institutionrecord, true, true);
	logit('institutionid::' + institutionid);

}

/**
 * Function to create the AP Waiver Record.
 * 
 * @param dataobject
 */
function createAPWaiverRecord(dataobject) {

	var externalid = dataobject.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_ap_waiver');
	var apwaiver;

	if(isUpdateid){
		apwaiver = nlapiLoadRecord('customrecord_ap_waiver',isUpdateid);
		
		var isExpired     = apwaiver.getFieldValue('custrecord_dt_dissapr_ap_waiver');
		if(isExpired ){
			apwaiver.setFieldValue('custrecord_dt_dissapr_ap_waiver',null);
		}
		
	}else{

		apwaiver = nlapiCreateRecord('customrecord_ap_waiver');
	}

	apwaiver.setFieldValue('custrecord_is_prsnt_ap_waivr', 'T');
	apwaiver.setFieldValue('externalid', dataobject.id);
	apwaiver.setFieldValue('custrecord_ap_waiver_crm_identifier', dataobject.id);

	apwaiver.setFieldText('custrecord_ap_waiver_type', dataobject.type);
	

	var coursesequenceid = searchRecord('customrecord_course_sequence',dataobject.CourseSequenceId);

	apwaiver.setFieldValue('custrecord_ap_waivr_crse_sequnce',coursesequenceid);
	apwaiver.setFieldValue('custrecord_ap_waiver_start_dat',dataobject.StartDate);
	apwaiver.setFieldValue('custrecord_ap_waiver_end_date', dataobject.EndDate);
	apwaiver.setFieldValue('custrecord_ap_waiver_name_id',dataobject.nameid);
	apwaiver.setFieldValue('custrecord_ap_waiver_status',dataobject.status);
	

	var apwaiverid = nlapiSubmitRecord(apwaiver, true, true);
	logit('apwaiverid::' + apwaiverid);

}

/**
 * Function to create the Course Sequence Record
 * 
 * @param dataobj
 */
function createCourseSequenceRecord(dataobj) {

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_course_sequence');
	var courseSequenceRecord;

	if(isUpdateid){
		courseSequenceRecord = nlapiLoadRecord('customrecord_course_sequence',isUpdateid);
		
		var isExpired     = courseSequenceRecord.getFieldValue('custrecord_dt_dissapr_crse_seq');
		if(isExpired){
			courseSequenceRecord.setFieldValue('custrecord_dt_dissapr_crse_seq',null);
		}
		
	}else{

		courseSequenceRecord = nlapiCreateRecord('customrecord_course_sequence');
	}

	courseSequenceRecord.setFieldValue('custrecord_prsnt_csv_crse_seq', 'T');
	// courseSequenceRecord.setFieldValue('id',dataobj.id);
	courseSequenceRecord.setFieldValue('externalid', dataobj.id);

	courseSequenceRecord.setFieldValue('custrecord_crse_seqnc_crm_identifier', dataobj.id);

	var institutionid = searchRecord('customrecord_institution',dataobj.Institution_ID);
	var coordinatorid = searchRecord('customrecord_coordinator',dataobj.Coordinator_ID);

	courseSequenceRecord.setFieldValue('custrecord_crse_seq_institutn',institutionid);
	courseSequenceRecord.setFieldValue('custrecord_crse_seq_coordintr',coordinatorid);
	courseSequenceRecord.setFieldValue('custrecord_crse_seq_departmnt',dataobj.Department);
	courseSequenceRecord.setFieldValue('custrecord_crse_seq_apprvl_level',dataobj.Approval_Level);
	courseSequenceRecord.setFieldValue('custrecord_crse_seq_website',dataobj.Website);
	courseSequenceRecord.setFieldValue('custrecord_crse_seq_crs_name',dataobj.name);
	
	courseSequenceRecord.setFieldValue('custrecord_crse_seqnc_edition',dataobj.edition);
	courseSequenceRecord.setFieldValue('custrecord_crse_seqnc_status',dataobj.status);
	

	var courseSequenceRecordid = nlapiSubmitRecord(courseSequenceRecord, true,true);
	logit('courseSequenceRecordid::' + courseSequenceRecordid);

	var loadRec = nlapiLoadRecord('customrecord_course_sequence',courseSequenceRecordid);
	loadRec.setFieldText('custrecord_crse_seq_acad_strctre',dataobj.Academic_Structure);
	nlapiSubmitRecord(loadRec,true,true);

}

/**
 * Function to create the Course Record..
 * 
 * @param dataobj
 */

function createCourseRecord(dataobj) {

	var OffersVerified = 'F';
	if (dataobj.Offers_Verified_Experience == 'True') {
		OffersVerified = 'T';
	} else {
		OffersVerified = 'F';
	}


	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_bacb_course');
	var courseRecord;

	if(isUpdateid){
		courseRecord = nlapiLoadRecord('customrecord_bacb_course',isUpdateid);
		
		var isExpired     = courseRecord.getFieldValue('custrecord_dt_dissapr_crse');
		if(isExpired){
			courseRecord.setFieldValue('custrecord_dt_dissapr_crse',null);
		}
		
	}else{

		courseRecord = nlapiCreateRecord('customrecord_bacb_course');
	}

	courseRecord.setFieldValue('custrecord_prsnt_csv_crse', 'T');
	// courseRecord.setFieldValue('id',dataobj.id);
	courseRecord.setFieldValue('externalid', dataobj.id);
	courseRecord.setFieldValue('custrecord_course_crm_identifier', dataobj.id);

	courseRecord.setFieldValue('custrecord_course_title', dataobj.Title);
	courseRecord.setFieldValue('custrecord_course_number', dataobj.Number);
	courseRecord.setFieldText('custrecord_course_credit_level',dataobj.Credit_Level);

	var institutionid = searchRecord('customrecord_institution',dataobj.Institution_ID);

	courseRecord.setFieldValue('custrecord_course_institutn_id',institutionid);
	courseRecord.setFieldValue('custrecord_course_credit_hours',dataobj.Credit_Hours);
	courseRecord.setFieldValue('custrecord_offers_approved_experience',OffersVerified);
	//courseRecord.setFieldText('custrecord_course_mode_of_instrctn',dataobj.Mode_Of_Instruction);
	courseRecord.setFieldValue('custrecord_course_status',dataobj.status);

	var courseRecordid = nlapiSubmitRecord(courseRecord, true, true);
	logit('courseRecordid::' + courseRecordid);

	var loadRec = nlapiLoadRecord('customrecord_bacb_course',courseRecordid);
	loadRec.setFieldText('custrecord_course_mode_of_instrctn',dataobj.Mode_Of_Instruction);
	nlapiSubmitRecord(loadRec,true,true);

}

/**
 * Function to create the Coordinator Record.
 * 
 * @param dataobj
 */
function createCoordinatorRecord(dataobj) {

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_coordinator');
	var coordinatorrecord;

	if(isUpdateid){
		coordinatorrecord = nlapiLoadRecord('customrecord_coordinator',isUpdateid);
		
		var isExpired     = coordinatorrecord.getFieldValue('custrecord_dt_dissapr_crdntr');
		if(isExpired ){
			coordinatorrecord.setFieldValue('custrecord_dt_dissapr_crdntr',null);
		}
		
	}else{

		coordinatorrecord = nlapiCreateRecord('customrecord_coordinator');
	}

	coordinatorrecord.setFieldValue('custrecord_prsnt_csv_crdntr', 'T');
	// coordinatorrecord.setFieldValue('id',dataobj.id);
	coordinatorrecord.setFieldValue('externalid', dataobj.id);
	coordinatorrecord.setFieldValue('custrecord_coordinator_crm_identifier', dataobj.id);
	coordinatorrecord.setFieldValue('custrecord_coordinator_bacb_id',
			dataobj.BACB_ID);
	coordinatorrecord.setFieldValue('custrecord_coordinatr_first_name',
			dataobj.First_Name);
	coordinatorrecord.setFieldValue('custrecord_coordinatr_middle_name',
			dataobj.Middle_Name);
	coordinatorrecord.setFieldValue('custrecord_coordinatr_last_name',
			dataobj.Last_Name);
	coordinatorrecord.setFieldValue('custrecord_coordinator_email',
			dataobj.Email);

	coordinatorrecord.setFieldValue('custrecord_coordinator_cordtr_flag',
			dataobj.Coordinator_Flag);
	coordinatorrecord.setFieldValue('custrecord_cordntr_non_cerfd_flg',
			dataobj.Non_Certified_Instructor_Flag);
	
	coordinatorrecord.setFieldValue('custrecord_cordntr_status',
			dataobj.status);

	var coordinatorid = nlapiSubmitRecord(coordinatorrecord, true, true);
	logit('coordinatorid::' + coordinatorid);

}

/**
 * Function to create the Instructor Group Record..
 * 
 * @param dataobj
 */
function createInstructorGroupRecord(dataobj) {

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_instrctr_group');
	var instructorgroup;

	if(isUpdateid){
		instructorgroup = nlapiLoadRecord('customrecord_instrctr_group',isUpdateid);
		instructorgroup.setFieldValue('', 'T');
	}else{

		instructorgroup = nlapiCreateRecord('customrecord_instrctr_group');
	}

	// instructorgroup.setFieldValue('id',dataobj.id);
	instructorgroup.setFieldValue('externalid', dataobj.id);
	instructorgroup.setFieldValue('custrecord_instructr_grp_crm_id', dataobj.id);

	var coursesequenceid = searchRecord('customrecord_course_sequence',dataobj.Course_Sequence_ID);
	var coordinatorid = searchRecord('customrecord_coordinator',dataobj.Coordinator_ID);

	instructorgroup.setFieldValue('custrecord_instrcr_grp_crse_seq_id',coursesequenceid);
	instructorgroup.setFieldValue('custrecord_instrctr_grp_coordntr_id',coordinatorid);

	var instructorgroupid = nlapiSubmitRecord(instructorgroup, true, true);
	logit('instructorgroupid::' + instructorgroupid);

}

/**
 * Function to create the Course Sequence Course Assignment Record
 * 
 * @param dataobj
 */
function createCourseSeqCourseAssg(dataobj) {

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_crse_seqnc_crse_assignmnt');
	var courseseqcourseassg;

	if(isUpdateid){
		courseseqcourseassg = nlapiLoadRecord('customrecord_crse_seqnc_crse_assignmnt',isUpdateid);
		
		var isExpired     = courseseqcourseassg.getFieldValue('custrecord_dt_dissapr_crs_seq_crs_asn');
		if(isExpired ){
			courseseqcourseassg.setFieldValue('custrecord_dt_dissapr_crs_seq_crs_asn',null);
		}
		
		
	}else{

		courseseqcourseassg = nlapiCreateRecord('customrecord_crse_seqnc_crse_assignmnt');
	}

	courseseqcourseassg.setFieldValue('custrecord_prsnt_csv_crse_seq_crs_asn', 'T');
	// courseseqcourseassg.setFieldValue('id',dataobj.id);
	courseseqcourseassg.setFieldValue('externalid', dataobj.id);
	courseseqcourseassg.setFieldValue('custrecord_crse_seqnc_crs_assign_crm_id', dataobj.id);
	courseseqcourseassg.setFieldValue('custrecord_crse_seq_crse_asign_status', dataobj.status);

	var coursesequenceid = searchRecord('customrecord_course_sequence',dataobj.Course_Sequence);
	var courseid = searchRecord('customrecord_bacb_course',dataobj.Course_ID);

	courseseqcourseassg.setFieldValue('custrecord_crse_seq_crse_asign_crseseqnc',coursesequenceid);
	courseseqcourseassg.setFieldValue('custrecord_crse_seq_crse_asign_crse',courseid);

	var courseseqcourseassgid = nlapiSubmitRecord(courseseqcourseassg, true,true);
	logit('courseseqcourseassgid::' + courseseqcourseassgid);

}

/**
 * Function to create the Alternate Course Record
 * 
 * @param dataobj
 */
function createAlternateCourseIDRecords(dataobj) {

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_altrnte_crseid');
	var alternateCourseIDRecords;

	if(isUpdateid){
		alternateCourseIDRecords = nlapiLoadRecord('customrecord_altrnte_crseid',isUpdateid);
		
		var isExpired     = alternateCourseIDRecords.getFieldValue('custrecord_dt_dissapr_altnt_course');
		
		if(isExpired ){
			alternateCourseIDRecords.setFieldValue('custrecord_dt_dissapr_altnt_course',null);
		}
		
		
	}else{

		alternateCourseIDRecords = nlapiCreateRecord('customrecord_altrnte_crseid');
	}

	alternateCourseIDRecords.setFieldValue('custrecord_prsnt_csv_altn_crse', 'T');
	// alternateCourseIDRecords.setFieldValue('id',dataobj.id);
	alternateCourseIDRecords.setFieldValue('externalid', dataobj.id);
	alternateCourseIDRecords.setFieldValue('custrecord_alternate_crse_crm_identifier', dataobj.id);
	alternateCourseIDRecords.setFieldValue('custrecord_altnte_crse_id_type',dataobj.Type);

	var courseid = searchRecord('customrecord_bacb_course',dataobj.Course_ID);

	alternateCourseIDRecords.setFieldValue('custrecord_altnte_crse_id_crse',courseid);
	//alternateCourseIDRecords.setFieldText('custrecord_altnte_crse_id_value',dataobj.Value);

	var alternateCourseIDRecordsid = nlapiSubmitRecord(
			alternateCourseIDRecords, true, true);
	logit('alternateCourseIDRecordsid::' + alternateCourseIDRecordsid);

	var loadRec = nlapiLoadRecord('customrecord_altrnte_crseid',alternateCourseIDRecordsid);
	loadRec.setFieldValue('custrecord_altnte_crse_id_value',dataobj.Value);
	nlapiSubmitRecord(loadRec,true,true);

}

/**
 * Function to create the Alternate Course Record
 * 
 * @param dataobj
 */
function createContentHoursAllocRecords(dataobj) {

   // logit('content Hours allocDatea:' + JSON.stringify(dataobj));

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_content_area_hrs_alloc');
	//logit('isUpdateid' + isUpdateid);
	
	var contentHoursAlloc;
	if(isUpdateid){
		contentHoursAlloc = nlapiLoadRecord('customrecord_content_area_hrs_alloc',isUpdateid);
		
		var isExpired     = contentHoursAlloc.getFieldValue('custrecord_dt_dissapr_cntnt_ar_hrs_alloc');
		if(isExpired ){
			contentHoursAlloc.setFieldValue('custrecord_dt_dissapr_cntnt_ar_hrs_alloc',null);
		}
		
	}else{

		contentHoursAlloc = nlapiCreateRecord('customrecord_content_area_hrs_alloc');
	}
	
	contentHoursAlloc.setFieldValue('custrecord_is_prsnt_csv_cntnt_ar_hrs', 'T');

	contentHoursAlloc.setFieldValue('externalid', dataobj.id);
	contentHoursAlloc.setFieldValue('custrecord_contnt_area_hrs_alloc_crm_id', dataobj.id);
	var type = null;
	if(dataobj.Type){
		
		//logit('content Hours alloc ID::' + (dataobj.Type).length);
		
		 var typeid = (dataobj.Type).trim();
		 
		//logit('typeid::' + typeid);
		  type = searchType(typeid);	
		 //logit('type' + type);
	}
	
	contentHoursAlloc.setFieldValue('custrecord_cnt_area_hrs_allctn_type', type);

	var contentHoursid = searchRecord('customrecord_content_hours',dataobj.Content_Hours_ID);
	
	//logit('contentHoursid' + contentHoursid);

	contentHoursAlloc.setFieldValue('custrecord_cnt_area_hrs_allctn_cnt_hrs', contentHoursid);
	contentHoursAlloc.setFieldValue('custrecord_cnt_area_hrs_allctn_value', dataobj.Value);
	
	contentHoursAlloc.setFieldValue('custrecord_cnt_area_hrs_allctn_status', dataobj.status);

	var contentHoursAllocid = nlapiSubmitRecord(
			contentHoursAlloc, true, true);
	logit('content Hours alloc ID::' + contentHoursAllocid);

}

function searchType(typeid){
	
	if(typeid && typeid!='' && typeid != ' ' && typeid !=undefined){

		var filters = [], cols = [];
		filters.push(new nlobjSearchFilter('custrecord_content_area_hour_type_name',null,'is',typeid));

		cols.push(new nlobjSearchColumn('internalid'));

		var searchRes = nlapiSearchRecord('customrecord_content_hour_alloc_type',null,filters,cols);

		if(searchRes && searchRes.length>0){
			return searchRes[0].getValue('internalid');
		}else{
			return null;
		}	

	}else{
		return null;
	}

	
	
	
}

/**
 * Function to create the Content Hours Record..
 * 
 * @param dataobj
 */
function createContentHoursRecord(dataobj) {


	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_content_hours');
	var contentHoursRecord;

	if(isUpdateid){
		contentHoursRecord = nlapiLoadRecord('customrecord_content_hours',isUpdateid);
		
		var isExpired     = contentHoursRecord.getFieldValue('custrecord_dt_dissapr_cnt_hrs');
		if(isExpired ){
			contentHoursRecord.setFieldValue('custrecord_dt_dissapr_cnt_hrs',null);
		}
		
	}else{

		contentHoursRecord = nlapiCreateRecord('customrecord_content_hours');
	}

	contentHoursRecord.setFieldValue('custrecord_prsnt_csv_cnt_hrs', 'T');
	// contentHoursRecord.setFieldValue('id',dataobj.id);
	contentHoursRecord.setFieldValue('externalid', dataobj.id);
	contentHoursRecord.setFieldValue('custrecord_content_hrs_crm_identifier', dataobj.id);

	var coursesequenceassig =  searchRecord('customrecord_crse_seqnc_crse_assignmnt',dataobj.Course_Sequence_Course_Assignment_ID);

	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_crseseq_crseassignmnt',coursesequenceassig);
	contentHoursRecord.setFieldText('custrecord_content_hrs_type', dataobj.Type);

	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_activ_strt_date',dataobj.Active_Start_Date);
	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_activ_end_date',dataobj.Active_End_Date);
	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_activ_strt_year',dataobj.Active_Start_Year);
	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_activ_end_year',dataobj.Active_End_Year);
	//contentHoursRecord.setFieldText('custrecord_cnt_hrs_activ_strt_quar',dataobj.Active_Start_Quarter);
	//contentHoursRecord.setFieldText('custrecord_cnt_hrs_activ_end_quar',dataobj.Active_End_Quarter);
	//contentHoursRecord.setFieldText('custrecord_cnt_hrs_activ_strt_sem',dataobj.Active_Start_Semester);
	//contentHoursRecord.setFieldText('custrecord_cnt_hrs_activ_end_sem',dataobj.Active_End_Semester);
	
	contentHoursRecord.setFieldValue('custrecord_cnt_hrs_status',dataobj.status);

	var contentHoursRecordid = nlapiSubmitRecord(contentHoursRecord, true, true);
	logit('contentHoursRecordid::' + contentHoursRecordid);

	var loadRec = nlapiLoadRecord('customrecord_content_hours',contentHoursRecordid);
	loadRec.setFieldText('custrecord_cnt_hrs_activ_strt_quar',dataobj.Active_Start_Quarter);
	nlapiSubmitRecord(loadRec,true,true);

	var loadRec = nlapiLoadRecord('customrecord_content_hours',contentHoursRecordid);
	loadRec.setFieldText('custrecord_cnt_hrs_activ_end_quar',dataobj.Active_End_Quarter);
	nlapiSubmitRecord(loadRec,true,true);

	var loadRec = nlapiLoadRecord('customrecord_content_hours',contentHoursRecordid);
	loadRec.setFieldText('custrecord_cnt_hrs_activ_strt_sem',dataobj.Active_Start_Semester);
	nlapiSubmitRecord(loadRec,true,true);

	var loadRec = nlapiLoadRecord('customrecord_content_hours',contentHoursRecordid);
	loadRec.setFieldText('custrecord_cnt_hrs_activ_end_sem',dataobj.Active_End_Semester);
	nlapiSubmitRecord(loadRec,true,true);

}

/**
 * Function to create the Institution address record.
 * 
 * @param dataobj
 */

function createInstitutionAddressRecord(dataobj) {

	//var institutionaddrrecord = nlapiCreateRecord('customrecord_institution_address');

	var externalid = dataobj.id
	var isUpdateid = checkUpdateRequest(externalid,'customrecord_institution_address');
	var institutionaddrrecord;

	if(isUpdateid){
		institutionaddrrecord = nlapiLoadRecord('customrecord_institution_address',isUpdateid);
		
		var isExpired     = institutionaddrrecord.getFieldValue('custrecord_dt_dissapr_instn_addr');
		if(isExpired){
			institutionaddrrecord.setFieldValue('custrecord_dt_dissapr_instn_addr',null);
		}
	
	}else{

		institutionaddrrecord = nlapiCreateRecord('customrecord_institution_address');
	}

	institutionaddrrecord.setFieldValue('custrecord_prsnt_csv_instn_addr', 'T');
	// institutionaddrrecord.setFieldValue('id',dataobj.id);
	institutionaddrrecord.setFieldValue('externalid', dataobj.id);
	institutionaddrrecord.setFieldValue('custrecord_institutn_addr_crm_id', dataobj.id);

	var institutionid = searchRecord('customrecord_institution',dataobj.instituionid);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_inst_id',institutionid);


	institutionaddrrecord.setFieldValue('custrecord_instn_addr_addr_line1',dataobj.addrline1);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_addr_line2',dataobj.addrline2);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_city',dataobj.city);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_state_provnc',dataobj.stateprovince);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_country',dataobj.country);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_postal_code',dataobj.postalcode);
	institutionaddrrecord.setFieldValue('custrecord_instn_addr_status',dataobj.status);

	var institutionaddrid = nlapiSubmitRecord(institutionaddrrecord, true, true);
	logit('institutionaddrid::' + institutionaddrid);

}

function sendEmail(EmailID, report) {
	try {

		var stEmailSender = context.getSetting('SCRIPT',
		'custscript_senderemail');
		log('Email Sender' + stEmailSender);
		var stSubject = 'ABAI Integration failed';
		var stBody = 'The Integration failed.The details are as follows';
		var stEmailBody = '<p>Hi,</p>' + '<p>' + stBody + '</p></br>' + '<p>'
		+ report + '</p>' + '<p>Thanks, <p/></br>'
		+ '<p>Admin <p/><br/>';
		nlapiSendEmail(stEmailSender, EmailID, stSubject, stEmailBody);
		// nlapiSendEmail('-5', EmailID, stSubject, stEmailBody);
	} catch (e) {

		var ex;
		if (e instanceof nlobjError) {
			ex = 'Code ::' + e.getCode() + '--Details- ' + e.getDetails();
		} else {
			ex = 'JAVA SCRIPT EXCEPTION ::' + e.toString();
		}
		log(' ex::' + ex);
	}
}

function createEntry(filcontent) {

	var values = filcontent.split(',');
	return values;

}

function pushArray(baseArr, tempArr) {
	if (tempArr && tempArr.length > 0) {

		for (var i = 0; i < tempArr.length; i++) {
			baseArr.push(tempArr[i]);
		}
	}

}

function inArray(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] == obj) {
			return true;
		}
	}
	return false;
}

/**
 * method to add key to the arrayMap
 * 
 * @param {String}
 *            key - key for the map
 * @param {String}
 *            value - value for the key
 * @returns {Integer} - index of position added
 */
function push_value(arr, key, value) {
	var array_map_row = [ key, value ];
	arr.push(array_map_row);
}

/**
 * method to get matching value for key
 * 
 * @param {String}
 *            key - key for the map
 * @returns {Value} - Value for the key
 */
function get_Value(arr, key) {
	var res = [];
	for (var i = 0; i < arr.length; i++) {

		if (arr[i][0] === key) {
			res.push(arr[i][1]);
		}
	}
	return res;
}

function check_governance() {
	var scheduletime = new Date();
	if ((startdate.getTime() + 3000000) <= scheduletime.getTime()
			|| parseInt(nlapiGetContext().getRemainingUsage()) <= 1000)// 2.Rescheduling
		// Part
		// Based
		// on
		// Usage
		// Count
	{
		// log('RECORD DELETED: Count:'+count+'Through Deployed
		// ID::'+nlapiGetContext().getDeploymentId());
		startdate = new Date();
		nlapiYieldScript();
	}
}

function handleStringCases(str){
var indices = [];
var quotes = '"';
var overallreplacementneeded = false;
var delimiter = ',';
var delimiterindex = [];
var temp=str;
var openQuotesfound = false;
var closedQuotesFound= false

for(var i=0; i<temp.length;i++) {
   // alert(temp[i]);
    if (temp[i] == quotes) {
		if(openQuotesfound== false && closedQuotesFound == false){
			
			openQuotesfound = true;
			indices.push(i);
            //alert("first if -openQuotesfound:"+openQuotesfound);
            //alert("first if -pushing I as Quotes Found:"+i);
            continue;
		}
        if(openQuotesfound== true && closedQuotesFound == false){
			
			closedQuotesFound = true;
			indices.push(i);
            openQuotesfound = false;
			closedQuotesFound = false;
			overallreplacementneeded = true;
           // alert("second if -closedQuotesfound:"+openQuotesfound);
           // alert("second I as Quotes Found:"+i);
             continue;
		}
	}if(temp[i] == delimiter && ( openQuotesfound == true)){
		
		delimiterindex.push(i);
        //alert("delimiter in quo pushing I as delimiterindex Found:"+i);
         continue;
		
	}
}
if(overallreplacementneeded){
var temp1;

		if(indices.length>0){
			
			for(var tr=0;tr<indices.length;tr++){
				
				 temp = replaceAt(temp, indices[tr],' ');	
          
			}	
		}
		
		if(delimiterindex.length>0){
			
			for(var ir=0;ir<delimiterindex.length;ir++){
				
				temp = replaceAt(temp, delimiterindex[ir],'|');	
				
			}

		}
		temp = temp.trim();
		return temp;
	
}else{
	
	return str;
}
}

function replaceOriginalData(str){
	
	if(str && str != undefined && str!= ''){
		var temp 		   = str;
		var delimiterindex = [];
	for(var i=0; i<temp.length;i++) {
   
		if (temp[i] == '|') {
		
			delimiterindex.push(i);
			continue;
		
		}
	}
	
	if(delimiterindex.length>0){
			
			for(var ir=0;ir<delimiterindex.length;ir++){
				
				temp = replaceAt(temp, delimiterindex[ir],',');	
				
			}

	}
	temp = temp.trim();
	return temp;
		
	} 
	else{
		return str;
	}
}

 function replaceAt(string, index,replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
}
