function _TranslateUsername(objRequest, objResponse) {
  E$.logAudit("TRANSLATE elevatedPortal", "=====START=====");

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    E$.logAudit(
      "TRANSLATE elevatedPortal",
      "Body Object: " + JSON.stringify(objRxData)
    );

    var objDataResponse = {
      Username: objRxData.Username,
      Email: "",
      Password: ""
    };

    var arrFilters = [
      new nlobjSearchFilter("companyname", null, "is", objRxData.Username)
    ];

    var arrColumns = [new nlobjSearchColumn("email")];

    var customers = nlapiSearchRecord("customer", null, arrFilters, arrColumns);

    if (true) {
      objDataResponse.Email = customers.shift().getValue(arrColumns[0]);
      //objDataResponse.Email = "jevaluator@unique.com";
      E$.logAudit(
        "TRANSLATE elevatedPortal",
        "Username Found return data object: " + JSON.stringify(objDataResponse)
      );
    } else {
      nlapiLogExecution(
        "ERROR",
        "TRANSLATE FAILED",
        "The attempt to find the username failed: "
      );
    }
  } else {
    nlapiLogExecution(
      "ERROR",
      "TRANSLATE FAILED",
      "Body of returned object is undefined."
    );
  }

  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
  E$.logAudit("TRANSLATE elevatedPortal", "=====END=====");
}
