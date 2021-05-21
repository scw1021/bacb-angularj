/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/url'], function(url) {

  var windowParams;

  function getParams(url) {
    console.log('CS: ' + url)
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  }

  function pageInit(context) {
    console.log('CS Page Init Called');
    var currRecord = context.currentRecord;

    eval("nlapiDisableLineItemField('sublist', 'custpage_old_values', true)");

    jQuery('.uir-table-block tr').find('th:last, td:last').hide();

    windowParams = getParams(window.location.href);

    console.log(windowParams);

    currRecord.setValue({
      fieldId: 'custpage_inst_select',
      value: windowParams.inst,
      ignoreFieldChange: true
    });

    currRecord.setValue({
      fieldId: 'custpage_edition_select',
      value: windowParams.edition,
      ignoreFieldChange: true
    });

    currRecord.setValue({
      fieldId: 'custpage_seq_select',
      value: windowParams.seq,
      ignoreFieldChange: true
    });

    currRecord.setValue({
      fieldId: 'custpage_page_select',
      value: windowParams.page,
      ignoreFieldChange: true
    });
  }

  function exportReport() {
    console.log('exportReport() called');
    if (windowParams != null && windowParams != '') {
      var params = {};
      params['shouldExport'] = true;
      if (windowParams.page != null && windowParams.page != '') params['page'] = windowParams.page;
      if (windowParams.inst != null && windowParams.inst != '') params['inst'] = windowParams.inst;
      if (windowParams.edition != null && windowParams.edition != '') params['edition'] = windowParams.edition;
      if (windowParams.seq != null && windowParams.seq != '') params['seq'] = windowParams.seq;

      console.log(params);

      var URL = url.resolveScript({
        scriptId: 'customscript_ns_reg_course_data_rep',
        deploymentId: 'customdeploy_ns_reg_course_data_rep_sl',
        params: params,
        returnExternalUrl: false,
      });

      window.open(URL);
    }
  }

  return {
    pageInit: pageInit,
    exportReport: exportReport
  };
});
