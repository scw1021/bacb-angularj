var ACTIONS = {
  Check: _Check,
  Create: _Create,
  CreateAll: _CreateAll,
  Delete: _Delete,
  Delete_All: _Delete_All,
  ReadAnswer: _ReadAnswer,
  ReadQuestion: _ReadQuestion,
  Update: _Update
};

function service(objRequest, objResponse) {
  var stParam = objRequest.getParameter("param");

  if (ACTIONS[stParam]) {
    ACTIONS[stParam](objRequest, objResponse);
  }
}

function _Check(objRequest, objResponse) {
  E$.logAudit("CHECK Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "Check Attestation", "The call to get the current web session failed.:" + ex.message);
  }
  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", "Check Attestation", "Body of the request is not defined.");
  }
  nlapiLogExecution("DEBUG", "Check Attestation", JSON.stringify(objRxData));
  var objDataResponse = {
    Response: "F",
    // We need a better message, so we just want the section number.
    // Message: "Not all questions for section " + objRxData.SectionId + " have been answered."
    Message: objRxData.SectionId
  };
  var arrQuestionFilters = [];
  arrQuestionFilters[0] = new nlobjSearchFilter("custrecord_att_questions_cert_type", null, "is", objRxData.CertTypeId);
  arrQuestionFilters[1] = new nlobjSearchFilter("custrecord_att_questions_app_type", null, "is", objRxData.AppTypeId);
  arrQuestionFilters[2] = new nlobjSearchFilter("custrecord_att_questions_section", null, "is", objRxData.SectionId);

  var searchQuestionResults = nlapiSearchRecord('customrecord_attestation_questions', null, arrQuestionFilters, null);
  nlapiLogExecution("DEBUG", "Check Attestation Question Results", JSON.stringify(searchQuestionResults));
  var arrQuestionResults = [];
  if (!searchQuestionResults instanceof Array){
    arrQuestionResults.push(searchQuestionResults);
  }
  else {
    for (var stIndex in searchQuestionResults) {
    arrQuestionResults.push(searchQuestionResults[stIndex]);
    }
  }

  if (arrQuestionResults && arrQuestionResults.length && objRxData.AppId) {
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter("custrecord_attestation_application", null, "is", objRxData.AppId);
    arrFilters[1] = new nlobjSearchFilter("custrecord_att_questions_section", "custrecord_attestation_question", "is", objRxData.SectionId);



    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn("custrecord_attestation_question");
    arrColumns[1] = new nlobjSearchColumn("custrecord_attestation_answer");
    arrColumns[2] = new nlobjSearchColumn("custrecord_attestation_date_signed");
    arrColumns[3] = new nlobjSearchColumn("custrecord_att_questions_canbefalse","custrecord_attestation_question");
    var searchResults = nlapiSearchRecord("customrecord_attestations", null, arrFilters, arrColumns);
    nlapiLogExecution("DEBUG", "Check Attestation Search Results", JSON.stringify(searchResults));
    var arrSearchResults = [];
    var arrAnswers = {};
    if (!searchResults instanceof Array) {
      arrSearchResults.push(searchResults);
    }
    else {
      for (var stIndex2 in searchResults) {
        arrSearchResults.push(searchResults[stIndex2]);
      }
    }
    for (var stIndex in searchResults) {
      arrAnswers[arrSearchResults[stIndex].getValue(arrColumns[0])] = {
        'Answer': arrSearchResults[stIndex].getValue(arrColumns[1]),
        'Date': arrSearchResults[stIndex].getValue(arrColumns[2])
      };
    }

    E$.logAudit("CHECK Attestation", "ArrAnswers: " + JSON.stringify(arrAnswers));

    var SectionComplete = true;
    for (var stQuestionId in arrAnswers) {
      if (arrAnswers[stQuestionId].Answer == '' || arrAnswers[stQuestionId].Date == null) {
        SectionComplete = false;
      }
    }
    if (SectionComplete && arrSearchResults.length === arrQuestionResults.length) {
      objDataResponse.Response = "T";
      objDataResponse.Message = "All attestation requirements have been completed.";
    }
  } else {
    nlapiLogExecution("ERROR", "Check Attestation", "The application ID is not defined.");
  }

  E$.logAudit("CHECK Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Create(objRequest, objResponse) {
  E$.logAudit("CREATE Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "CREATE Attestation", "The call to get the current web session failed.:" + ex.message);
  }

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", "CREATE Attestation", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Response: "",
    Message: "",
    ReturnId: ""
  };

  var Result = _WriteAttestation(objRxData);
  var Question = _GetQuestion(Result.Question.Id);
  if (Result.Answer == Question.DocRequiredOn) {
    var objFile = objRequest.getFile("attachment");
    var DocId = _WriteDocument(stCustId, objFile, objRxData);
  }

  if (Result.Id !== "") {
    (objDataResponse.Response = "T"),
      (objDataResponse.Message = "Attestation question answered successfully.");
  } else {
    objDataResponse.Response = "F";
    objDataResponse.Message += "WriteAttestation Failed for Question ID: " + objRxData.QuestionId + "\n";
  }

  E$.logAudit("CREATE Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _CreateAll(objRequest, objResponse) {
  // E$.logAudit("CreateAll Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "CreateAll Attestation", "The call to get the current web session failed.:" + ex.message);
  }

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", "CreateAll Attestation", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Response: "",
    Message: "",
    ReturnId: ""
  };

  for (var InstAttestation in objRxData.Attestations) {
    var Result = _WriteAttestation(InstAttestation);
    if (Attestation.Answer == "F") {
      var objFile = objRequest.getFile("attachment");
      Attestation.DocId = _WriteDocument(stCustId, objFile, objRxData.Attestations[InstAttestation]);
    }

    if (Result.Id == "") {
      objDataResponse.Response = "F";
      objDataResponse.Message += "WriteAttestation Failed for Question ID: " + objRxData.Attestations[InstAttestation].QuestionId + "\n";
    }
  }
  if (ObjDataResponse.Response === "") {
    (ObjDataResponse.Response = "T"),
      (ObjDataResponse.Message = "Attestation questions answered successfully.");
  }

  // E$.logAudit("CreateAll Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Delete(objRequest, objResponse) {
  E$.logAudit("DELETE Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "DELETE Attestation", "The call to get the current web session failed.:" + ex.message);
  }
  // nlapiLogExecution(
  //   "AUDIT",
  //   "DELETE_CALLED",
  //   "DELETE function in Attestation executed."
  // );

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", "DELETE Attestation", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Response: "",
    Message: ""
  };

  if (objRxData.Id) {
    nlapiDeleteRecord("customrecord_attestations", objRxData.Id);
  } else {
    objDataResponse.Response = "F";
    objDataResponse.Message = "Attestation ID is invalid.";
    throw nlapiCreateError("DELETE Attestation", "Attestation ID is invalid.");
  }
  if (objDataResponse == "") {
    objDataResponse.Response = "T";
    objDataResponse.Message = "Attestation deleted successfully.";
  }

  E$.logAudit("DELETE Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Delete_All(objRequest, objResponse) {
  // E$.logAudit("DELETE_ALL Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "DELETE_ALL Attestation", "The call to get the current web session failed.:" + ex.message);
  }

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
  } else {
    nlapiLogExecution("ERROR", "DELETE_ALL Attestation", "Body of the request is not defined.");
  }

  var objDataResponse = {
    AppId: objRxData.AppId
  };

  if (objRxData.AppId) {
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter("custrecord_attestation_application", null, "is", objRxData.AppId);

    var searchResults = nlapiSearchRecord("customrecord_attestations", null, arrFilters, null);

    if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
        nlapiDeleteRecord("customrecord_attestations", searchResults[stIndex].getId());
      }
    } else if (searchResults !== null) {
      nlapiDeleteRecord("customrecord_attestations", searchResults.getId());
    }
  }

  // E$.logAudit("DELETE_ALL Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _ReadQuestion(objRequest, objResponse) {
  E$.logAudit("ReadQuestion Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "ReadQuestion Attestation", "The call to get the current web session failed.:" + ex.message);
  }

  var objDataResponse = {
    Array: []
  };

  // question object
  // {   'Id': '',
  //     'AQCertType',
  //     'AQAppType',
  //     'Number': '',
  //     'Section': '',
  //     'Title': '',
  //     'Text': '',
  //     'HTML': '',
  //     'CanBeFalse': '',
  //     'TrueOption': '',
  //     'FalseOption': '',
  //     'DocRequired': '',
  //     'DocRequiredOn': ''}

  var CertTypes = [];
  var arrCertColumns = new Array();
  arrCertColumns[0] = new nlobjSearchColumn("custrecord_cert_type_abbrev");
  arrCertColumns[1] = new nlobjSearchColumn("custrecord_cert_type_name");

  var searchCertResults = nlapiSearchRecord("customrecord_cert_type", null, null, arrCertColumns);

  if (searchCertResults instanceof Array && searchCertResults.length) {
    for (var stIndex in searchCertResults) {
      CertTypes.push({
        Id: searchCertResults[stIndex].getId(),
        Abbrev: searchCertResults[stIndex].getValue(arrCertColumns[0]),
        Name: searchCertResults[stIndex].getValue(arrCertColumns[1])
      });
    }
  } else if (searchCertResults != null) {
    CertTypes.push({
      Id: searchCertResults.getId(),
      Abbrev: searchCertResults.getValue(arrCertColumns[0]),
      Name: searchCertResults.getValue(arrCertColumns[1])
    });
  }

  var AppTypes = [];
  var arrAppColumns = new Array();
  arrAppColumns[0] = new nlobjSearchColumn("internalId").setSort(false);
  arrAppColumns[1] = new nlobjSearchColumn("name");

  var searchAppResults = nlapiSearchRecord("customlist_application_type", null, null, arrAppColumns);

  if (searchAppResults instanceof Array && searchAppResults.length) {
    for (var stIndex in searchAppResults) {
      AppTypes.push({
        Id: searchAppResults[stIndex].getValue(arrAppColumns[0]),
        Value: searchAppResults[stIndex].getValue(arrAppColumns[1])
      });
    }
  } else if (searchAppResults !== null) {
    AppTypes.push({
      Id: searchAppResults.getValue(arrAppColumns[0]),
      Value: searchAppResults.getValue(arrAppColumns[1])
    });
  }

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn("custrecord_att_questions_cert_type");
  arrColumns[1] = new nlobjSearchColumn("custrecord_att_questions_app_type");
  arrColumns[2] = new nlobjSearchColumn("custrecord_att_questions_number").setSort(false);
  arrColumns[3] = new nlobjSearchColumn("custrecord_att_questions_section").setSort(false);
  arrColumns[4] = new nlobjSearchColumn("custrecord_att_questions_title");
  arrColumns[5] = new nlobjSearchColumn("custrecord_att_questions_text");
  arrColumns[6] = new nlobjSearchColumn("custrecord_att_questions_full_text");
  arrColumns[7] = new nlobjSearchColumn("custrecord_att_questions_canbefalse");
  arrColumns[8] = new nlobjSearchColumn("custrecord_att_question_true_option");
  arrColumns[9] = new nlobjSearchColumn("custrecord_att_question_false_option");
  arrColumns[10] = new nlobjSearchColumn("custrecord_att_question_doc_required");
  arrColumns[11] = new nlobjSearchColumn("custrecord_att_question_doc_required_on");

  var searchResults = nlapiSearchRecord("customrecord_attestation_questions", null, null, arrColumns);

  if (searchResults instanceof Array && searchResults.length) {
    for (var stIndex in searchResults) {
      objDataResponse.Array.push({
        Id: searchResults[stIndex].getId(),
        AQCertType:
          CertTypes[searchResults[stIndex].getValue(arrColumns[0]) - 1],
        AQAppType: AppTypes[searchResults[stIndex].getValue(arrColumns[1]) - 1],
        Number: searchResults[stIndex].getValue(arrColumns[2]),
        Section: searchResults[stIndex].getValue(arrColumns[3]),
        Title: searchResults[stIndex].getValue(arrColumns[4]),
        Text: searchResults[stIndex].getValue(arrColumns[5]),
        HTML: searchResults[stIndex].getValue(arrColumns[6]),
        CanBeFalse: searchResults[stIndex].getValue(arrColumns[7]),
        TrueOption: searchResults[stIndex].getValue(arrColumns[8]),
        FalseOption: searchResults[stIndex].getValue(arrColumns[9]),
        DocRequired: searchResults[stIndex].getValue(arrColumns[10]),
        DocRequiredOn: searchResults[stIndex].getValue(arrColumns[11])
      });
    }
  } else if (searchResults !== null) {
    objDataResponse.Array.push({
      Id: searchResults.getId(),
      AQCertType: CertTypes[searchResults.getValue(arrColumns[0]) - 1],
      AQAppType: AppTypes[searchResults.getValue(arrColumns[1]) - 1],
      Number: searchResults.getValue(arrColumns[0]),
      Section: searchResults.getValue(arrColumns[1]),
      Title: searchResults.getValue(arrColumns[2]),
      Text: searchResults.getValue(arrColumns[3]),
      HTML: searchResults.getValue(arrColumns[4]),
      CanBeFalse: searchResults.getValue(arrColumns[5]),
      TrueOption: searchResults.getValue(arrColumns[6]),
      FalseOption: searchResults.getValue(arrColumns[7]),
      DocRequired: searchResults.getValue(arrColumns[8]),
      DocRequiredOn: searchResults.getValue(arrColumns[9])
    });
  }

  E$.logAudit("READ Question", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _ReadAnswer(objRequest, objResponse) {
  // E$.logAudit("ReadAnswer Attestation", "=====START=====");

  try {
    var objSession = nlapiGetWebContainer().getShoppingSession();
    var stCustId = objSession.getCustomer().getFieldValues().internalid;
  } catch (ex) {
    nlapiLogExecution("ERROR", "ReadAnswer Attestation", "The call to get the current web session failed.:" + ex.message);
  }
  // nlapiLogExecution("AUDIT", "ReadAnswer Attestation", "READ function in Attestation executed.");

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    // nlapiLogExecution("AUDIT", "ReadAnswer Attestation", JSON.stringify(objRxData));
  } else {
    nlapiLogExecution("ERROR", "ReadAnswer Attestation", "Body of the request is not defined.");
  }

  var objDataResponse = {
    Array: []
  };

  if (objRxData.AppId) {
    var arrFilters = [];
    arrFilters[0] = new nlobjSearchFilter("custrecord_attestation_application", null, "is", objRxData.AppId);

    var arrColumns = new Array();
    arrColumns[0] = new nlobjSearchColumn("custrecord_attestation_question");
    arrColumns[1] = new nlobjSearchColumn("custrecord_att_questions_section", "custrecord_attestation_question").setSort(false);
    arrColumns[2] = new nlobjSearchColumn("custrecord_att_questions_number", "custrecord_attestation_question").setSort(false);
    arrColumns[3] = new nlobjSearchColumn("custrecord_attestation_answer");
    arrColumns[4] = new nlobjSearchColumn("custrecord_attestation_date_signed");

    var searchResults = nlapiSearchRecord("customrecord_attestations", null, arrFilters, arrColumns);

    if (searchResults instanceof Array && searchResults.length) {
      for (var stIndex in searchResults) {
        objDataResponse.Array.push({
          Id: searchResults[stIndex].getId(),
          AppId: objRxData.AppId,
          QuestionId: searchResults[stIndex].getValue(arrColumns[0]),
          SectionId: searchResults[stIndex].getValue(arrColumns[1]),
          Answer: searchResults[stIndex].getValue(arrColumns[3]),
          Date: searchResults[stIndex].getValue(arrColumns[4])
        });
      }
    } else if (searchResults !== null) {
      objDataResponse.Array.push({
        Id: searchResults.getId(),
        AppId: objRxData.AppId,
        QuestionId: searchResults.getValue(arrColumns[0]),
        SectionId: searchResults.getValue(arrColumns[2]),
        Answer: searchResults.getValue(arrColumns[3]),
        Date: searchResults.getValue(arrColumns[4])
      });
    }
  } else {
    throw nlapiCreateError("ReadAnswer Attestation", "The application ID was not defined.");
  }

  // E$.logAudit("READ Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));
}

function _Update(objRequest, objResponse) {
  // E$.logAudit("UPDATE Attestation", "=====START=====");

  var objSession = nlapiGetWebContainer().getShoppingSession();
  var stCustId = objSession.getCustomer().getFieldValues().internalid;

  var stBody = objRequest.getBody();
  if (stBody) {
    objRxData = JSON.parse(stBody);
    // nlapiLogExecution("AUDIT", "ReadAnswer Attestation", JSON.stringify(objRxData));
  } else {
    nlapiLogExecution("ERROR", "Update Attestation", "Body of the request is not defined.");
  }
  // nlapiLogExecution("DEBUG", "Update Attestation", JSON.stringify(objRxData));
  var objDataResponse = {
    Response: "F",
    Message: "",
    ReturnId: ""
  };
  var recAttestation = nlapiLoadRecord('customrecord_attestations', objRxData.Id );
  // nlapiLogExecution("DEBUG", "Update Attestation Loaded", JSON.stringify(recAttestation));
  recAttestation.setFieldValue("custrecord_attestation_answer", objRxData.Answer);
  var result = nlapiSubmitRecord(recAttestation)
  if ( result != objRxData.Id ) {
    objDataResponse.Message = "Id's do not match";
    objDataResponse.ReturnId = "" + result + " - " + objRxData.Id;
  }
  else {
    objDataResponse.Message = "Updated response";
    objDataResponse.ReturnId = result;
    objDataResponse.Response = "T";
  }
  // E$.logAudit("UPDATE Attestation", "======END======");
  objResponse.setContentType("PLAINTEXT");
  objResponse.write(JSON.stringify(objDataResponse));

  // E$.logAudit("UPDATE Attestation", "======END======");
}

function _WriteAttestation(Attestation) {
  // nlapiLogExecution("AUDIT", "WriteAttestation Attestation", "WriteAttestation executed.");
  // nlapiLogExecution("AUDIT", "WriteAttestation Attestation", JSON.stringify(Attestation));
  // Create an individual attestation record attached to the current application
  try {
    // var recQuestion = nlapiLoad
    var recAttestation = nlapiCreateRecord("customrecord_attestations");
    recAttestation.setFieldValue(
      "custrecord_attestation_application",
      Attestation.AppId
    );
    recAttestation.setFieldValue(
      "custrecord_attestation_question",
      Attestation.QuestionId
    );
    recAttestation.setFieldValue(
      "custrecord_attestation_answer",
      Attestation.Answer
    );
    recAttestation.setFieldValue(
      "custrecord_attestation_doc_id",
      Attestation.DocId
    );
    recAttestation.setFieldValue(
      "custrecord_attestation_date_signed",
      nlapiDateToString(new Date())
    );
    var NewId = nlapiSubmitRecord(recAttestation, true);
  } catch (ex) {
    nlapiLogExecution("ERROR", "WriteAttestation Attestation", "The attempt to write an attestation failed.:" + ex.message);
  }

  return {
    'Id' : NewId,
    'Question' : {
      'Id' : Attestation.QuestionId,
      'DocRequiredOn' : Attestation
    },
    'Answer': Attestation.Answer
  };
}

function _WriteDocument(CustomerID, objDocument, stAttestationId) {
  // We shouldn't even call this if there isn't a document to write.
  if (objDocument == null) {
    return;
  }
  objDocument.setFolder(84146); // BACB Documents
  var stFileId = nlapiSubmitFile(objFile);

  var recDoc = nlapiCreateRecord("customrecord_documents");
  recDoc.setFieldValue("custrecord_doc_customer", CustomerID);
  recDoc.setFieldValue("custrecord_doc_type", "1");
  recDoc.setFieldValue("custrecord_doc_file", stFileId);
  recDoc.setFieldValue("custrecord_doc_version", "1");
  recDoc.setFieldValue("custrecord_doc_date_uploaded", nlapiDateToString(new Date(), "date"));

  return {
    Id: nlapiSubmitRecord(recDoc, true, true),
    AttestationId: stAttestationId,
    FileId: stFileId
  };
}

function _GetQuestion(QuestionId) {

  var arrColumns = new Array();
  arrColumns[0] = new nlobjSearchColumn("custrecord_att_questions_cert_type");
  arrColumns[1] = new nlobjSearchColumn("custrecord_att_questions_app_type");
  arrColumns[2] = new nlobjSearchColumn("custrecord_att_questions_number").setSort(false);
  arrColumns[3] = new nlobjSearchColumn("custrecord_att_questions_section").setSort(false);
  arrColumns[4] = new nlobjSearchColumn("custrecord_att_questions_title");
  arrColumns[5] = new nlobjSearchColumn("custrecord_att_questions_text");
  arrColumns[6] = new nlobjSearchColumn("custrecord_att_questions_full_text");
  arrColumns[7] = new nlobjSearchColumn("custrecord_att_questions_canbefalse");
  arrColumns[8] = new nlobjSearchColumn("custrecord_att_question_true_option");
  arrColumns[9] = new nlobjSearchColumn("custrecord_att_question_false_option");
  arrColumns[10] = new nlobjSearchColumn("custrecord_att_question_doc_required");
  arrColumns[11] = new nlobjSearchColumn("custrecord_att_question_doc_required_on");

  var searchResults = nlapiSearchRecord("customrecord_attestation_questions", null, new nlobjSearchFilter('internalid',null,'is',QuestionId), arrColumns);

  var ReturnObj = {};
  // We only need to null check once
  if (searchResults !== null) {
    // if it isn't already an array, make it iterable
    if (!(searchResults instanceof Array)) {
      searchResults = [searchResults];
    }
    // then compile returned elements if result has length
    if (searchResults.length) {
      for (var stIndex in searchResults) {
        ReturnObj = {
          Id: searchResults[stIndex].getId(),
          Number: searchResults[stIndex].getValue(arrColumns[2]),
          Section: searchResults[stIndex].getValue(arrColumns[3]),
          Title: searchResults[stIndex].getValue(arrColumns[4]),
          Text: searchResults[stIndex].getValue(arrColumns[5]),
          HTML: searchResults[stIndex].getValue(arrColumns[6]),
          CanBeFalse: searchResults[stIndex].getValue(arrColumns[7]),
          TrueOption: searchResults[stIndex].getValue(arrColumns[8]),
          FalseOption: searchResults[stIndex].getValue(arrColumns[9]),
          DocRequired: searchResults[stIndex].getValue(arrColumns[10]),
          DocRequiredOn: searchResults[stIndex].getValue(arrColumns[11])
        };
      }
    }
  }
  return ReturnObj;
}
