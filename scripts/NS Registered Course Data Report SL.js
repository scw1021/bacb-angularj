/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/query', 'N/redirect', 'N/file', 'N/encode', 'N/log'],
  function(serverWidget, record, search, query, redirect, file, encode, log) {

    // Map Allocation Type to column and index in oldValues
    var rcHourAllocationIdRef = {
      '8': ['custpage_custrecord_rc_hr_alloc_value_a1', 22],
      '6': ['custpage_custrecord_rc_hr_alloc_value_b1', 23],
      '14': ['custpage_custrecord_rc_hr_alloc_value_c1', 24],
      '9': ['custpage_custrecord_rc_hr_alloc_value_c2', 25],
      '11': ['custpage_custrecord_rc_hr_alloc_value_d1', 26],
      '10': ['custpage_custrecord_rc_hr_alloc_value_d2', 27],
      '13': ['custpage_custrecord_rc_hr_alloc_value_d3', 28],
      '3': ['custpage_custrecord_rc_hr_alloc_value_d4', 29],
      '12': ['custpage_custrecord_rc_hr_alloc_value_d5', 30],
      '7': ['custpage_custrecord_rc_hr_alloc_value_e1', 31],
      '1': ['custpage_custrecord_rc_hr_alloc_value_5a', 32],
      '17': ['custpage_custrecord_rc_hr_alloc_value_5b1', 33],
      '5': ['custpage_custrecord_rc_hr_alloc_value_5b2', 34],
      '18': ['custpage_custrecord_rc_hr_alloc_value_5b3', 35],
      '15': ['custpage_custrecord_rc_hr_alloc_value_5c1c2', 36],
      '2': ['custpage_custrecord_rc_hr_alloc_value_5d1', 37],
      '4': ['custpage_custrecord_rc_hr_alloc_value_5d2d5d2', 38],
      '16': ['custpage_custrecord_rc_hr_alloc_value_5d2d5d3', 39],
    }

    function isEmpty(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    function updateSingleRecord(newValueObj, recType, recId) {
      log.debug(recType, newValueObj);
      if (!isEmpty(newValueObj)) {
        record.submitFields({
          type: recType,
          id: recId,
          values: newValueObj,
          options: {
            enableSourcing: false,
            ignoreMandatoryFields: true
          }
        })
      }
    }

    function getRcHourAllocationId(allocType, contentHourId) {
      var rcHourAllocationSearchObj = search.create({
        type: "customrecord_rc_hour_allocation",
        filters: [
          ["custrecord_rc_hr_alloc_type", "anyof", allocType],
          "AND",
          ["custrecord_rc_hr_alloc_content_hours", "anyof", contentHourId]
        ],
        columns: [
          search.createColumn({
            name: "internalid",
            label: "Internal Id"
          }),
        ]
      });

      var index = 0;
      var rcHourAllocationId;
      rcHourAllocationSearchObj.run().each(function(result) {
        if (index > 0) return false; // Should only have one result but check anyways
        rcHourAllocationId = result.getValue({
          name: 'internalid'
        });

        index += 1;
        return true;
      });

      log.debug('rcHourAllocationId', rcHourAllocationId);
      return rcHourAllocationId;
    }

    function getAllRcInstitution() {
      var rcInstitutionSearchObj = search.create({
        type: "customrecord_rc_institution",
        filters: [],
        columns: [
          search.createColumn({
            name: "name",
            sort: search.Sort.ASC,
            label: "Name"
          }),
          search.createColumn({
            name: "internalid",
            label: "Internal ID"
          }),
        ]
      });

      var allRcInstitutions = [];
      rcInstitutionSearchObj.run().each(function(result) {
        var rcInstId = result.getValue({
          name: "internalid"
        });
        var rcInstName = result.getValue({
          name: "name"
        });
        allRcInstitutions.push([rcInstId, rcInstName]);
        return true;
      });

      log.debug('allRcInstitutions', allRcInstitutions);
      return allRcInstitutions;
    }

    function updateRecords(oldValues, newValues) {
      log.debug('-- Updating records --');
      log.debug('oldValues', oldValues);
      log.debug('newValues', newValues);

      var CONTENT_HOURS_ID_INDEX = 11;
      var COURSE_ID_INDEX = 4;
      var DEP_ID_INDEX = 2;
      var INST_ID_INDEX = 0;

      var customrecord_rc_content_hours_id = oldValues[CONTENT_HOURS_ID_INDEX];
      var customrecord_rc_course_id = oldValues[COURSE_ID_INDEX];
      var customrecord_rc_department_id = oldValues[DEP_ID_INDEX];
      var customrecord_rc_institution_id = oldValues[INST_ID_INDEX];

      var oldValuesWithoutId = [];

      for (var j = 0; j < oldValues.length; j++) {
        if (j != CONTENT_HOURS_ID_INDEX && j != COURSE_ID_INDEX && j != DEP_ID_INDEX && j != INST_ID_INDEX) {
          oldValuesWithoutId.push(oldValues[j]);
        }
      }

      log.debug('oldValuesWithoutId', oldValuesWithoutId);
      log.debug('customrecord_rc_content_hours_id', customrecord_rc_content_hours_id);
      log.debug('customrecord_rc_course_id', customrecord_rc_course_id);
      log.debug('customrecord_rc_department_id', customrecord_rc_department_id);
      log.debug('customrecord_rc_institution_id', customrecord_rc_institution_id);

      var allocationIds = ['8','6','14','9','11','10','13','3','12','7','1','17','5','18','15','2','4','16',]
      var rcfieldIds = [
        'custrecord_rc_inst_name', // RC Institution
        'custrecord_rc_depart_name', // RC Department

        'custrecord_rc_course_credit_level', // RC Course
        'custrecord_rc_course_number',
        'custrecord_rc_course_title', // 5
        'custrecord_rc_course_credit_hours',
        'custrecord_rc_course_crs_seq',
        'custrecord_rc_course_type',

        'custrecord_rc_content_hr_edition',
        'custrecord_rc_content_hr_start_date', // 10
        'custrecord_rc_content_hr_end_date',
        'custrecord_rc_content_hr_start_year',
        'custrecord_rc_content_hr_end_year',
        'custrecord_rc_content_hr_start_sem',
        'custrecord_rc_content_hr_end_sem', // 15
        'custrecord_rc_content_hr_start_qtr',
        'custrecord_rc_content_hr_end_qtr',

        '8', // RC Hour Allocation Type // 18
        '6',
        '14', // 20
        '9',
        '11',
        '10',
        '13',
        '3', // 25
        '12',
        '7',
        '1',
        '17',
        '5', // 30
        '18',
        '15',
        '2',
        '4',
        '16', // 35
        'custrecord_data_discpncy_cnt_hrs',
      ];

      var newValueObj = {};
      for (var i =8; i < 17; i++) {
        if (oldValuesWithoutId[i] != newValues[i]) {
          newValueObj[rcfieldIds[i]] = newValues[i];
        }
      }
      updateSingleRecord(newValueObj, 'customrecord_rc_content_hours', customrecord_rc_content_hours_id);

      newValueObj = {};
      for (var i = 2; i < 8; i++) {
        if (oldValuesWithoutId[i] != newValues[i]) {
          newValueObj[rcfieldIds[i]] = newValues[i];
        }
      }
      updateSingleRecord(newValueObj, 'customrecord_rc_course', customrecord_rc_course_id);

      newValueObj = {};
      if (oldValuesWithoutId[1] != newValues[1]) { // done
        newValueObj[rcfieldIds[1]] = newValues[1];
      }
      updateSingleRecord(newValueObj, 'customrecord_rc_department', customrecord_rc_department_id);

      newValueObj = {};
      if (oldValuesWithoutId[0] != newValues[0]) { // done
        newValueObj[rcfieldIds[0]] = newValues[0];
      }
      updateSingleRecord(newValueObj, 'customrecord_rc_institution', customrecord_rc_institution_id);

      // Update allocation type
      // Senario 1: if old == null, new != null, create new record
      // Senario 2: if old != null, new != null, update record
      // Senario 3: if old != null, new == null, delete record
      for (var i = 17; i < 35; i++) {
        if (oldValuesWithoutId[i+1] != newValues[i]) {
          log.debug('Check Record', oldValuesWithoutId[i+1] + ' - ' + rcfieldIds[i]+ '(' + newValues[i] + ') for ' + customrecord_rc_content_hours_id);
          if (oldValuesWithoutId[i+1] == '' && newValues[i] != '') {
            log.debug('New Record', rcfieldIds[i]);

            var newRcHourAllocationRec = record.create({
              type: 'customrecord_rc_hour_allocation',
              isDynamic: true
            });

            newRcHourAllocationRec.setValue({
              fieldId: 'custrecord_rc_hr_alloc_content_hours',
              value: customrecord_rc_content_hours_id,
              ignoreFieldChange: true
            });
            newRcHourAllocationRec.setValue({
              fieldId: 'custrecord_rc_hr_alloc_type',
              value: rcfieldIds[i],
              ignoreFieldChange: true
            });
            newRcHourAllocationRec.setValue({
              fieldId: 'custrecord_rc_hr_alloc_value',
              value: newValues[i],
              ignoreFieldChange: true
            });

            newRcHourAllocationRec.save();

          } else if (oldValuesWithoutId[i+1] != '' && newValues[i] != '') {
            log.debug('Update Record', rcfieldIds[i]);

            var rcHourAllocationId = getRcHourAllocationId(rcfieldIds[i], customrecord_rc_content_hours_id);
            if (rcHourAllocationId != null && rcHourAllocationId != '') {
              record.submitFields({
                type: 'customrecord_rc_hour_allocation',
                id: rcHourAllocationId,
                values: {
                  custrecord_rc_hr_alloc_value: newValues[i]
                },
                options: {
                  enableSourcing: false,
                  ignoreMandatoryFields: true
                }
              })
            }
          } else if (oldValuesWithoutId[i+1] != '' && newValues[i] == '') {
            log.debug('Delete Record', rcfieldIds[i]);
            var rcHourAllocationId = getRcHourAllocationId(rcfieldIds[i], customrecord_rc_content_hours_id);
            if (rcHourAllocationId != null && rcHourAllocationId != '') {
              record.delete({
                type: 'customrecord_rc_hour_allocation',
                id: rcHourAllocationId,
              });
            }
          }
        }
      }
    }

    function getReorderedResults(original) {
      return [
        original[1], // Institution
        original[3], // Department
        original[5], // Approval Level
        original[6], // Number
        original[7], // Title
        original[22], // Alt Course
        original[8], // Credit Hours
        original[9], // Sequence
        original[10], // Type
        original[12], // Edition
        original[13], // Start Date
        original[14], // End Date
        original[15], // Start Year
        original[16], // End Year
        original[17], // Start Sem
        original[18], // End Sem
        original[19], // Start Qtr
        original[20], // End Qtr
        original[22], // A1
        original[23], // B1
        original[24], // C1
        original[25], // C2
        original[26], // D1
        original[27], // D2
        original[28], // D3
        original[29], // D4
        original[20], // D5
        original[31], // E1
        original[32], // 5A
        original[33], // 5B(B1)
        original[34], // 5B(B2)
        original[35], // 5B(B3)
        original[36], // 5C1-C2
        original[37], // 5D1
        original[38], // 5D2-D5(D2)
        original[39], // 5D2-D5(D3)
        original[40] // Data Discrepancy
      ];
    }

    function exportReportToExcel(results) {

      log.debug('exportReportToExcel', results);

      var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
      xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
      xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
      xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
      xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
      xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

      xmlStr += '<Worksheet ss:Name="Sheet1">';

      xmlStr += '<Table>' +
        '<Row>' +
        '<Cell><Data ss:Type="String">Institution</Data></Cell>' +
        '<Cell><Data ss:Type="String">Department</Data></Cell>' +
        '<Cell><Data ss:Type="String">Approval Level</Data></Cell>' +
        '<Cell><Data ss:Type="String">Number</Data></Cell>' +
        '<Cell><Data ss:Type="String">Title</Data></Cell>' +
        '<Cell><Data ss:Type="String">Alt Course</Data></Cell>' +
        '<Cell><Data ss:Type="String">Credit Hours</Data></Cell>' +
        '<Cell><Data ss:Type="String">Sequence</Data></Cell>' +
        '<Cell><Data ss:Type="String">Type</Data></Cell>' +
        '<Cell><Data ss:Type="String">Edition</Data></Cell>' +
        '<Cell><Data ss:Type="String">Start Date</Data></Cell>' +
        '<Cell><Data ss:Type="String">End Date</Data></Cell>' +
        '<Cell><Data ss:Type="String">Start Year</Data></Cell>' +
        '<Cell><Data ss:Type="String">End Year</Data></Cell>' +
        '<Cell><Data ss:Type="String">Start Sem</Data></Cell>' +
        '<Cell><Data ss:Type="String">End Sem</Data></Cell>' +
        '<Cell><Data ss:Type="String">Start Qtr</Data></Cell>' +
        '<Cell><Data ss:Type="String">End Qtr</Data></Cell>' +
        '<Cell><Data ss:Type="String">A1</Data></Cell>' +
        '<Cell><Data ss:Type="String">B1</Data></Cell>' +
        '<Cell><Data ss:Type="String">C1</Data></Cell>' +
        '<Cell><Data ss:Type="String">C2</Data></Cell>' +
        '<Cell><Data ss:Type="String">D1</Data></Cell>' +
        '<Cell><Data ss:Type="String">D2</Data></Cell>' +
        '<Cell><Data ss:Type="String">D3</Data></Cell>' +
        '<Cell><Data ss:Type="String">D4</Data></Cell>' +
        '<Cell><Data ss:Type="String">D5</Data></Cell>' +
        '<Cell><Data ss:Type="String">E1</Data></Cell>' +
        '<Cell><Data ss:Type="String">5A</Data></Cell>' +
        '<Cell><Data ss:Type="String">5B(B1)</Data></Cell>' +
        '<Cell><Data ss:Type="String">5B(B2)</Data></Cell>' +
        '<Cell><Data ss:Type="String">5B(B3)</Data></Cell>' +
        '<Cell><Data ss:Type="String">5C1-C2</Data></Cell>' +
        '<Cell><Data ss:Type="String">5D1</Data></Cell>' +
        '<Cell><Data ss:Type="String">5D2-D5(D2)</Data></Cell>' +
        '<Cell><Data ss:Type="String">5D2-D5(D3)</Data></Cell>' +
        '<Cell><Data ss:Type="String">Data Discrepancy</Data></Cell>' +
        '</Row>';

      var columnOrder = []
      if (results != null && results.length > 0) {
        for (var i = 0; i < results.length; i++) {
          xmlStr += '<Row>';

          var reorderedResult = getReorderedResults(results[i].values);
          for (var j = 0; j < reorderedResult.length; j++) {
            xmlStr += '<Cell><Data ss:Type="String">' + reorderedResult[j] + '</Data></Cell>'
          }

          xmlStr += '</Row>';
        }
      }

      xmlStr += '</Table></Worksheet></Workbook>';

      var strXmlEncoded = encode.convert({
        string: xmlStr,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64
      });

      var objXlsFile = file.create({
        name: 'RC Course Report.xls',
        fileType: file.Type.EXCEL,
        contents: strXmlEncoded
      });
      // Optional: you can choose to save it to file cabinet
      // objXlsFile.folder = -14;
      // var intFileId = objXlsFile.save();

      return objXlsFile;
    }

    function onRequest(context) {
      if (context.request.method === 'GET') {

        var form = serverWidget.createForm({
          title: 'RC Course Report'
        });

        form.clientScriptModulePath = 'SuiteScripts/NS Export Report CS.js';

        var rcInstitutions = getAllRcInstitution();
        var instSelectField = form.addField({
          id: 'custpage_inst_select',
          type: serverWidget.FieldType.SELECT,
          label: 'Institution'
        });

        instSelectField.addSelectOption({
          value: '',
          text: ''
        });

        for (var i = 0; i < rcInstitutions.length; i++) {
          instSelectField.addSelectOption({
            value: rcInstitutions[i][0],
            text: rcInstitutions[i][1] + ' (' + rcInstitutions[i][0] + ')'
          });
        }

        var editionSelectField = form.addField({
          id: 'custpage_edition_select',
          type: serverWidget.FieldType.SELECT,
          label: 'Edition'
        });

        editionSelectField.addSelectOption({
          value: '',
          text: ''
        });

        editionSelectField.addSelectOption({
          value: 3,
          text: '3'
        });

        editionSelectField.addSelectOption({
          value: 4,
          text: '4'
        });

        editionSelectField.addSelectOption({
          value: 5,
          text: '5'
        });

        var seqSelectField = form.addField({
          id: 'custpage_seq_select',
          type: serverWidget.FieldType.TEXT,
          label: 'Course Sequence'
        });

        // -- Start -- Sublist

        var sublist = form.addSublist({
          id: 'sublist',
          type: serverWidget.SublistType.INLINEEDITOR,
          label: 'Inline Editor Sublist'
        });
        sublist.addField({
          id: 'custpage_is_updated',
          type: serverWidget.FieldType.CHECKBOX,
          label: 'Is Updated'
        });
        // -- Start -- RC Institution
        // sublist.addField({
        //   id: 'custpage_custrecord_rc_inst_id', // ID, HIDDEN
        //   type: serverWidget.FieldType.TEXT,
        //   label: 'custrecord_rc_inst_id'
        // });
        sublist.addField({
          id: 'custpage_custrecord_rc_inst_name',
          type: serverWidget.FieldType.TEXT,
          label: 'Institution'
        });
        // -- End -- RC Institution
        // -- Start -- RC Department
        // sublist.addField({
        //   id: 'custpage_custrecord_rc_depart_id', // ID, HIDDEN
        //   type: serverWidget.FieldType.TEXT,
        //   label: 'custrecord_rc_depart_id'
        // });
        sublist.addField({
          id: 'custpage_custrecord_rc_depart_name',
          type: serverWidget.FieldType.TEXT,
          label: 'Department'
        });
        // -- End -- RC Department

        // -- Start -- RC Course
        // sublist.addField({
        //   id: 'custpage_custrecord_rc_course_id', // ID, HIDDEN
        //   type: serverWidget.FieldType.TEXT,
        //   label: 'custrecord_rc_course_id'
        // });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_credit_level',
          type: serverWidget.FieldType.SELECT,
          label: 'Approval Level',
          source: 'customlist_crse_credit_level'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_number',
          type: serverWidget.FieldType.TEXT,
          label: 'Number'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_title',
          type: serverWidget.FieldType.TEXT,
          label: 'Title'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_alt_course',
          type: serverWidget.FieldType.TEXT,
          label: 'Alt Course'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_credit_hours',
          type: serverWidget.FieldType.TEXT,
          label: 'Credit Hours'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_crs_seq',
          type: serverWidget.FieldType.TEXT,
          label: 'Sequence'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_course_type',
          type: serverWidget.FieldType.TEXT,
          label: 'Type'
        });
        // -- End -- RC Course

        // -- Start -- RC Content Hours
        // sublist.addField({
        //   id: 'custpage_customrecord_rc_content_hours_id', // ID, HIDDEN
        //   type: serverWidget.FieldType.TEXT,
        //   label: 'customrecord_rc_content_hours_id'
        // });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_edition',
          type: serverWidget.FieldType.SELECT,
          label: 'Edition',
          source: 'customlist_contnt_hrs_type_lst'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_start_date',
          type: serverWidget.FieldType.DATE,
          label: 'Start Date'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_end_date',
          type: serverWidget.FieldType.DATE,
          label: 'End Date'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_start_year',
          type: serverWidget.FieldType.TEXT,
          label: 'Start Year'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_end_year',
          type: serverWidget.FieldType.TEXT,
          label: 'End Year'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_start_sem',
          type: serverWidget.FieldType.SELECT,
          label: 'Start Sem',
          source: 'customlist_global_semesters'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_end_sem',
          type: serverWidget.FieldType.SELECT,
          label: 'End Sem',
          source: 'customlist_global_semesters'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_start_qtr',
          type: serverWidget.FieldType.SELECT,
          label: 'Start Qtr',
          source: 'customlist_global_quarters'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_content_hr_end_qtr',
          type: serverWidget.FieldType.SELECT,
          label: 'End Qtr',
          source: 'customlist_global_quarters'
        });
        // -- End -- RC Content Hours



        // -- Start -- RC Content Area Hours Allocation
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_a1',
          type: serverWidget.FieldType.TEXT,
          label: 'A1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_b1',
          type: serverWidget.FieldType.TEXT,
          label: 'B1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_c1',
          type: serverWidget.FieldType.TEXT,
          label: 'C1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_c2',
          type: serverWidget.FieldType.TEXT,
          label: 'C2'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_d1',
          type: serverWidget.FieldType.TEXT,
          label: 'D1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_d2',
          type: serverWidget.FieldType.TEXT,
          label: 'D2'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_d3',
          type: serverWidget.FieldType.TEXT,
          label: 'D3'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_d4',
          type: serverWidget.FieldType.TEXT,
          label: 'D4'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_d5',
          type: serverWidget.FieldType.TEXT,
          label: 'D5'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_e1',
          type: serverWidget.FieldType.TEXT,
          label: 'E1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5a',
          type: serverWidget.FieldType.TEXT,
          label: '5A'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5b1',
          type: serverWidget.FieldType.TEXT,
          label: '5B(B1)'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5b2',
          type: serverWidget.FieldType.TEXT,
          label: '5B(B2)'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5b3',
          type: serverWidget.FieldType.TEXT,
          label: '5B(B3)'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5c1c2',
          type: serverWidget.FieldType.TEXT,
          label: '5C1-C2'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5d1',
          type: serverWidget.FieldType.TEXT,
          label: '5D1'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5d2d5d2',
          type: serverWidget.FieldType.TEXT,
          label: '5D2-D5(D2)'
        });
        sublist.addField({
          id: 'custpage_custrecord_rc_hr_alloc_value_5d2d5d3',
          type: serverWidget.FieldType.TEXT,
          label: '5D2-D5(D3)'
        });
        // -- End -- RC Content Area Hours Allocation
        sublist.addField({
          id: 'custpage_custrecord_data_discpncy_cnt_hrs',
          type: serverWidget.FieldType.TEXT,
          label: 'Data Discrepancy'
        });
        sublist.addField({
          id: 'custpage_old_values', // Internal Use, HIDDEN
          type: serverWidget.FieldType.TEXTAREA,
          label: '*(INTERNAL USE)'
        });

        form.addSubmitButton({
          label: 'Submit'
        });

        // ' + {
        //   paramInst: paramInst,
        //   paramEdition: paramEdition,
        //   paramSeq: paramSeq,
        //   paramPageIndex: paramPageIndex
        // } + '

        form.addButton({
          id: 'buttonExport',
          label: 'Export',
          functionName: 'exportReport();'
        });

        // RC Content Hours
        var rcQuery = query.create({
          type: "customrecord_rc_content_hours"
        });

        // RC Course
        var rcCourseJoin = rcQuery.autoJoin({
          fieldId: 'custrecord_rc_content_hr_course'
        });

        // RC Department
        var rcDepartmentJoin = rcCourseJoin.autoJoin({
          fieldId: 'custrecord_rc_course_dept'
        });

        // RC Institution
        var rcInstitutionJoin = rcDepartmentJoin.autoJoin({
          fieldId: 'custrecord_rc_depart_institution'
        });

        rcQuery.columns = [
          // -- Start -- RC Institution
          rcInstitutionJoin.createColumn({ // 0
            fieldId: 'id'
          }),
          rcInstitutionJoin.createColumn({
            fieldId: 'custrecord_rc_inst_name'
          }),
          // -- End -- RC Institution

          // -- Start -- RC Department
          rcDepartmentJoin.createColumn({ // 2
            fieldId: 'id'
          }),
          rcDepartmentJoin.createColumn({
            fieldId: 'custrecord_rc_depart_name'
          }),
          // -- End -- RC Department

          // -- Start -- RC Course
          rcCourseJoin.createColumn({ // 4
            fieldId: 'id'
          }),
          rcCourseJoin.createColumn({
            fieldId: 'custrecord_rc_course_credit_level'
          }),
          rcCourseJoin.createColumn({ // 6
            fieldId: 'custrecord_rc_course_number'
          }),
          rcCourseJoin.createColumn({
            fieldId: 'custrecord_rc_course_title'
          }),
          rcCourseJoin.createColumn({ // 8
            fieldId: 'custrecord_rc_course_credit_hours'
          }),
          rcCourseJoin.createColumn({
            fieldId: 'custrecord_rc_course_crs_seq'
          }),
          rcCourseJoin.createColumn({ // 10
            fieldId: 'custrecord_rc_course_type'
          }),
          // -- End -- RC Course

          // -- Start -- RC Content Hours
          rcQuery.createColumn({
            fieldId: 'id'
          }),
          rcQuery.createColumn({ // 12
            fieldId: 'custrecord_rc_content_hr_edition'
          }),
          rcQuery.createColumn({
            fieldId: 'custrecord_rc_content_hr_start_date'
          }),
          rcQuery.createColumn({ // 14
            fieldId: 'custrecord_rc_content_hr_end_date'
          }),
          rcQuery.createColumn({
            fieldId: 'custrecord_rc_content_hr_start_year'
          }),
          rcQuery.createColumn({ // 16
            fieldId: 'custrecord_rc_content_hr_end_year'
          }),
          rcQuery.createColumn({
            fieldId: 'custrecord_rc_content_hr_start_sem'
          }),
          rcQuery.createColumn({ // 18
            fieldId: 'custrecord_rc_content_hr_end_sem'
          }),
          rcQuery.createColumn({
            fieldId: 'custrecord_rc_content_hr_start_qtr'
          }),
          rcQuery.createColumn({ // 20
            fieldId: 'custrecord_rc_content_hr_end_qtr'
          }),
          rcQuery.createColumn({
            fieldId: 'custrecord_data_discpncy_cnt_hrs'
          }),
          rcCourseJoin.createColumn({
            fieldId: 'custrecord_rc_course_alternate'
          })
          // -- End -- RC Content Hours



        ];

        var paramInst = context.request.parameters.inst;
        log.debug('paramInst', paramInst);
        var instCondition;
        if (paramInst != null && paramInst != '') {
          instCondition = rcInstitutionJoin.createCondition({
            fieldId: 'id',
            operator: query.Operator.EQUAL,
            values: paramInst
          });
        } else { // Place holder condition, query modules doesn't allow adding condition on the fly
          instCondition = rcInstitutionJoin.createCondition({
            fieldId: 'id',
            operator: query.Operator.EMPTY_NOT,
          });
        }

        var paramEdition = context.request.parameters.edition;
        log.debug('paramEdition', paramEdition);
        var editionCondition;
        if (paramEdition != null && paramEdition != '') {
          editionCondition = rcQuery.createCondition({
            fieldId: 'custrecord_rc_content_hr_edition',
            operator: query.Operator.EQUAL,
            values: paramEdition
          });
        } else { // Place holder condition, query modules doesn't allow adding condition on the fly
          editionCondition = rcQuery.createCondition({
            fieldId: 'id',
            operator: query.Operator.EMPTY_NOT,
          });
        }


        var paramSeq = context.request.parameters.seq;
        log.debug('paramSeq', paramSeq);
        var seqCondition;
        if (paramSeq != null && paramSeq != '') {
          seqCondition = rcCourseJoin.createCondition({
            fieldId: 'custrecord_rc_course_crs_seq',
            operator: query.Operator.CONTAIN,
            values: paramSeq
          });
        } else { // Place holder condition, query modules doesn't allow adding condition on the fly
          seqCondition = rcCourseJoin.createCondition({
            fieldId: 'id',
            operator: query.Operator.EMPTY_NOT,
          });
        }

        rcQuery.condition = rcQuery.and(instCondition, editionCondition, seqCondition);

        rcQuery.sort = [
          rcQuery.createSort({
            column: rcQuery.columns[0]
          })
        ];

        log.debug('rcQuery.condition', rcQuery.condition);

        var rcPagedResults = rcQuery.runPaged({
          pageSize: 50
        });

        var maxPageIndex = rcPagedResults.pageRanges.length;
        var paramPageIndex = context.request.parameters.page;

        log.debug('maxPageIndex', maxPageIndex);
        log.debug('paramPageIndex', paramPageIndex);

        if (paramPageIndex == null || paramPageIndex < 0 || paramPageIndex > maxPageIndex) {
          paramPageIndex = 0;
        }

        var pageSelectField = form.addField({
          id: 'custpage_page_select',
          type: serverWidget.FieldType.SELECT,
          label: 'Page'
        });

        for (var i = 0; i < maxPageIndex; i++) {
          pageSelectField.addSelectOption({
            value: i,
            text: i
          });
        }

        if (maxPageIndex > 0) {

          // log.debug('907 maxPageIndex', maxPageIndex);

          // Run the query
          var resultSet = rcPagedResults.fetch(paramPageIndex).data;
          log.debug('pagedData', resultSet);

          // Retrieve and log the results
          var results = resultSet.results;

          // Retrive the RC Content Ids for the RC Hours Allocation Search
          var rcContentHourFilter = ["custrecord_rc_hr_alloc_content_hours", "anyof"];
          for (var i = 0; i < results.length; i++) {
            var result = results[i].values;
            log.debug('contenthourfilter', JSON.stringify(result));
            rcContentHourFilter.push(parseInt(result[11]).toString());
          }

          log.debug('rcContentHourFilter', rcContentHourFilter);

          var rcHourAllocation = {};
          var rcHourAllocationSearchObj = search.create({
            type: "customrecord_rc_hour_allocation",
            filters: [
              ["custrecord_rc_hr_alloc_type", "anyof", "1", "17", "5", "18", "15", "2", "4", "16", "8", "6", "14", "9", "11", "10", "13", "3", "12", "7"],
              "AND",
              rcContentHourFilter
            ],
            columns: [
              search.createColumn({
                name: "custrecord_rc_hr_alloc_content_hours",
                label: "Content Hours"
              }),
              search.createColumn({
                name: "custrecord_rc_hr_alloc_type",
                label: "Type"
              }),
              search.createColumn({
                name: "custrecord_rc_hr_alloc_value",
                label: "Value"
              }),
            ]
          });

          rcHourAllocationSearchObj.run().each(function(result) {
            var contentHourId = result.getValue({
              name: 'custrecord_rc_hr_alloc_content_hours'
            });
            var contentHourType = result.getValue({
              name: 'custrecord_rc_hr_alloc_type'
            });
            var contentHourValue = result.getValue({
              name: 'custrecord_rc_hr_alloc_value'
            });
            // log.debug('contentHour', [contentHourId, contentHourType, contentHourValue]);

            if (!rcHourAllocation[contentHourId]) {
              rcHourAllocation[contentHourId] = [
                [contentHourType, contentHourValue]
              ];
            } else {
              rcHourAllocation[contentHourId].push([contentHourType, contentHourValue]);
            }
            return true;
          });

          log.debug('rcHourAllocation', rcHourAllocation);


          log.debug('results.length', results.length);
          for (var i = 0; i < results.length; i++) {
            var result = results[i].values;
            log.debug(i, result);

            for (var j = 0; j < result.length; j++) {
              if (result[j] == null) {
                result[j] = '';
              }
            }

            // log.debug(i, result);

            // -- Start -- RC Institution
            // if (result[20] != null && result[20] != '') {
            //   sublist.setSublistValue({
            //     id: 'custpage_custrecord_rc_inst_id',
            //     line: i,
            //     value: parseInt(result[20]).toString()
            //   });
            // }
            if (result[1] != null && result[1] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_inst_name',
                line: i,
                value: result[1].toString()
              });
            }
            // -- End -- RC Institution
            // -- Start -- RC Department
            // if (result[18] != null && result[18] != '') {
            //   sublist.setSublistValue({
            //     id: 'custpage_custrecord_rc_depart_id',
            //     line: i,
            //     value: parseInt(result[18]).toString()
            //   });
            // }
            if (result[3] != null && result[3] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_depart_name',
                line: i,
                value: result[3].toString()
              });
            }
            // -- End -- RC Department

            // -- Start -- RC Content Hours
            // sublist.setSublistValue({
            //   id: 'custpage_customrecord_rc_content_hours_id',
            //   line: i,
            //   value: parseInt(result[0]).toString()
            // });
            if (result[12] != null && result[12] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_edition',
                line: i,
                value: result[12].toString()
              });
            }
            if (result[13] != null && result[13] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_start_date',
                line: i,
                value: result[13].toString()
              });
            }
            if (result[14] != null && result[14] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_end_date',
                line: i,
                value: result[14].toString()
              });
            }
            if (result[15] != null && result[15] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_start_year',
                line: i,
                value: result[15].toString()
              });
            }
            if (result[16] != null && result[16] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_end_year',
                line: i,
                value: result[16].toString()
              });
            }
            if (result[17] != null && result[17] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_start_sem',
                line: i,
                value: result[17].toString()
              });
            }
            if (result[18] != null && result[18] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_end_sem',
                line: i,
                value: result[18].toString()
              });
            }
            if (result[19] != null && result[19] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_start_qtr',
                line: i,
                value: result[19].toString()
              });
            }
            if (result[20] != null && result[20] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_content_hr_end_qtr',
                line: i,
                value: result[20].toString()
              });
            }

            if (result[21] != null && result[21] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_data_discpncy_cnt_hrs',
                line: i,
                value: result[21].toString()
              });
            }
            // -- End -- RC Content Hours
            // -- Start -- RC Course
            // if (result[11] != null && result[11] != '') {
            //   sublist.setSublistValue({
            //     id: 'custpage_custrecord_rc_course_id',
            //     line: i,
            //     value: parseInt(result[11]).toString()
            //   });
            // }
            if (result[5] != null && result[5] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_credit_level',
                line: i,
                value: result[5].toString()
              });
            }
            if (result[6] != null && result[6] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_number',
                line: i,
                value: result[6].toString()
              });
            }
            if (result[7] != null && result[7] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_title',
                line: i,
                value: result[7].toString()
              });
            }
            if (result[22] != null && result[22] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_alt_course',
                line: i,
                value: result[22].toString()
              });
            }
            if (result[8] != null && result[8] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_credit_hours',
                line: i,
                value: result[8].toString()
              });
            }
            if (result[9] != null && result[9] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_crs_seq',
                line: i,
                value: result[9].toString()
              });
            }
            if (result[10] != null && result[10] != '') {
              sublist.setSublistValue({
                id: 'custpage_custrecord_rc_course_type',
                line: i,
                value: result[10].toString()
              });
            }
            // -- End -- RC Course

            // -- Start -- RC Content Area Hours Allocation
            var customrecord_rc_content_hours_id = parseInt(result[11]).toString();

            // Push placeholders of type to result
            for (var x = 0; x < 18; x++) {
              result.push('');
            }

            var rcHourAllocationVal = rcHourAllocation[customrecord_rc_content_hours_id] == null ? [] : rcHourAllocation[customrecord_rc_content_hours_id];
            log.debug('ALLOCATION HOURS VALUE', rcHourAllocationVal);
            if (rcHourAllocationVal != []) {
              for (var k = 0; k < rcHourAllocationVal.length; k++) {
                sublist.setSublistValue({
                  id: rcHourAllocationIdRef[rcHourAllocationVal[k][0]][0],
                  line: i,
                  value: rcHourAllocationVal[k][1]
                });
                result[rcHourAllocationIdRef[rcHourAllocationVal[k][0]][1]] = rcHourAllocationVal[k][1]
              }
            }
            // if ( result[])

            // -- End -- RC Content Area Hours Allocation
            sublist.setSublistValue({
              id: 'custpage_old_values',
              line: i,
              value: result
            });
          }
        }

        if (context.request.parameters.shouldExport) {
          context.response.writeFile({
            file: exportReportToExcel(results)
          });
        } else {
          context.response.writePage(form);
        }

      } else {

        log.debug('context.request.parameters', context.request.parameters);

        var page_selected = context.request.parameters.inpt_custpage_page_select;
        var inst_selected = context.request.parameters.inpt_custpage_inst_select;
        var edition_selected = context.request.parameters.inpt_custpage_edition_select;
        var seq_selected = context.request.parameters.custpage_seq_select;

        var delimiter = /\u0002/;
        var sublistData = context.request.parameters.sublistdata.split(delimiter);
        var filteredData = [];

        for (var i = 0; i < sublistData.length; i++) {
          if (sublistData[i][0] == "T") {
            filteredData.push(sublistData[i].split(/\u0001/));
          }
        }

        log.debug('filteredData', filteredData);

        for (var j = 0; j < filteredData.length; j++) {
          var oldValues = filteredData[j].pop().split(/\u0005/);
          var dataDescrepVal = filteredData[j].pop();
          var newValues = filteredData[j];
          newValues.shift();
          // newValues.splice(9, 0, dataDescrepVal);

          updateRecords(oldValues, newValues);
        }

        var redirectParams = {};

        if (page_selected != null && page_selected.trim() != '') {
          redirectParams['page'] = page_selected;
        }
        if (inst_selected != null && inst_selected.trim() != '') {
          redirectParams['inst'] = inst_selected.substring(
            inst_selected.lastIndexOf("(") + 1,
            inst_selected.lastIndexOf(")")
          );
        }
        if (edition_selected != null && edition_selected.trim() != '') {
          redirectParams['edition'] = edition_selected;
        }
        if (seq_selected != null && seq_selected.trim() != '') {
          redirectParams['seq'] = seq_selected;
        }

        log.debug('redirectParams', redirectParams);

        redirect.redirect({
          url: '/app/site/hosting/scriptlet.nl?script=208&deploy=2',
          parameters: redirectParams
        });

        // context.response.write('You have entered: ' + sublistField1);
      }
    }

    return {
      onRequest: onRequest
    };
  });
