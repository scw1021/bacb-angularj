/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@NModuleScope Public
 */

var filenames = [];
var folderid = '10325739';


define(['N/search', 'N/record', 'N/file', 'N/runtime', 'N/https', 'N/sftp', 'N/ui/serverWidget','N/task'],
		function(search, record, file, runtime, https, sftp, serverwidget,task){

	var fileNamesObj = [];
	function getSearchResults(){
		try{

			//create filenames dynamically...
			var getTimeStamp = sysDate();
			//_'+getTimeStamp+'
			filenames.push('content_area_hours_allocation.csv');
			filenames.push('content_hours.csv');
			filenames.push('alternative_courseID.csv');
			filenames.push('course_sequence_course_assignment.csv');
			//filenames.push('instructor_group.csv');
			filenames.push('coordinator.csv');
			filenames.push('ap_waiver.csv');
			filenames.push('course.csv');
			filenames.push('course_sequence.csv');
			filenames.push('institution_address.csv');
			filenames.push('institution.csv');

			var username     = runtime.getCurrentScript().getParameter("custscript__abai_username_abai"); //Password
			var passwordGuid = runtime.getCurrentScript().getParameter("custscript_abai_password_abai"); //GUID...
			var url          = runtime.getCurrentScript().getParameter("custscript_abai_url_abai"); //URL ...
			var hostKey      = runtime.getCurrentScript().getParameter("custscript_abai_hostkey_abai"); //Host Key ....
			var GUID         = runtime.getCurrentScript().getParameter("custscript_abai_guid_abai"); //Guid...

			logit('username:'+username);
			logit('passwordGuid::'+passwordGuid);
			logit('url::'+url);
			logit('hostKey::'+hostKey);


			//'AAAAB3NzaC1yc2EAAAABIwAAAIEAx+zlC3NzEjDDtyd5rO1qsdQ7IGopFZNK++RF4fSG9xFmeaau+f3zwihFyarfJ3+0XC9/kIQ712Zs8faWGS9mL8uJlFMFBUVGUHJ+/Ph5NbCqeXXUMQEja1sQf5X+Zu+irBFR+2ClXhtiZ7K1IBOSLi84Mf9cknUKsfmVRlj8eF0='; //context.request.parameters.hostkey;


			if(url && passwordGuid && hostKey ){
				var connection = sftp.createConnection({
					username: username,
					passwordGuid: passwordGuid,
					url: url,
					hostKey: hostKey
				});

				logit('Connection Established');

				if(filenames.length>0)
				{

					for (var k = 0; k < filenames.length; k++)
					{
						logit('processing files:'+filenames[k]);

						var downloadedFile = connection.download({
							directory: '/',
							filename: filenames[k]
						});

						var filecontent = downloadedFile.getContents();

						//logit('filecontent:'+filecontent);

						var fileObj = file.create({
							name: filenames[k],
							fileType: file.Type.PLAINTEXT,
							contents: filecontent,
							folder: folderid
						});
						var newFileId = fileObj.save();
						log.debug('File Downloaded','File Saved :'+newFileId);

						push_value(fileNamesObj, filenames[k], newFileId);

						log.debug('File Downloaded','file pushed - filenames[k] :'+filenames[k]);
						log.debug('File Downloaded','so far array - fileNamesObj :'+JSON.stringify(fileNamesObj));

					}

					var abaiTrackerId = createCustomTracker(fileNamesObj);

					if(abaiTrackerId){

						//create a task and trigger the script ....
						// try {
						// 	var scriptTask = task.create({
						// 		taskType: task.TaskType.SCHEDULED_SCRIPT
						// 	});
						// 	scriptTask.scriptId = 'customscript_abai_sch_processdatafiles';
						// 	scriptTask.deploymentId = 'customdeploy_abai_sch_processdatafiles';
						// 	scriptTask.params = {
						// 			custscript_abai_intg_log_recid: abaiTrackerId
						// 	};
						// 	var scriptTaskId = scriptTask.submit();
						// 	log.debug('scriptTaskId','scriptTaskId:'+scriptTaskId);
						// } catch (ex) {

						// 	log.debug({
						// 		title: ex.name,
						// 		details: ex.message
						// 	});
						// }
					}else{
						log.debug('File Downloaded','No Integration Record Created :');
					}
				}
			}
		}
		catch(e){
			log.debug({
				title: e.name,
				details: e.message
			});
			sendEmailNoification(e);
		}
	}

	function createCustomTracker(fileNameArr){


		try{

			{

				log.debug('------'+'Coming in the ABAI Integration Record Creation');
				var docRecord = record.create({
					type: 'customrecord_abai_int_batch_logger'
				});

				docRecord.setValue({
					fieldId : 'custrecord_institue_fileid',
					value : get_Value(fileNameArr,"institution.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_institueaddr_fileid',
					value : get_Value(fileNameArr,"institution_address.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_coursesseq_fileid',
					value : get_Value(fileNameArr,"course_sequence.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_course_fileid',
					value : get_Value(fileNameArr,"course.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_apwaiver_fileid',
					value : get_Value(fileNameArr,"ap_waiver.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_coordinaor_fileid',
					value : get_Value(fileNameArr,"coordinator.csv")
				});

				/*docRecord.setValue({
					fieldId : 'custrecord_instructorgrp_fileid',
					value : fileNameArr["InstructorGroup.csv"]
				}); */

				docRecord.setValue({
					fieldId : 'custrecord_courseseq_crsass_fileid',
					value : get_Value(fileNameArr,"course_sequence_course_assignment.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_alt_courseid_fileid',
					value : get_Value(fileNameArr,"alternative_courseID.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_cont_hours_fileid',
					value : get_Value(fileNameArr,"content_hours.csv")
				});

				docRecord.setValue({
					fieldId : 'custrecord_cont_hsallocat_fileid',
					value : get_Value(fileNameArr,"content_area_hours_allocation.csv")
				});


				var docRecordId = docRecord.save({
					enableSourcing: true,
					ignoreMandatory:true
				});
				log.debug('ABAI - INTEGRATION', 'ABAI INTEGRATION RECORD: '+docRecordId);

				return docRecordId;

			}
		}catch(e){
			log.debug('errorRecordId', 'errorRecordId: '+e);
			throw e;
		}



	}

	return {
		execute: getSearchResults
	};
});

/**
 * method to add key to the arrayMap
 * @param {String}
 *            key - key for the map
 * @param {String}
 *            value - value for the key
 * @returns {Integer} - index of position added
 */
function push_value(array,key, value) {

	var array_map_row = [ key, value ];

	array.push(array_map_row);
}

/**
 * method to get matching value for key
 *
 * @param {String}
 *            key - key for the map
 * @returns {Value} - Value for the key
 */
function get_Value(array,key) {

	// forloopindex: for (var i = 0; i < ITEM_PRICE_DETAILS.length; i++) {
	for (var i = 0; i < array.length; i++) {

		if (array[i][0] === key) {

			return (array[i][1]);

			// break forloopindex;
		}
	}
	return null;
}


function sendEmailNoification(e){




}



function logit(msg){
	log.debug('ABAI INTEGRATION',msg);
}

function sysDate() {
	var date = new Date();

	var day = date.getDate();
	var month = date.getMonth()+1;
	var year  = date.getFullYear();

	var timeinMili = date.getTime();

	var fullName = day.toString()+month.toString()+year.toString()+'_'+timeinMili;
	logit('fullName::'+fullName);
	return fullName ;
}

function createFile(fileobj){

	var fileObj = file.create({
		name: file_name,
		fileType: file.Type.PLAINTEXT,
		contents: str,
		folder: folderid
	});
	var newFileId = fileObj.save();
	log.debug('File Downloaded','File Saved :'+newFileId);
}

function timestamp() {
	var str = "";
	var currentTime = new Date();
	var hours = currentTime.getHours();
	if(hours <=9){
		hours ='0'+hours ;
	}
	var minutes = currentTime.getMinutes();
	if(minutes <=9){
		minutes ='0'+minutes ;
	}
	var seconds = currentTime.getSeconds();
	if(seconds <=9){
		seconds ='0'+seconds ;
	}
	str += hours + "" + minutes + "" + seconds + " ";
	return str ;
}

function getSFTPConnection(username, passwordGuid, url, hostKey, hostKeyType, port, directory, timeout,SFTPMODULE){

	var preConnectionObj = {};
	preConnectionObj.passwordGuid = passwordGuid;
	preConnectionObj.url = url;
	preConnectionObj.hostKey = hostKey;
	if(username){ preConnectionObj.username = username; }
	if(hostKeyType){ preConnectionObj.hostKeyType = hostKeyType; }
	if(port){ preConnectionObj.port = Number(port); }
	//if(directory){ preConnectionObj.directory = directory; }
	if(timeout){ preConnectionObj.timeout = Number(timeout); }

	var connectionObj = SFTPMODULE.createConnection(preConnectionObj);
	return connectionObj;

}
