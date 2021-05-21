/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(
  ['N/file', 'N/encode', 'N/log'],
  function(file, encode, log) {
    function onRequest(context) {

      if (context.request.method == 'GET') {

        log.debug('Export Params', context.request.parameters.reportData);

        var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
        xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

        xmlStr += '<Styles>' +
          '<Style ss:ID="s63">' +
          '<Font x:CharSet="204" ss:Size="12" ss:Color="#000000" ss:Bold="1" ss:Underline="Single"/>' +
          '</Style>' + '</Styles>';

        xmlStr += '<Worksheet ss:Name="Sheet1">';

        xmlStr += '<Table>' +
          '<Row>' +
          '<Cell ss:StyleID="s63"><Data ss:Type="String"> ID </Data></Cell>' +
          '<Cell><Data ss:Type="String"> Products Feature </Data></Cell>' +
          '</Row>';

        xmlStr += '<Row>' +
          '<Cell><Data ss:Type="String">1</Data></Cell>' +
          '<Cell><Data ss:Type="String">NetSuite Export CSV</Data></Cell>' +
          '</Row>';

        xmlStr += '<Row>' +
          '<Cell><Data ss:Type="String">2</Data></Cell>' +
          '<Cell><Data ss:Type="String">NetSuite Export Excel</Data></Cell>' +
          '</Row>';

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

        context.response.writeFile({
          file: objXlsFile
        });
      }

    }

    return {
      onRequest: onRequest
    };

  });
