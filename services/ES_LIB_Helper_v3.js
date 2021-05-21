/*var thisifilename="ES_LIB_Helper_v2_SOG.js";*/
/**
* Copyright (c) 2008-2016 Elim Solutions Inc.
* 50 McIntosh Drive, Suite 110, Markham, ON, Canada
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* Elim Solutions ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with Elim Solutions.
*
*
* Module Description:
* 
*
* Version	Date		Author				Remarks
* 2.00					Michael S					
*
*/
var UI_FIELDS = UI_FIELDS || new Object();
UI_FIELDS.stage = 'custpage_stage';

var E$ = E$ || new (function(){})();

(function(E$)
{

    E$.init = function()
    {

        E$.context = nlapiGetContext();
        E$.MULTISELECT_DELIM = String.fromCharCode(5);
    };

    E$.initSuitelet = function(request, response)
    {

        if (E$.isEmpty(request))
        {
            throw nlapiCreateError('REQUIRED_PARM_MISSING', 'Request parameter is mandatory.', true);
        }

        if (E$.isEmpty(response))
        {
            throw nlapiCreateError('REQUIRED_PARM_MISSING', 'Response parameter is mandatory.', true);
        }

        E$.request = request;
        E$.response = response;

        E$.stage = E$.getRequestParam(UI_FIELDS.stage);

        if (E$.isEmpty(E$.stageFunctions))
        {
            E$.stageFunctions = new Object();
        }

    };

    /**
     * 
     * @param stageValue
     * @param funcAction
     */
    E$.addStageAction = function(stageValue, funcAction)
    {

        stageValue = parseInt(stageValue);

        E$.logDebug('addStageAction', 'stageValue=' + stageValue);

        if (E$.isEmpty(E$.stageFunctions))
        {
            E$.logDebug('addStageAction', 'init stageFunctions');
            E$.stageFunctions = new Object();
        }

        if (E$.isEmpty(E$.stageFunctions[stageValue]))
        {
            E$.logDebug('addStageAction', 'init stageFunctions[stageValue]');
            E$.stageFunctions[stageValue] = new Array();
        }

        E$.stageFunctions[stageValue].push(funcAction);
    };

    /**
     *
     * @param objForm
     * @param objFieldParm
     * @returns {nlobjField}
     */
    E$.addFormField = function (objForm, objFieldParm) {

        var fldCur = objForm.addField(objFieldParm.id, objFieldParm.type, objFieldParm.label, objFieldParm.reference, objFieldParm.tab);
        if (objFieldParm.default) {
            fldCur.setDefaultValue(objFieldParm.default);
        }
        if (objFieldParm.displayType) {
            fldCur.setDisplayType(objFieldParm.displayType);
        }
        if (objFieldParm.alias) {
            fldCur.setAlias(objFieldParm.alias);
        }
        if (objFieldParm.breakType) {
            fldCur.setBreakType(objFieldParm.breakType);
        }
        if (objFieldParm.displaySize) {
            fldCur.setDisplaySize(objFieldParm.displaySize.width, objFieldParm.displaySize.height);
        }
        if (objFieldParm.helpText) {
            fldCur.setHelpText(objFieldParm.helpText);
        }
        if (objFieldParm.layoutType) {
            fldCur.setLayoutType(objFieldParm.layoutType);
        }
        if (objFieldParm.linkText) {
            fldCur.setLinkText(objFieldParm.linkText);
        }
        if (objFieldParm.mandatory) {
            fldCur.setMandatory(objFieldParm.mandatory);
        }
        if (objFieldParm.maxLength) {
            fldCur.setMaxLength(objFieldParm.maxLength);
        }
        if (objFieldParm.padding) {
            fldCur.setPadding(objFieldParm.padding);
        }
        if (objFieldParm.richTextHeight) {
            fldCur.setRichTextHeight(objFieldParm.richTextHeight);
        }
        if (objFieldParm.richTextWidth) {
            fldCur.setRichTextWidth(objFieldParm.richTextWidth);
        }

        return fldCur;
    };

    /**
     *
     * @param objForm
     * @param objFieldParm
     * @returns {nlobjField}
     */
    E$.addListField = function (objList, objFieldParm) {

        var fldCur = objList.addField(objFieldParm.id, objFieldParm.type, objFieldParm.label, objFieldParm.reference);
        if (objFieldParm.default) {
            fldCur.setDefaultValue(objFieldParm.default);
        }
        if (objFieldParm.displayType) {
            fldCur.setDisplayType(objFieldParm.displayType);
        }
        if (objFieldParm.alias) {
            fldCur.setAlias(objFieldParm.alias);
        }
        if (objFieldParm.breakType) {
            fldCur.setBreakType(objFieldParm.breakType);
        }
        if (objFieldParm.displaySize) {
            fldCur.setDisplaySize(objFieldParm.displaySize.width, objFieldParm.displaySize.height);
        }
        if (objFieldParm.helpText) {
            fldCur.setHelpText(objFieldParm.helpText);
        }
        if (objFieldParm.layoutType) {
            fldCur.setLayoutType(objFieldParm.layoutType);
        }
        if (objFieldParm.linkText) {
            fldCur.setLinkText(objFieldParm.linkText);
        }
        if (objFieldParm.mandatory) {
            fldCur.setMandatory(objFieldParm.mandatory);
        }
        if (objFieldParm.maxLength) {
            fldCur.setMaxLength(objFieldParm.maxLength);
        }
        if (objFieldParm.padding) {
            fldCur.setPadding(objFieldParm.padding);
        }
        if (objFieldParm.richTextHeight) {
            fldCur.setRichTextHeight(objFieldParm.richTextHeight);
        }
        if (objFieldParm.richTextWidth) {
            fldCur.setRichTextWidth(objFieldParm.richTextWidth);
        }

        return fldCur;
    };

    E$.isNotEmpty = function(value)
    {

        if (value == null)
            return false;
        if (value == '')
            return false;
        if (typeof value == 'undefined')
            return false;

        if (value instanceof Array)
        {
            if (value.length == 0)
                return false;
        }

        if (value instanceof Object)
        {
            for ( var i in value)
            {
                return true;
                break;
            }

            return false;
        }

        return true;
    };

    E$.isEmpty = function(value)
    {

        return !E$.isNotEmpty(value);

    };

    E$.parseFloat = function(str, bReturnFalse)
    {

        if (E$.isEmpty(bReturnFalse))
        {
            bReturnFalse = false;
        }

        var flTemp = parseFloat(str);

        if (isNaN(flTemp) || !isFinite(flTemp))
        {
            return (bReturnFalse) ? false : 0;
        }

        return flTemp;

    };

    E$.parseError = function(ex)
    {

        var errorText = '';

        if (ex instanceof nlobjError)
        {
            errorText = 'UNEXPECTED ERROR: ' + '\n\n';
            errorText += 'Script Name: ' + ex.getUserEvent() + '\n';
            errorText += 'Error Code: ' + ex.getCode() + '\n';
            errorText += 'Error Details: ' + ex.getDetails() + '\n\n';
            errorText += 'Stack Trace: ' + ex.getStackTrace();
        }
        else
        {
            errorText = 'UNEXPECTED ERROR: ' + '\n\n';
            errorText += 'Error Details: ' + ex.toString();
        }

        return errorText;
    };

    E$.logDebug = function(title, message)
    {

        nlapiLogExecution('DEBUG', title, message);

    };

    E$.logAudit = function(title, message)
    {

        nlapiLogExecution('AUDIT', title, message);

    };

    E$.logError = function(title, message)
    {

        nlapiLogExecution('ERROR', title, message);

    };

    /**
     * 
     * @param scriptId (optional)
     * @param deploymentId (optional)
     * @param params - associative array of parameters
     */
    E$.runScript = function(scriptId, deploymentId, params)
    {

        if (E$.isEmpty(scriptId))
        {
            if (E$.context.getExecutionContext() == 'scheduled')
            {
                scriptId = E$.context.getScriptId();
            }
        }

        if (E$.isEmpty(params))
        {
            var stQueue = nlapiScheduleScript(scriptId, deploymentId);
        }
        else
        {
            var stQueue = nlapiScheduleScript(scriptId, deploymentId, params);
        }

        E$.logAudit('E$.runScript', 'Tried to run script (' + scriptId + ', ' + deploymentId + ', ' + params + '): '
                + stQueue);
    };

    /**
     * 
     * @param minimumUsage
     * @param bRerun
     * @param funcCreateParam - this function should return an associative array of parameter values
     * @returns {Boolean}
     * 
     * for(var y in test)
     * {
     *     if(E$.checkUsage(500,true,function(){ var arrParm = new Object(); arrParm['parm1'] = '1'; return arrParm;}))
     *     {
     *          break;
     *     }
     * }
     * 
     */
    E$.checkUsage = function(minimumUsage, bRerun, funcCreateParam)
    {

        if (E$.isEmpty(minimumUsage))
        {
            minimumUsage = 50;
        }

        if (E$.isEmpty(bRerun))
        {
            bRerun = false;
        }

        var iRemainingUsage = E$.context.getRemainingUsage();
        var params = new Array();

        if (E$.isNotEmpty(funcCreateParam))
        {
            params = funcCreateParam();
        }

        if (bRerun && iRemainingUsage <= minimumUsage)
        {
            E$.runScript(E$.context.getScriptId(), E$.context.getDeploymentId(), params);
        }

        return iRemainingUsage <= minimumUsage;

    };

    /**
     * 
     * @param arrIDs - Array of ids or String representing one id
     */
    E$.getScriptParam = function(arrIDs)
    {

        if (E$.isEmpty(arrIDs))
        {
            return null;
        }

        if (arrIDs instanceof Array)
        {
            var arrValues = new Object();

            for ( var idx = 0; idx < arrIDs.length; idx++)
            {
                arrValues[arrIDs[idx]] = E$.context.getSetting('SCRIPT', arrIDs[idx]);
            }

            return arrValues;
        }
        else
        {
            var stValue = E$.context.getSetting('SCRIPT', arrIDs);
            return stValue;
        }
    };

    /**
     * 
     * @param arrIDs - Array of ids or String representing one id. If left empty, this gets all parameters
     */
    E$.getRequestParam = function(arrIDs)
    {
        if (E$.isEmpty(arrIDs))
        {
            var arrValues = E$.request.getAllParameters();

            return arrValues;
        }

        if (typeof arrIDs == 'array')
        {
            var arrValues = new Object();

            for ( var idx = 0; idx < arrIDs.length; idx++)
            {
                arrValues[arrIDs[idx]] = E$.request.getParameter(arrIDs[idx]);
            }

            return arrValues;
        }
        else
        {
            var stValue = E$.request.getParameter(arrIDs);
            return stValue;
        }
    };

    /**
     * 
     * @param arrIDs - Array of ids or String representing one id.
     * @returns
     */
    E$.getURLParam = function(arrIDs)
    {

        if (isEmpty(arrIDs))
        {
            return null;
        }

        if (arrIDs instanceof Array)
        {
            var arrValues = new Object();

            for ( var idx = 0; idx < arrIDs.length; idx++)
            {
                var name = arrIDs[idx];
                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                var regexS = "[\\?&]" + name + "=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(window.location.href);
                if (results == null)
                {
                    arrValues[arrIDs[idx]] = "";
                }
                else
                {
                    arrValues[arrIDs[idx]] = results[1];
                }
            }

            return arrValues;
        }
        else
        {
            var name = arrIDs;
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null)
            {
                return "";
            }
            else
            {
                return results[1];
            }
        }

    };

    E$.geocodeAddress = function(address)
    {

        address = address.replace(/\n/g, '+');
        address = address.replace(/ /g, '+');

        var stJSON = nlapiRequestURL('http://maps.googleapis.com/maps/api/geocode/json?address=' + address);

        var objGeoCode = eval('(' + stJSON + ')');

        if (objGeoCode.status == 'OK')
        {
            if (objGeoCode.results.length > 0)
            {
                return objGeoCode.results.geometry.location;
            }
        }

        return null;
    };

    /**
     * 
     * @param options {
     *  type
     *  search (optional)
     *  filters (optional) 
     *  columns (optional)
     *  getAll (optional)
     *  maxResult (optional)
     *  funcNextFilter (optional)
     *  funcSort (optional)
     * }
     * 
     * @returns {Array}
     * 
     * var arrColumns = new Array();
     * arrColumns.push(new nlobjSearchColumn('internalid',null,'GROUP'));
     * arrColumns.push(new nlobjSearchColumn('salerep',null,'GROUP'));
     * arrColumns.push(new nlobjSearchColumn('internalid','contact','COUNT'));
     * 
     * E$.search({
     *  type: 'customer',
     *  search: 'custsearch_test',
     *  filters: arrFilters,
     *  columns: arrColumns,
     *  getAll: true,
     *  maxResult: 2000,
     *  funcNextFilter: function(arrCurResults, arrCurFilters){
     *      var stLastId = arrCurResults[arrCurResults.length - 1].getValue('internalid',null,'GROUP');
     *      arrCurFilters.push(new nlobjSearchFilter('internalidnumber','null','greaterthan',stLastId));
     *      return arrCurFilters;
     *  },
     *  funcSort: function(a,b){
     *      var aName = a.getValue('name');
     *      var bName = b.getValue('name');
     *      var aKey2 = a.getValue('salesrep');
     *      var bKey2 = b.getValue('salesrep');
     * 
     *      if(aName == bName)
     *      {
     *          if(aKey2 < bKey2) return -1;
     *          if(aKey2 > bKey2) return 1;
     *          return 0;
     *      }
     *      if(aName < bName) return -1;
     *      if(aName > bName) return 1;
     *  }
     * })
     * 
     */
    E$.search = function(options)
    {
        if (E$.isEmpty(options.type))
        {
            throw nlapiCreateError('REQD_PARM_MISS', 'Required parameter missing: Type');
        }

        if (E$.isEmpty(options.replaceColumns))
        {
            options.replaceColumns = false;
        }

        if (E$.isEmpty(options.getAll))
        {
            options.getAll = false;
        }

        if (E$.isEmpty(options.maxResult))
        {
            options.maxResult = 1000;
        }

        if (E$.isEmpty(options.filters))
        {
            options.filters = new Array();
        }

        if (E$.isEmpty(options.columns))
        {
            options.columns = new Array();
        }

        if (E$.isEmpty(options.search))
        {
            var objSearch = nlapiCreateSearch(options.type, options.filters, options.columns);

            if(E$.isNotEmpty(options.filterExp))
            {
                objSearch.setFilterExpression(options.filterExp);
            }
        }
        else
        {
//            E$.logDebug('ES.search', 'Loading search: ' + options.search);
            var objSearch = nlapiLoadSearch(options.type, options.search);
            for ( var i in options.filters)
            {
                objSearch.addFilter(options.filters[i]);
            }

            if(E$.isNotEmpty(options.filterExp))
            {
                objSearch.setFilterExpression(options.filterExp);
            }
            
            if(options.replaceColumns)
            {
                objSearch.setColumns(options.columns);
            }
            else
            {
                for ( var i in options.columns)
                {
                    objSearch.addColumn(options.columns[i]);
                }
            }
            /*
            var arrCurFilters = objSearch.getFilters();
            var arrCurColumns = objSearch.getColumns();
            for(var i in arrCurFilters)
            {
                options.filters.push(arrCurFilters[i]);
                E$.logDebug('E$.search','arrCurFilters[i]=' + typeof arrCurFilters[i]);
            }
            for(var i in arrCurColumns)
            {
                options.columns.push(arrCurColumns[i]);
            }
            //options.filters = options.filters.concat(arrCurFilters);
            //options.columns = options.columns.concat(arrCurColumns);
            
            E$.logDebug('E$.search','options.columns=' + options.columns);
            E$.logDebug('E$.search','options.filters=' + options.filters);
            var objSearch = nlapiCreateSearch(options.type, options.filters, options.columns);
            */
        }

        var objResultSet = objSearch.runSearch();
        var arrResults = new Array();

        for ( var idx = 0;; idx++)
        {
//            E$.logDebug('ES.search', 'Collating results: ' + idx);
            var bLastIteration = false;
            var iLastIndexToGet = (1000 * idx) + 1000;
            if (!options.getAll && iLastIndexToGet > options.maxResult)
            {
                bLastIteration = true;
                iLastIndexToGet = options.maxResult;
            }
//            E$.logDebug('ES.search', 'iLastIndexToGet: ' + iLastIndexToGet);
            var arrCurResults = objResultSet.getResults(1000 * idx, iLastIndexToGet);
//            E$.logDebug('ES.search', 'arrCurResults.length: ' + arrCurResults.length);

            if (E$.isEmpty(arrCurResults))
                break;

            arrResults = arrResults.concat(arrCurResults);

            if (bLastIteration)
                break;
        }

//        E$.logDebug('ES.search', 'arrResults.length: ' + arrResults.length);
        
        /*
        while(true)
        {
            var arrCurResults = nlapiSearchRecord(options.type,options.search,options.filters,options.columns);

            if(arrCurResults != null)
            {
                if(arrCurResults.length > 0)
                {
                    arrResults = arrResults.concat(arrCurResults);
                    if(!options.getAll && arrResults.length > options.maxResult)
                    {
                        arrResults = arrResults.slice(options.maxResult);
                        break;
                    }

                    if(arrCurResults.length == 1000)
                    {
                        if(options.funcNextFilter instanceof Function)
                        {
                            options.filters = options.funcNextFilter(arrCurResults, options.filters);
                        }
                        else
                        {
                            options.filters.push(new nlobjSearchFilter('internalidnumber','','greaterthan',arrCurResults[arrCurResults.length-1].getId()));
                        }
                    }
                    else
                    {
                        break;
                    }
                }
                else
                {
                    break;
                }
            }
            else
            {
                break;
            }
        }
        
        if(!options.getAll)
        {
            arrResults = arrResults.slice(0,options.maxResult);
        }
        
        */

        if (options.funcSort instanceof Function)
        {
            arrResults = arrResults.sort(options.funcSort);
        }

        return arrResults;
    };

    E$.formatCurrency = function(num)
    {
        num = num.toString().replace(/\$|\,/g, '');
        if (isNaN(num))
            num = "0";
        sign = (num == (num = Math.abs(num)));
        num = Math.floor(num * 100 + 0.50000000001);
        cents = num % 100;
        num = Math.floor(num / 100).toString();
        if (cents < 10)
            cents = "0" + cents;
        for ( var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
            num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
        return (((sign) ? '' : '-') + num + '.' + cents);
    };

    /**
     * 
     * @param file_array example [['links','url for css file'],['scripts','url for js file']]
     * @param callback - function to execute after loading files
     */
    E$.lazyload = function(file_array, callback)
    {

        if (typeof callback != 'function')
        {
            callback = function()
            {
            };
        }

        //reverse the array because we pop off the file we need
        file_array.reverse();
        remaining = file_array.length;
        if (remaining > 0)
        {
            url_array = file_array.pop();
            file_array.reverse(); //put the array back in order
            var head = document.getElementsByTagName('head')[0];
            switch (url_array[0])
            {
                case "scripts":
                    f = document.createElement('script');
                    f.type = 'text/javascript';
                    f.src = url_array[1];
                    break;

                case "links":
                    f = document.createElement('link');
                    f.rel = 'stylesheet';
                    f.href = url_array[1];
                    break;
            }
            head.appendChild(f);

            //if there are no more files, then do the callback
            if (remaining == 1)
            {
                if (f.rel == 'stylesheet')
                {
                    callback();
                }
                else
                {
                    if (navigator.appName != 'Netscape')
                        f.onreadystatechange = function()
                        {
                            if (E$.readyState == 'loaded' || E$.readyState == 'complete')
                                callback();
                        };
                    else
                        f.onload = function()
                        {
                            callback();
                        };
                }
            }
            //if there are more files, then load them
            else
            {
                if (f.rel == 'stylesheet')
                {
                    E$.lazyload(file_array, callback);
                }
                else
                {
                    if (navigator.appName != 'Netscape')
                        f.onreadystatechange = function()
                        {
                            if (E$.readyState == 'loaded' || E$.readyState == 'complete')
                                E$.lazyload(file_array, callback);
                        };
                    else
                        f.onload = function()
                        {
                            E$.lazyload(file_array, callback);
                        };
                }
            }

        }
    };
    //==================================

    E$.loadFile = function(filename_prefix, bGetAll, folder)
    {
        var arrFilters = new Array();
        arrFilters.push(new nlobjSearchFilter('name', null, 'startswith', filename_prefix + '_p'));
        arrFilters.push(new nlobjSearchFilter('folder', null, 'is', folder));

        var arrColumns = new Array();
        arrColumns.push(new nlobjSearchColumn('internalid'));
        arrColumns.push(new nlobjSearchColumn('name'));

        arrColumns[0].setSort();

        var arrResults = E$.search(
            {
                'type' : 'file',
                'search' : null,
                'filters' : arrFilters,
                'columns' : arrColumns,
                'getAll' : true,
                'funcSort' : function(a, b)
                {
                    var aName = a.getValue('name');
                    var bName = b.getValue('name');

                    if (aName < bName)
                        return -1;
                    if (aName > bName)
                        return 1;
                    return 0;
                }
            });

        var stData = '';
        var stFiles = '';

        for ( var idx = 0; idx < arrResults.length; idx++)
        {
            var stCurFile = arrResults[idx].getId();
            stFiles += 'loading:: fileid=' + stCurFile + ' (' + arrResults[idx].getValue('name') + ')\n';
            var objFile = nlapiLoadFile(stCurFile);
            stData += objFile.getValue();
        }
        E$.logAudit('loadFile', 'stFiles=' + stFiles);

        return stData;
    };

    E$.cleanUpFiles = function(filename_prefix, folder, iStartIdx)
    {
        E$.logAudit('cleanUpFiles', 'cleanUpFiles start');
        var arrFilters = new Array();
        arrFilters.push(new nlobjSearchFilter('name', null, 'startswith', filename_prefix + '_p'));
        arrFilters.push(new nlobjSearchFilter('folder', null, 'is', folder));

        var arrColumns = new Array();
        arrColumns.push(new nlobjSearchColumn('internalid'));
        arrColumns.push(new nlobjSearchColumn('name'));

        arrColumns[0].setSort();

        var arrResults = E$.search(
            {
                'type' : 'file',
                'search' : null,
                'filters' : arrFilters,
                'columns' : arrColumns,
                'getAll' : true
            });

        for ( var idx = 0; idx < arrResults.length; idx++)
        {
            var stCurFile = arrResults[idx].getId();
            var iSuffix = arrResults[idx].getValue('name');
            iSuffix = iSuffix.replace(filename_prefix, '');
            iSuffix = iSuffix.substr(iSuffix.indexOf('_p') + 2);
            iSuffix = parseFloat(iSuffix);
            if (E$.isNotEmpty(iStartIdx))
            {
                if (iSuffix >= iStartIdx)
                {
                    nlapiDeleteFile(stCurFile);
                }
            }
            else
            {
                nlapiDeleteFile(stCurFile);
            }
        }

        E$.logAudit('cleanUpFiles', 'cleanUpFiles end');
    };

    E$.saveFile = function(arrData, filename_prefix, folder, bCleanUp)
    {

        var MAX_LEN = 4500000;

        if (typeof arrData == "string")
        {
            var stJSON = arrData;
        }
        else
        {
            var stJSON = JSON.stringify(arrData);
        }

        var iFileCnt = Math.ceil(stJSON.length / MAX_LEN);
        E$.logAudit('saveFile', 'iFileCnt=' + iFileCnt);

        if (bCleanUp)
        {
            E$.cleanUpFiles(filename_prefix, folder);
        }

        var arrFiles = new Array();
        var stFiles = new String();

        for ( var idx = 0; iFileCnt && idx < iFileCnt; idx++)
        {
            E$.logAudit('saveFile', 'idx:' + idx+'/'+iFileCnt);
            var stData = stJSON.substr((idx * MAX_LEN), MAX_LEN);
            //E$.logAudit('saveFile', '828');
            var file = nlapiCreateFile(filename_prefix + '_p' + E$.zeroPadding(idx,6) + '.txt', 'PLAINTEXT', stData);
            file.setFolder(folder);
            file.setEncoding('UTF-8');
            //E$.logAudit('saveFile', '832');
            var stFileId = nlapiSubmitFile(file);
            E$.logAudit('saveFile', '834 stFileId:'+stFileId);
            arrFiles.push(stFileId);
            stFiles += filename_prefix + '_p' + E$.zeroPadding(idx,6) + '.txt' + '=' + stFileId + '\n';
        }
        E$.logAudit('saveFile', 'stFiles=' + stFiles);

        return arrFiles;
    };
    
    E$.retrieveData = function(filename_prefix, bGetAll, folder)
    {
        var objData = new Object();
        var stData = E$.loadFile(filename_prefix, bGetAll, folder);
        if(E$.isNotEmpty(stData))
        {
            objData = eval('(' + stData + ')');
        }
        return objData;
    };

    E$.zeroPadding = function(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    };
    /*
     * from '5' to '005'
     */
    E$.padStr = function(str, max) {
    	str = str.toString();
    	return str.length < max ? E$.padStr("0" + str, max) : str;
    };
    E$.getNumericTimeMarkForFileName = function(){
    	var time=new Date();
    	var time_mark=time.getFullYear()+padStr(time.getMonth()+1, 2)+padStr(time.getDate(), 2)+"_"+padStr(time.getHours(), 2)+padStr(time.getMinutes(), 2)+padStr(time.getSeconds(), 2);
    	return time_mark;
    };
    E$.backupData = function(filename_prefix, filename_prefix_backup, bGetAll, folder)
    {

        var objData = new Object();
        var stData = E$.loadFile(filename_prefix, bGetAll, folder);
        if(E$.isNotEmpty(stData))
        {
            objData = eval('(' + stData + ')');
        }

    	if(filename_prefix_backup==undefined || filename_prefix_backup==null || filename_prefix_backup==""){
	    	var stTimeStamp=E$.getNumericTimeMarkForFileName();
	    	filename_prefix_backup = filename_prefix+"_bk"+stTimeStamp;
    	}
        return E$.saveFile(objData, filename_prefix_backup, folder, true);
    };
    //==================================

})(E$);
