import { CONFIRM_SUCCESS, IConfirm, IResponseObject } from '../_interfaces';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DefaultUnitTest, IRecordTest, IUnitTest } from '../_interfaces/i-unit-test';
import { IRecordTestGroup, IUnitTestGroup } from '../_interfaces/i-unit-test-group';

import { ResponseObject } from '../_models';
import { Service } from '../_services/deployable.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-unit-test',
  templateUrl: './unit-test.component.html',
  styleUrls: ['./unit-test.component.css']
})
export class UnitTestComponent implements OnInit, OnDestroy {

  public onDestroySubscriptionsArr: Subscription[] = [];

  public RecordSetTests: IRecordTestGroup[] = [
    TestRecords
  ];
  public UnitTestSets: IUnitTestGroup[] = [
    TestInitPortal,
    TestAccommodations,
    // TestActionItem,
    TestApplication,
    TestAttestation,
    TestBackgroundCheck,
    TestCertifications, TestCompetency, TestContacts, TestContentHours,
    TestContinuingEducation, TestCourses, TestCourseSequences, TestCoursework,
    TestDegreeInfo, TestDeparments,
    TestExperience, TestExperienceSupervisor,
    TestFileMgmt,
    TestInstitution, TestInvoices,
    // TestMarketingOptions,
    TestNews,
    TestOtherCredentials,
    TestPayment, TestPersonalInfo, TestProfessionalInfo, TestProfileInfo,
    TestQuestions,
    TestRegisteredCourses,
    TestSupervision,
    TestTraining,
    TestUtility
  ];
  public DefaultTestText: string = 'PENDING...';


  public TotalNumberOfTests: number = 0;
  public TotalPassedTests: number = 0;

  constructor(
    private deployable: Service
  ) { }

  ngOnInit() {
    this.runUnitTestGroups();
    this.runRecordTestGroups();
  }

  private runRecordTestGroups() {
    this.RecordSetTests.forEach( (TestGroup: IRecordTestGroup) => {
      TestGroup.Tests.forEach( (UnitTest: IRecordTest) => {
        this.TotalNumberOfTests++;
        this.onDestroySubscriptionsArr.push(
          this.deployable.ExecuteRecordTest(UnitTest)
          .subscribe( (response: any) => {
            if ( response ) {
              UnitTest.Received = JSON.stringify(response.Data);
              if ( UnitTest.Received == UnitTest.Result ) {
                UnitTest.Passed = true;
                this.TotalPassedTests++;
              }
              else {
                UnitTest.Passed = false;
              }
            }
            else {
              UnitTest.Passed = false;
              UnitTest.Received = 'No response from server';
            }
          })
        )
      })
    })
  }

  private runUnitTestGroups() {
    this.UnitTestSets.forEach( (TestGroup: IUnitTestGroup) => {
      TestGroup.Tests.forEach( (UnitTest) => {
        UnitTest.ViewResult = false;
        this.TotalNumberOfTests++;
        this.onDestroySubscriptionsArr.push(
          this.deployable.ExecuteUnitTest(TestGroup.Script, UnitTest)
          .subscribe( (response: IConfirm | any ) => {
            console.log(response);
            if ( response ) {
              if ( response.Data ) { // Response for all _Test tests
                if ( JSON.stringify(UnitTest.ResponseObject) == JSON.stringify(response.Data) ){
                  UnitTest.Result = 'TEST PASSED';
                  UnitTest.TestResponse = `Message: ${response.Message}\n\nResponse: ${JSON.stringify(response.Data)}\nMatches: ${JSON.stringify(UnitTest.ResponseObject)}`;
                  UnitTest.Passed = true;
                }
                else {
                  UnitTest.Result = 'TEST FAILED';
                  UnitTest.TestResponse = `Message: ${response.Message}\n\nResponse: ${JSON.stringify(response)}\nExpected: ${JSON.stringify(UnitTest.ResponseObject)}`;
                  UnitTest.Passed = false;
                }
              }
              else if ( (response as IConfirm).Response ) {
                UnitTest.Result = (response as IConfirm).Message;
                UnitTest.Passed = (response as IConfirm).Response == 'T';
                UnitTest.TestResponse = JSON.stringify(response);
              }
              else  { // It's a response object and it's fine
                UnitTest.Result = 'TEST PASSED';
                UnitTest.TestResponse = `response: ${JSON.stringify(response)}`;
                UnitTest.Passed = true;
              }
            }
            else {
              UnitTest.Result = 'TEST FAILED - RESPONSE NULL';
              UnitTest.Passed = false;
              UnitTest.TestResponse = 'no response from server';
            }
            if ( UnitTest.Passed ) {
              this.TotalPassedTests++;
            }

          })
        )
      })
    })
  }

  public ShowHide(test: IUnitTest): void {
    console.log(test);
    test.ViewResult = !test.ViewResult;
  }

  ngOnDestroy() {
    this.onDestroySubscriptionsArr.forEach((subscriptionToCleanup: Subscription) => subscriptionToCleanup.unsubscribe())
  }
}

const INSUFFICIENT_PERMISSIONS = 'Higher permissions required for custom record type';
const NO_RECORDS = 'No records found for custom record, cannot read property [0] from NULL';

const TestInitPortal: IUnitTestGroup = {
  Header: 'InitPortal Tests',
  Description: 'Checking login and other elements',
  Script: 'initPortal',
  Tests: [DefaultUnitTest]
}
const TestRecords: IRecordTestGroup = {
  Header: 'Test Records',
  Description: 'Test of all available and used Records in NS',
  Script: 'TestPortal',
  Tests: [{
    Record: 'es_ce_event',
    Result: '["custrecord_es_ceevt_discontinued_on","custrecord_es_ceevt_offered_on","custrecord_es_ceevt_provider"]'
  },{
    Record: '3rd_alternative_course',
    Result: NO_RECORDS
  },{
    Record: '3rd_content_hours',
    Result: '["custrecord_3rd_content_hr_course","custrecord_3rd_content_hr_crm_id","custrecord_3rd_content_hr_data_notes","custrecord_3rd_content_hr_edition","custrecord_3rd_content_hr_end_date","custrecord_3rd_content_hr_end_qtr","custrecord_3rd_content_hr_end_sem","custrecord_3rd_content_hr_end_year","custrecord_3rd_content_hr_start_date","custrecord_3rd_content_hr_start_qtr","custrecord_3rd_content_hr_start_sem","custrecord_3rd_content_hr_start_year"]'
  },{
    Record: '3rd_courses',
    Result: '["custrecord_3rd_course_credit_hours","custrecord_3rd_course_credit_level","custrecord_3rd_course_crm_id","custrecord_3rd_course_department","custrecord_3rd_course_institution","custrecord_3rd_course_instruction_mode","custrecord_3rd_course_number","custrecord_3rd_course_reg_course","custrecord_3rd_course_reg_course_combo","custrecord_3rd_course_reg_course_name","custrecord_3rd_course_reg_course_number","custrecord_3rd_course_syllabi_name","custrecord_3rd_course_title"]'
  },{
    Record: '3rd_departments',
    Result: '["custrecord_3rd_depart_crm_id","custrecord_3rd_depart_institution","custrecord_3rd_depart_name","custrecord_3rd_depart_website"]'
  },{
    Record: '3rd_hour_allocations',
    Result: '["custrecord_3rd_hour_alloc_content_hours","custrecord_3rd_hour_alloc_crm_id","custrecord_3rd_hour_alloc_type","custrecord_3rd_hour_alloc_value"]'
  },{
    Record: '3rd_registered_courses',
    Result: '["custrecord_3rd_reg_course_academic_struc","custrecord_3rd_reg_course_approval_level","custrecord_3rd_reg_course_coordinator","custrecord_3rd_reg_course_department","custrecord_3rd_reg_course_institution","custrecord_3rd_reg_course_name","custrecord_3rd_reg_course_seq_crm_id"]'
  },{
    Record: 'altrnte_crseid',
    Result: '["custrecord_alternate_crse_crm_identifier","custrecord_altnte_crse_id_crse","custrecord_altnte_crse_id_type","custrecord_altnte_crse_id_value","custrecord_dt_dissapr_altnt_course","custrecord_prsnt_csv_altn_crse"]'
  },{
    Record: 'ap_waiver',
    Result: '["custrecord_ap_waiver_crm_identifier","custrecord_ap_waiver_end_date","custrecord_ap_waiver_name_id","custrecord_ap_waiver_start_dat","custrecord_ap_waiver_status","custrecord_ap_waiver_type","custrecord_ap_waivr_crse_sequnce","custrecord_dt_dissapr_ap_waiver","custrecord_is_prsnt_ap_waivr"]'
  },{
    Record: 'content_area_hrs_alloc',
    Result: '["custrecord_cnt_area_hrs_allctn_cnt_hrs","custrecord_cnt_area_hrs_allctn_status","custrecord_cnt_area_hrs_allctn_type","custrecord_cnt_area_hrs_allctn_value","custrecord_contnt_area_hrs_alloc_crm_id","custrecord_dt_dissapr_cntnt_ar_hrs_alloc","custrecord_is_prsnt_csv_cntnt_ar_hrs"]'
  },{
    Record: 'content_hours',
    Result: '["custrecord_cnt_hrs_activ_end_date","custrecord_cnt_hrs_activ_end_quar","custrecord_cnt_hrs_activ_end_sem","custrecord_cnt_hrs_activ_end_year","custrecord_cnt_hrs_activ_strt_date","custrecord_cnt_hrs_activ_strt_quar","custrecord_cnt_hrs_activ_strt_sem","custrecord_cnt_hrs_activ_strt_year","custrecord_cnt_hrs_crseseq_crseassignmnt","custrecord_cnt_hrs_status","custrecord_content_hrs_crm_identifier","custrecord_content_hrs_type","custrecord_dt_dissapr_cnt_hrs","custrecord_prsnt_csv_cnt_hrs"]'
  },{
    Record: 'contnt_hrs_type',
    Result: '["custrecord_task_list"]'
  },{
    Record: 'coordinator',
    Result: '["custrecord_coordinator_bacb_id","custrecord_coordinator_cordtr_flag","custrecord_coordinator_crm_identifier","custrecord_coordinator_email","custrecord_coordinatr_first_name","custrecord_coordinatr_last_name","custrecord_coordinatr_middle_name","custrecord_cordntr_non_cerfd_flg","custrecord_cordntr_status","custrecord_dt_dissapr_crdntr","custrecord_prsnt_csv_crdntr"]'
  },{
    Record: 'bacb_course',
    Result: '["custrecord_course_credit_hours","custrecord_course_credit_level","custrecord_course_crm_identifier","custrecord_course_institutn_id","custrecord_course_mode_of_instrctn","custrecord_course_number","custrecord_course_status","custrecord_course_syllabi_name","custrecord_course_title","custrecord_dt_dissapr_crse","custrecord_offers_approved_experience","custrecord_prsnt_csv_crse"]'
  },{
    Record: 'course_sequence',
    Result: '["custrecord_crse_seq_acad_strctre","custrecord_crse_seq_apprvl_level","custrecord_crse_seq_coordintr","custrecord_crse_seq_crs_name","custrecord_crse_seq_departmnt","custrecord_crse_seq_institutn","custrecord_crse_seq_website","custrecord_crse_seqnc_crm_identifier","custrecord_crse_seqnc_edition","custrecord_crse_seqnc_status","custrecord_dt_dissapr_crse_seq","custrecord_prsnt_csv_crse_seq"]'
  },{
    Record: 'crse_seqnc_crse_assignmnt',
    Result: '["custrecord_crse_seq_crse_asign_crse","custrecord_crse_seq_crse_asign_crseseqnc","custrecord_crse_seq_crse_asign_status","custrecord_crse_seqnc_crs_assign_crm_id","custrecord_dt_dissapr_crs_seq_crs_asn","custrecord_prsnt_csv_crse_seq_crs_asn"]'
  },{
    Record: 'institution',
    Result: '["custrecord_bacb_insti_accr_body","custrecord_bacb_insti_cred_sys","custrecord_dt_dissapr_instn","custrecord_flag_new_institution","custrecord_institn_crm_identifier","custrecord_institn_website","custrecord_insttn_credit_sys_othr","custrecord_insttn_name","custrecord_insttn_status","custrecord_prsnt_csv_instn","custrecord_uniq_instn_name"]'
  },{
    Record: 'institution_address',
    Result: '["custrecord_dt_dissapr_instn_addr","custrecord_institutn_addr_crm_id","custrecord_instn_addr_addr_line1","custrecord_instn_addr_addr_line2","custrecord_instn_addr_city","custrecord_instn_addr_country","custrecord_instn_addr_inst_id","custrecord_instn_addr_postal_code","custrecord_instn_addr_state_provnc","custrecord_instn_addr_status","custrecord_prsnt_csv_instn_addr"]'
  },{
    Record: 'abai_int_batch_logger',
    Result: '["custrecord_alt_courseid_fileid","custrecord_apwaiver_fileid","custrecord_cont_hours_fileid","custrecord_cont_hsallocat_fileid","custrecord_coordinaor_fileid","custrecord_course_fileid","custrecord_courseseq_crsass_fileid","custrecord_coursesseq_fileid","custrecord_institue_fileid","custrecord_institueaddr_fileid","custrecord_instructorgrp_fileid"]'
  },{
    Record: 'unique_institution',
    Result: '["custrecord_unique_accrediting_body","custrecord_unique_credit_system","custrecord_unique_credit_system_other","custrecord_unique_crmid","custrecord_unique_name","custrecord_unique_website"]'
  },{
    Record: 'es_ce_event',
    Result: '["custrecord_es_ceevt_discontinued_on","custrecord_es_ceevt_offered_on","custrecord_es_ceevt_provider"]'
  },{
    Record: 'es_ce_instructors',
    Result: NO_RECORDS
  },{
    Record: 'bacb_ace',
    Result: '["custrecord_bacb_ace_addr1","custrecord_bacb_ace_addr2","custrecord_bacb_ace_addr3","custrecord_bacb_ace_app_last","custrecord_bacb_ace_certdate","custrecord_bacb_ace_chkamt","custrecord_bacb_ace_chkdate","custrecord_bacb_ace_chknum","custrecord_bacb_ace_city","custrecord_bacb_ace_coordinator","custrecord_bacb_ace_coordinator_number","custrecord_bacb_ace_country","custrecord_bacb_ace_date_appr_first","custrecord_bacb_ace_date_appr_last","custrecord_bacb_ace_date_certsent","custrecord_bacb_ace_date_rcpt_first","custrecord_bacb_ace_date_rcpt_last","custrecord_bacb_ace_date_renewal","custrecord_bacb_ace_email","custrecord_bacb_ace_firstname","custrecord_bacb_ace_homephone","custrecord_bacb_ace_lastname","custrecord_bacb_ace_middlename","custrecord_bacb_ace_number","custrecord_bacb_ace_orgtype","custrecord_bacb_ace_print","custrecord_bacb_ace_state","custrecord_bacb_ace_supervisiontrain","custrecord_bacb_ace_type","custrecord_bacb_ace_web","custrecord_bacb_ace_webaddress","custrecord_bacb_ace_workphone","custrecord_bacb_ace_zipcode"]'
  },{
    Record: 'ace_provider_application',
    Result: NO_RECORDS
  },{
    Record: 'app_attachments',
    Result: NO_RECORDS
  },{
    Record: 'es_application_coursework',
    Result: '["custrecord_es_apcrs_applicant","custrecord_es_apcrs_application","custrecord_es_apcrs_coursework"]'
  },{
    Record: 'exam_app_degree',
    Result: '["custrecord_exam_app_degree","custrecord_exam_application"]'
  },{
    Record: 'exam_app_experience',
    Result: '["custrecord_exam_app","custrecord_exam_app_experience"]'
  },{
    Record: 'applications',
    Result: '["custrecord_accp_bacb_reglntn_cmplnce","custrecord_accpt_bacb_terms_condtns","custrecord_app_approved","custrecord_app_certification","custrecord_app_certification_type","custrecord_app_experience","custrecord_app_exprnc_time_span","custrecord_app_first_course_start_date","custrecord_app_invoices","custrecord_app_last_course_end_date","custrecord_app_no_other_credentials","custrecord_app_paid","custrecord_app_passed","custrecord_app_payment_status","custrecord_app_total_hrs","custrecord_app_trancrpt","custrecord_application_mail_index","custrecord_application_ship_index","custrecord_ea_competency_assess_met","custrecord_ea_educational_criteria_met","custrecord_ea_post_doct_requirement","custrecord_ea_rbt_training_criteria_met","custrecord_ea_rc_asign_req_attestedtorc","custrecord_ea_rc_assign_req_attestedage","custrecord_ea_rc_assign_req_attestedbgch","custrecord_ea_responsible_criteria_met","custrecord_es_app_applicant","custrecord_es_app_date_submitted","custrecord_es_app_eligibility_end_date","custrecord_es_app_exam_window_expire_dt","custrecord_es_competency_assessment","custrecord_es_rbt_training_competency_as","custrecord_exam_app_approved_date","custrecord_exam_app_crm_unique_id","custrecord_exam_app_crswrk_criteria_met","custrecord_exam_app_deg_criteria_met","custrecord_exam_app_doc_received","custrecord_exam_app_eac_date_received","custrecord_exam_app_eac_err_msg","custrecord_exam_app_eac_status","custrecord_exam_app_earl_passed_crswrk_d","custrecord_exam_app_exam_auth_err_msg","custrecord_exam_app_exam_auth_sent_pears","custrecord_exam_app_exp_criteria_met","custrecord_exam_app_exp_date","custrecord_exam_app_faculty_reseach_met","custrecord_exam_app_final_approval","custrecord_exam_app_status","custrecord_exam_app_type","custrecord_exam_app_vcdc_date_received","custrecord_exam_app_vcdc_status","custrecord_exam_app_vue_notes","custrecord_exam_auth_pearson_auth_id","custrecord_exam_parent_id","custrecord_invstgtn_doc","custrecord_invstn_cleared_legal","custrecord_ivstgtn_rprtd","custrecord_phy_mntl_clrd_legal","custrecord_phy_mntl_doc","custrecord_physcl_mntl_reportd","custrecord_vue_cdd_candidate_id","custrecord_vue_cdd_sent_date","custrecord_vue_ead_sent_date"]'
  },{
    Record: 'attestation_questions',
    Result: '["custrecord_att_question_doc_required","custrecord_att_question_doc_required_on","custrecord_att_question_false_option","custrecord_att_question_true_option","custrecord_att_questions_app_type","custrecord_att_questions_canbefalse","custrecord_att_questions_cert_type","custrecord_att_questions_full_text","custrecord_att_questions_number","custrecord_att_questions_section","custrecord_att_questions_text","custrecord_att_questions_title"]'
  },{
    Record: 'attestations',
    Result: '["custrecord_attestation_answer","custrecord_attestation_application","custrecord_attestation_attest_certif","custrecord_attestation_date_signed","custrecord_attestation_doc_id","custrecord_attestation_question","custrecord_attestation_status","custrecord_attestation_status_date","custrecord_attestations_type"]'
  },{
    Record: 'audit_history',
    Result: '["custrecord_audit_cert_type","custrecord_audit_his_app_type","custrecord_audit_history_type","custrecord_audit_status","custrecord_exam_application_id","custrecord_status_date","custrecord_supervsn_training_id"]'
  },{
    Record: 'authorization_token',
    Result: '["custrecord_authorization_token"]'
  },{
    Record: 'background',
    Result: NO_RECORDS
  },{
    Record: 'box_account_association',
    Result: '["custrecord_box_user_id","custrecord_ns_user_id"]'
  },{
    Record: 'box_folder_collaborations',
    Result: NO_RECORDS
  },{
    Record: 'box_integration_config',
    Result: '["custrecord_box_root_folder_id","custrecord_enterprise_id","custrecord_migrate_to_box_v2","custrecord_upgraded_from_v1"]'
  },{
    Record: 'box_record_folder',
    Result: 'no response??'
  },{
    Record: 'box_record_type_config',
    Result: '["custrecord_create_permission","custrecord_edit_permission","custrecord_full_permission","custrecord_permission_id","custrecord_prefix","custrecord_record_field","custrecord_record_type","custrecord_record_type_enabled","custrecord_record_type_folder_name","custrecord_view_permission"]'
  },{
    Record: 'box_type_folder',
    Result: NO_RECORDS
  },{
    Record: 'cdd',
    Result: '["custrecord_cdd_individual","custrecord_cdd_profile","custrecord_cdd_status"]'
  },{
    Record: 'es_ce_activity',
    Result: '["custrecord_ceact_ace_provider","custrecord_ceact_certification_cycle","custrecord_ceact_course_credit_hr","custrecord_ceact_course_grade","custrecord_ceact_ethics_hours","custrecord_ceact_event_format","custrecord_ceact_general_hours","custrecord_ceact_provider","custrecord_ceact_supervision_hours","custrecord_ceact_title","custrecord_ceact_type","custrecord_es_ceact_course_number","custrecord_es_ceact_end_date","custrecord_es_ceact_start_date"]'
  },{
    Record: 'es_ce_type',
    Result: NO_RECORDS
  },{
    Record: 'certification_cycle',
    Result: '["custrecord_abbrev_formula","custrecord_cert_cyc_cert_type","custrecord_cert_cyc_cert_type_abbrev","custrecord_cert_cyc_cert_type_name","custrecord_cert_cyc_certification","custrecord_cert_cyc_end_date","custrecord_cert_cyc_garbage","custrecord_cert_cyc_isactive","custrecord_cert_cyc_start_date","custrecord_cert_cyc_status","custrecord_cert_cycle_date_mailed","custrecord_cert_cycle_date_printed","custrecord_cert_cycle_doctoral","custrecord_name_formula"]'
  },{
    Record: 'cert_type',
    Result: '["custrecord_cert_type_abbrev","custrecord_cert_type_name"]'
  },{
    Record: 'es_certification',
    Result: '["custrecord_cert_crm_unique_id","custrecord_es_cert_certificant","custrecord_es_cert_certificate_number","custrecord_es_cert_certification_type","custrecord_es_cert_type_name"]'
  },{
    Record: 'competency_assessment',
    Result: NO_RECORDS
  },{
    Record: 'content_hour_alloc_type',
    Result: '["custrecord_content_area_hour_type_abbrev","custrecord_content_area_hour_type_name","custrecord_content_area_hour_type_value"]'
  },{
    Record: 'countries',
    Result: '["custrecord_country_alpha3_code","custrecord_country_code","custrecord_country_dialcode","custrecord_country_disabled","custrecord_country_discount","custrecord_country_enumeration","custrecord_country_name"]'
  },{
    Record: 'es_coursework',
    Result: '["custrecord_coureswork_year_started","custrecord_courseswork_sem_term","custrecord_coursework_application","custrecord_coursework_content_hours","custrecord_coursework_month_started","custrecord_coursework_quarter","custrecord_coursework_semester","custrecord_coursework_status","custrecord_coursework_year"]'
  },{
    Record: 'degree',
    Result: '["custrecord_deg_accredited","custrecord_deg_aligned_with_doc","custrecord_deg_application","custrecord_deg_classification_confirm","custrecord_deg_conferral_date_confirm","custrecord_deg_date_conferred","custrecord_deg_date_trans_recvd","custrecord_deg_diploma","custrecord_deg_equiv_eval_completed_date","custrecord_deg_equiv_eval_submitted_date","custrecord_deg_equivalency_eval","custrecord_deg_fieldofstudy","custrecord_deg_fieldofstudy_eval","custrecord_deg_fieldofstudy_eval_dept","custrecord_deg_major","custrecord_deg_major_confirmed","custrecord_deg_org_src_verif","custrecord_deg_precedence_degree","custrecord_deg_reason_fieldofstudy","custrecord_deg_transcript","custrecord_deg_us_acrredited_equivalent","custrecord_degree_classification","custrecord_degree_customer","custrecord_degree_holder_confirm","custrecord_degree_institution","custrecord_degree_status","custrecord_fieldofstudy_eval_date","custrecord_instn_addr1","custrecord_instn_addr2","custrecord_instn_city","custrecord_instn_cntry","custrecord_instn_pstl_code","custrecord_instn_state_prvnc","custrecord_instn_web_site"]'
  },{
    Record: 'degree_equiv',
    Result: NO_RECORDS
  },{
    Record: 'dad_file',
    Result: INSUFFICIENT_PERMISSIONS
  },{
    Record: 'dad_file_html',
    Result: INSUFFICIENT_PERMISSIONS
  },{
    Record: 'document_type',
    Result: '["custrecord_document_type_code","custrecord_document_type_description"]'
  },{
    Record: 'documents',
    Result: '["custrecord_doc_application","custrecord_doc_attestation","custrecord_doc_case","custrecord_doc_customer","custrecord_doc_date_uploaded","custrecord_doc_date_verified","custrecord_doc_egnyte_id","custrecord_doc_file","custrecord_doc_formula_name","custrecord_doc_infilecabnet","custrecord_doc_locked","custrecord_doc_locked_timestamp","custrecord_doc_lockedby","custrecord_doc_needs_uploaded","custrecord_doc_new_filename","custrecord_doc_orig_filename","custrecord_doc_orig_source_verified","custrecord_doc_type","custrecord_doc_upload_source","custrecord_doc_uploadedby","custrecord_doc_url","custrecord_doc_version"]'
  },{
    Record: 'email_subs',
    Result: NO_RECORDS
  },{
    Record: 'email_template_mapper',
    Result: '["custrecord_temmap_notifcationtype","custrecord_temmap_type","custrecord_tempmap_applicationtype","custrecord_tempmap_context"]'
  },{
    Record: 'entity_status',
    Result: INSUFFICIENT_PERMISSIONS
  },{
    Record: 'exam_result',
    Result: '["custrecord_exam_result_exam_app","custrecord_exam_result_exam_date","custrecord_exam_result_exam_language","custrecord_exam_result_exam_name","custrecord_exam_result_exam_version","custrecord_exam_result_first_retake","custrecord_exam_result_form","custrecord_exam_result_grade","custrecord_exam_result_issued_date","custrecord_exam_result_nda_refused","custrecord_exam_result_no_show","custrecord_exam_result_passing_score","custrecord_exam_result_recert","custrecord_exam_result_released","custrecord_exam_result_renewal","custrecord_exam_result_scaled","custrecord_exam_result_sec_ah","custrecord_exam_result_sec_b","custrecord_exam_result_sec_basic","custrecord_exam_result_sec_cd","custrecord_exam_result_sec_client","custrecord_exam_result_sec_ef","custrecord_exam_result_sec_gi","custrecord_exam_result_sec_j","custrecord_exam_result_sec_k","custrecord_exam_result_series","custrecord_exam_result_skipped","custrecord_exam_result_tcid","custrecord_exam_result_time_used","custrecord_exam_result_unscored","custrecord_exam_result_voucher","custrecord_exam_result_vue_correct","custrecord_exam_result_vue_incorrect"]'
  },{
    Record: 'es_experience',
    Result: '["custrecord_app_cmnt_box","custrecord_es_exp_supervision_hours","custrecord_exp_aligned_evf","custrecord_exp_application","custrecord_exp_fldwrk_hours_present","custrecord_exp_practicum_course","custrecord_exp_practicum_crs_id","custrecord_exp_reasons_invalid","custrecord_exp_representation_type","custrecord_exp_status","custrecord_exp_supervisor_attested_sign","custrecord_exp_type","custrecord_exp_valid","custrecord_expernc_evf_doc","custrecord_exprnc_end_date","custrecord_exprnc_start_date","custrecord_exprnc_total_hrs","custrecord_exprnc_trainee"]'
  },{
    Record: 'experience_supervisor',
    Result: '["custrecord_experience_id","custrecord_primary_supervisor","custrecord_supervisor_id"]'
  },{
    Record: 'exp_type',
    Result: '["custrecord_exptype_hours_multiplier","custrecord_exptype_name"]'
  },{
    Record: 'fee_modifier',
    Result: NO_RECORDS
  },{
    Record: 'fees',
    Result: NO_RECORDS
  },{
    Record: 'fees_assessed',
    Result: NO_RECORDS
  },{
    Record: 'dad_enabled_record_type',
    Result: INSUFFICIENT_PERMISSIONS
  },{
    Record: 'foreign_institutions',
    Result: NO_RECORDS
  },{
    Record: 'hold',
    Result: INSUFFICIENT_PERMISSIONS
  },{
    Record: 'inactivity_period',
    Result: NO_RECORDS
  },{
    Record: 'instructions',
    Result: '["custrecord_instructions_app_type","custrecord_instructions_cert_type","custrecord_instructions_text","custrecord_instructions_title"]'
  },{
    Record: 'instrctr_group',
    Result: NO_RECORDS
  },{
    Record: 'lsa',
    Result: '["custrecord_date_lsa","custrecord_entity_opp_id_lsa","custrecord_link_lsa","custrecord_link_name_lsa","custrecord_mode_lsa"]'
  },{
    Record: 'news',
    Result: '["custrecord_news_abstract","custrecord_news_date_expired","custrecord_news_date_posted","custrecord_news_full_text","custrecord_news_title"]'
  },{
    Record: 'non_bacb_prof_credential',
    Result: '["custrecord_non_bacb_cred_country","custrecord_non_bacb_cred_customer","custrecord_non_bacb_cred_number","custrecord_non_bacb_cred_state","custrecord_non_bacb_cred_state_code","custrecord_non_bacb_cred_title","custrecord_non_bacb_cred_type","custrecord_non_bacb_cred_type_othe","custrecord_non_bacb_cred_year"]'
  },{
    Record: 'notification',
    Result: '["custrecord_is_read","custrecord_notif_email_internal_id","custrecord_notification_type","custrecord_notification_user"]'
  },{
    Record: 'notification_type',
    Result: '["custrecord_notification_type_email_templ","custrecord_notification_type_sender"]'
  },{
    Record: 'pearson_vue_log',
    Result: '["custrecord_pvl_application","custrecord_pvl_client_candidate_id","custrecord_pvl_date_received","custrecord_pvl_eac_authorization_id","custrecord_pvl_file_sent_date","custrecord_pvl_file_type","custrecord_pvl_message","custrecord_pvl_status","custrecord_pvl_vcdc_candidate_id"]'
  },{
    Record: 'prof_assc_membership',
    Result: NO_RECORDS
  },{
    Record: 'profile',
    Result: '["custrecord_crm_contact_unique_identifier","custrecord_customer","custrecord_licensed_psychologist","custrecord_primary_phone_country_code","custrecord_profile_addr_native_lang","custrecord_profile_ages_client","custrecord_profile_bacb_id","custrecord_profile_billing_addr","custrecord_profile_billing_same_physical","custrecord_profile_birth_date","custrecord_profile_ethnity","custrecord_profile_ethnity_other","custrecord_profile_firstname_native_lang","custrecord_profile_gender","custrecord_profile_gender_other","custrecord_profile_info_release","custrecord_profile_is_onboard","custrecord_profile_lastname_native_lang","custrecord_profile_middlename_native_lan","custrecord_profile_pearson_id","custrecord_profile_physical_address","custrecord_profile_prefix","custrecord_profile_primary_area_other","custrecord_profile_primary_area_prof_emp","custrecord_profile_primary_ext","custrecord_profile_primary_role","custrecord_profile_secondary_area_other","custrecord_profile_secondary_area_prof","custrecord_profile_secondary_ext","custrecord_profile_secondary_role","custrecord_profile_suffix","custrecord_profile_tertiary_area_prof","custrecord_profile_user_acct_activated","custrecord_resend_acct_activation_email","custrecord_secondary_phone_country_code","custrecord_vcs_non_bacb_cert_instructor"]'
  },{
    Record: 'rc_alternative_course',
    Result: '["custrecord_alternatecrse_crm_id","custrecord_rc_alt_course_course","custrecord_rc_alt_course_type","custrecord_rc_alt_course_value"]'
  },{
    Record: 'rc_contact',
    Result: NO_RECORDS
  },{
    Record: 'rc_contact_link',
    Result: NO_RECORDS
  },{
    Record: 'rc_hour_allocation',
    Result: '["custrecord_cntn_alloc_type_cncpts_prncps","custrecord_cntn_alloc_type_msrnt_data_d","custrecord_cntn_alloc_type_phl_cncpts_pr","custrecord_cntn_alloc_type_phl_undrpn","custrecord_cntn_alloc_type_prsnl_spr","custrecord_rc_cntn_alloc_type_beh_assmnt","custrecord_rc_cntn_alloc_type_beh_chnge","custrecord_rc_cntn_hrs_alloc_type_a1","custrecord_rc_cntn_hrs_alloc_type_b1","custrecord_rc_cntn_hrs_alloc_type_c1","custrecord_rc_cntn_hrs_alloc_type_c2","custrecord_rc_cntn_hrs_alloc_type_d1","custrecord_rc_cntn_hrs_alloc_type_d2","custrecord_rc_cntn_hrs_alloc_type_d3","custrecord_rc_cntn_hrs_alloc_type_d4","custrecord_rc_cntn_hrs_alloc_type_d5","custrecord_rc_cntn_hrs_alloc_type_e1","custrecord_rc_cntn_hrs_type_bacb_comp","custrecord_rc_cntntarea_hrs_alloc_crm_id","custrecord_rc_hr_alloc_content_hours","custrecord_rc_hr_alloc_type","custrecord_rc_hr_alloc_value"]'
  },{
    Record: 'rc_content_hours',
    Result: '["custrecord_data_discpncy_cnt_hrs","custrecord_rc_cnthrs_crm_id","custrecord_rc_content_hr_course","custrecord_rc_content_hr_edition","custrecord_rc_content_hr_end_date","custrecord_rc_content_hr_end_qtr","custrecord_rc_content_hr_end_sem","custrecord_rc_content_hr_end_year","custrecord_rc_content_hr_start_date","custrecord_rc_content_hr_start_qtr","custrecord_rc_content_hr_start_sem","custrecord_rc_content_hr_start_year","custrecord_rc_content_hr_status"]'
  },{
    Record: 'rc_content_hrs_alloc_type',
    Result: NO_RECORDS
  },{
    Record: 'rc_coordinator',
    Result: '["custrecord_rc_coord_bacb_id","custrecord_rc_coord_email","custrecord_rc_coord_first_name","custrecord_rc_coord_last_name","custrecord_rc_coord_middle_name","custrecord_rc_coord_non_certified_inst","custrecord_rc_coord_phone","custrecord_rc_crdntr_crm_id"]'
  },{
    Record: 'rc_course',
    Result: '["custrecord_dt_exp_rc_crse","custrecord_rc_course_credit_hours","custrecord_rc_course_credit_level","custrecord_rc_course_department","custrecord_rc_course_institution","custrecord_rc_course_instruction_mode","custrecord_rc_course_number","custrecord_rc_course_reg_course","custrecord_rc_course_syllabi_name","custrecord_rc_course_title","custrecord_rc_course_title_on_transcript","custrecord_rc_crse_crm_id","custrecord_rc_regstrd_type","custrecord_rc_rgstrd_crse_name","custrecord_rc_rgstrd_num"]'
  },{
    Record: 'rc_department',
    Result: '["custrecord_rc_depart_institution","custrecord_rc_depart_name","custrecord_rc_depart_website","custrecord_rc_dept_contact","custrecord_rc_dept_institution_name"]'
  },{
    Record: 'rc_final_data_record',
    Result: '["custrecord_data_discrpncy_final_dta","custrecord_rc_cnt_alloc_b1","custrecord_rc_cnt_alloc_c2","custrecord_rc_cnthrs_editn","custrecord_rc_cnthrs_end_dat","custrecord_rc_cnthrs_end_sem","custrecord_rc_cnthrs_end_yr","custrecord_rc_cnthrs_strt_dat","custrecord_rc_cnthrs_strt_qurtr","custrecord_rc_cnthrs_strt_sem","custrecord_rc_cnthrs_strt_yr","custrecord_rc_cntn_alloc_type_5a","custrecord_rc_cntn_alloc_type_5b","custrecord_rc_cntn_alloc_type_5c","custrecord_rc_cntn_alloc_type_5d","custrecord_rc_cntn_alloc_type_5e","custrecord_rc_cntn_alloc_type_5f","custrecord_rc_cntn_alloc_type_5g","custrecord_rc_cntn_alloc_type_5h","custrecord_rc_cntn_alloc_type_c1","custrecord_rc_cntn_alloc_type_d1","custrecord_rc_cntn_alloc_type_d2","custrecord_rc_cntn_alloc_type_d3","custrecord_rc_cntn_alloc_type_d4","custrecord_rc_cntn_alloc_type_d5","custrecord_rc_cntn_alloc_type_e1","custrecord_rc_cntn_hours","custrecord_rc_cntnthrs_end_qtr","custrecord_rc_crse_cdt_hrs","custrecord_rc_crse_cdt_lvl","custrecord_rc_crse_numbr","custrecord_rc_crse_title","custrecord_rc_final_data_course_name","custrecord_rc_reg_crse_insttn","custrecord_rc_regcrs_deparmnt","custrecord_rc_rgs_typ_fnl","custrecord_rc_rgsd_numbr","custrecord_third_edition_cr_number"]'
  },{
    Record: 'rc_institution',
    Result: '["custrecord_rc_date_instn_dissprd","custrecord_rc_inst_accrediting_body","custrecord_rc_inst_addresses","custrecord_rc_inst_approved","custrecord_rc_inst_credit_sys_other","custrecord_rc_inst_credit_system","custrecord_rc_inst_name","custrecord_rc_inst_requested_by","custrecord_rc_inst_website","custrecord_rc_instn_rm_id"]'
  },{
    Record: 'rc_inst_address',
    Result: '["custrecord_rc_inst_add_address1","custrecord_rc_inst_add_address2","custrecord_rc_inst_add_city","custrecord_rc_inst_add_country","custrecord_rc_inst_add_inst","custrecord_rc_inst_add_postal_code","custrecord_rc_inst_add_state","custrecord_rc_inst_addr_crm_id"]'
  },{
    Record: 'rc_registered_courses',
    Result: '["custrecord_rc_crse_seq_crm_id","custrecord_rc_reg_course_academic_struct","custrecord_rc_reg_course_approval_level","custrecord_rc_reg_course_coordinator","custrecord_rc_reg_course_department","custrecord_rc_reg_course_dept_name","custrecord_rc_reg_course_name","custrecord_rc_reg_course_type","custrecord_rc_regstd_crse_inst_name"]'
  },{
    Record: 'supervision',
    Result: '["custrecord_supervision_end_date","custrecord_supervision_inactive_reason","custrecord_supervision_reason","custrecord_supervision_reason_other","custrecord_supervision_start_date","custrecord_supervision_status","custrecord_supervision_supervisee","custrecord_supervision_supervisor","custrecord_supervision_type"]'
  },{
    Record: 'suprvsn_asgnmnt',
    Result: '["custrecord_super_asgmnt_enddate","custrecord_super_asgmnt_reason_rem_super","custrecord_super_asgmnt_startdate","custrecord_super_asgmnt_super_inact_othe","custrecord_super_asgmnt_supervisee","custrecord_super_asgmnt_supervisor","custrecord_super_asgmnt_supervisor_inact","custrecord_super_asgmnt_type","custrecord_supervsn_assgnmnt_status"]'
  },{
    Record: 'supervision_eligibility_prd',
    Result: NO_RECORDS
  },{
    Record: 'task_list',
    Result: '[]'
  },{
    Record: 'training',
    Result: '["custrecord_training_agency","custrecord_training_completion_date","custrecord_training_confirmed","custrecord_training_doc","custrecord_training_instructor","custrecord_training_start_date","custrecord_training_trainee","custrecord_training_type"]'
  },{
    Record: 'variables',
    Result: NO_RECORDS
  },{
    Record: 'watch',
    Result: '["custrecord_watch_active","custrecord_watch_individual","custrecord_watch_owner"]'
  }]
}

const TestAccommodations: IUnitTestGroup = {
  Header: 'Accommodations Tests', Description: 'Test Examination accommodations', Script: 'Accommodations',
  Tests: [{
    Parameter: 'Read',
    ResponseObject: CONFIRM_SUCCESS,
    PUT: {AppId: '1'}
  }, {
    Parameter: 'Test',
    ResponseObject: ["custrecord_accommodation_additional_time","custrecord_accommodation_adjustable_desk","custrecord_accommodation_application","custrecord_accommodation_double_time","custrecord_accommodation_large_font","custrecord_accommodation_other","custrecord_accommodation_reader","custrecord_accommodation_scribe","custrecord_accommodation_separate_room","custrecord_accommodation_sign_language","custrecord_accommodation_time_and_a_half"]
  }]
}
const TestActionItem: IUnitTestGroup = {
  Header: 'ActionItem Tests', Description: 'Checks that action items are fully validated', Script: 'ActionItem',
  Tests: [{
    Parameter: 'ReadActionItem', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestApplication: IUnitTestGroup = {
  Header: 'Application Tests', Description: 'checks for applications if they exist, fails otherwise', Script: 'Applications',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject:["custrecord_accp_bacb_reglntn_cmplnce","custrecord_accpt_bacb_terms_condtns","custrecord_app_approved","custrecord_app_certification","custrecord_app_certification_type","custrecord_app_experience","custrecord_app_exprnc_time_span","custrecord_app_first_course_start_date","custrecord_app_invoices","custrecord_app_last_course_end_date","custrecord_app_no_other_credentials","custrecord_app_paid","custrecord_app_passed","custrecord_app_payment_status","custrecord_app_total_hrs","custrecord_app_trancrpt","custrecord_application_mail_index","custrecord_application_ship_index","custrecord_ea_competency_assess_met","custrecord_ea_educational_criteria_met","custrecord_ea_post_doct_requirement","custrecord_ea_rbt_training_criteria_met","custrecord_ea_rc_asign_req_attestedtorc","custrecord_ea_rc_assign_req_attestedage","custrecord_ea_rc_assign_req_attestedbgch","custrecord_ea_responsible_criteria_met","custrecord_es_app_applicant","custrecord_es_app_date_submitted","custrecord_es_app_eligibility_end_date","custrecord_es_app_exam_window_expire_dt","custrecord_es_competency_assessment","custrecord_es_rbt_training_competency_as","custrecord_exam_app_approved_date","custrecord_exam_app_crm_unique_id","custrecord_exam_app_crswrk_criteria_met","custrecord_exam_app_deg_criteria_met","custrecord_exam_app_doc_received","custrecord_exam_app_eac_date_received","custrecord_exam_app_eac_err_msg","custrecord_exam_app_eac_status","custrecord_exam_app_earl_passed_crswrk_d","custrecord_exam_app_exam_auth_err_msg","custrecord_exam_app_exam_auth_sent_pears","custrecord_exam_app_exp_criteria_met","custrecord_exam_app_exp_date","custrecord_exam_app_faculty_reseach_met","custrecord_exam_app_final_approval","custrecord_exam_app_status","custrecord_exam_app_type","custrecord_exam_app_vcdc_date_received","custrecord_exam_app_vcdc_status","custrecord_exam_app_vue_notes","custrecord_exam_auth_pearson_auth_id","custrecord_exam_parent_id","custrecord_invstgtn_doc","custrecord_invstn_cleared_legal","custrecord_ivstgtn_rprtd","custrecord_phy_mntl_clrd_legal","custrecord_phy_mntl_doc","custrecord_physcl_mntl_reportd","custrecord_vue_cdd_candidate_id","custrecord_vue_cdd_sent_date","custrecord_vue_ead_sent_date"]
  }]
}
const TestAttestation: IUnitTestGroup = {
  Header: 'Attestation Tests', Description: 'Checks attestations from a given application if they exist', Script: 'Attestation',
  Tests: [{
    Parameter: 'ReadAnswer', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadQuestion', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: ["custrecord_attestation_answer","custrecord_attestation_application","custrecord_attestation_attest_certif","custrecord_attestation_date_signed","custrecord_attestation_doc_id","custrecord_attestation_question","custrecord_attestation_status","custrecord_attestation_status_date","custrecord_attestations_type"]
  }]
}
const TestBackgroundCheck: IUnitTestGroup = {
  Header: 'BackgroundCheck Tests', Description: 'later', Script: 'BackgroundCheck',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}


const TestCertifications: IUnitTestGroup = {
  Header: 'Certification Tests', Description: 'later', Script: 'Certifications',
  Tests: [{
    Parameter: 'ReadAll', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: ["custrecord_cert_crm_unique_id","custrecord_es_cert_certificant","custrecord_es_cert_certificate_number","custrecord_es_cert_certification_type","custrecord_es_cert_type_name"]
  }]
}

const TestCompetency: IUnitTestGroup = {
  Header: 'Competency Tests', Description: 'later', Script: 'Competency',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'GetSkillList', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestContacts: IUnitTestGroup = {
  Header: 'Contacts Tests', Description: 'later', Script: 'Contacts',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadContactLink', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestContentHours: IUnitTestGroup = {
  Header: 'Content Hours Tests', Description: 'later', Script: 'ContentHours',
  Tests: [{
    Parameter: 'ReadContentHour', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadAllocationHours', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: ["custrecord_cntn_alloc_type_cncpts_prncps","custrecord_cntn_alloc_type_msrnt_data_d","custrecord_cntn_alloc_type_phl_cncpts_pr","custrecord_cntn_alloc_type_phl_undrpn","custrecord_cntn_alloc_type_prsnl_spr","custrecord_rc_cntn_alloc_type_beh_assmnt","custrecord_rc_cntn_alloc_type_beh_chnge","custrecord_rc_cntn_hrs_alloc_type_a1","custrecord_rc_cntn_hrs_alloc_type_b1","custrecord_rc_cntn_hrs_alloc_type_c1","custrecord_rc_cntn_hrs_alloc_type_c2","custrecord_rc_cntn_hrs_alloc_type_d1","custrecord_rc_cntn_hrs_alloc_type_d2","custrecord_rc_cntn_hrs_alloc_type_d3","custrecord_rc_cntn_hrs_alloc_type_d4","custrecord_rc_cntn_hrs_alloc_type_d5","custrecord_rc_cntn_hrs_alloc_type_e1","custrecord_rc_cntn_hrs_type_bacb_comp","custrecord_rc_cntntarea_hrs_alloc_crm_id","custrecord_rc_hr_alloc_content_hours","custrecord_rc_hr_alloc_type","custrecord_rc_hr_alloc_value"]
  }]
}

const TestContinuingEducation: IUnitTestGroup = {
  Header: 'Continuing Education Tests', Description: 'later', Script: 'ContinuingEducation',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestCourses: IUnitTestGroup = {
  Header: 'Courses Tests', Description: 'later', Script: 'Courses',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestCourseSequences: IUnitTestGroup = {
  Header: 'Course Sequence Tests', Description: 'later', Script: 'CourseSequences',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestCoursework: IUnitTestGroup = {
  Header: 'Coursework Tests', Description: 'later', Script: 'Coursework',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestDegreeInfo: IUnitTestGroup = {
  Header: 'DegreeInfo Tests', Description: 'later', Script: 'DegreeInfo',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestDeparments: IUnitTestGroup = {
  Header: 'Departments Tests', Description: 'later', Script: 'Departments',
  Tests: [{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestExperience: IUnitTestGroup = {
  Header: 'BackgroundCheck Tests', Description: 'later', Script: 'BackgroundCheck',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'GetType', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestExperienceSupervisor: IUnitTestGroup = {
  Header: 'ExperienceSupervisor Tests', Description: 'later', Script: 'ExperienceSupervisor',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestFileMgmt: IUnitTestGroup = {
  Header: 'File Management Tests', Description: 'later', Script: 'FileMgmt',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Egnyte', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'TestRESTlet', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestInstitution: IUnitTestGroup = {
  Header: 'Institution Tests', Description: 'later', Script: 'Institutions',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestInvoices: IUnitTestGroup = {
  Header: 'Invoices Tests', Description: 'later', Script: 'Invoices',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestMarketingOptions: IUnitTestGroup = {
  Header: 'Marketing Options Tests', Description: 'later', Script: 'MarketingOptions',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestNews: IUnitTestGroup = {
  Header: 'News Tests', Description: 'later', Script: 'News',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestOtherCredentials: IUnitTestGroup = {
  Header: 'Other Credentials Tests', Description: 'later', Script: 'OtherCredentials',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadBypass', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestPayment: IUnitTestGroup = {
  Header: 'Payment Tests', Description: 'later', Script: 'Payment',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestPersonalInfo: IUnitTestGroup = {
  Header: 'Personal Info Tests', Description: 'later', Script: 'PersonalInfo',
  Tests: [{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadNameChanges', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Load', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestProfessionalInfo: IUnitTestGroup = {
  Header: 'Professional Info Tests', Description: 'later', Script: 'ProfessionalInfo',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestProfileInfo: IUnitTestGroup = {
  Header: 'Profile Information Tests', Description: 'later', Script: 'ProfileInfo',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestQuestions: IUnitTestGroup = {
  Header: 'Questions Tests', Description: 'later', Script: 'Questions',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestRegisteredCourses: IUnitTestGroup = {
  Header: 'Registered Courses Tests', Description: 'later', Script: 'RegisteredCourses',
  Tests: [{
    Parameter: 'GetContentAreaHoursAllocationMetaData', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'GetContactDepartmentsAndInstitutionNames', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadActionItem', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}
const TestSupervision: IUnitTestGroup = {
  Header: 'Supervision Tests', Description: 'later', Script: 'Supervision',
  Tests: [{
    Parameter: 'ReadSupervisors', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReadSupervisees', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'ReasonsForRemoval', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestTraining: IUnitTestGroup = {
  Header: 'Training Tests', Description: 'later', Script: 'Training',
  Tests: [{
    Parameter: 'Read', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Get', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Check', ResponseObject: CONFIRM_SUCCESS
  },{
    Parameter: 'Test', ResponseObject: CONFIRM_SUCCESS
  }]
}

const TestUtility: IUnitTestGroup = {
  Header: 'Utility Tests', Description: 'later', Script: 'Utility',
  Tests: [{
    Parameter: 'GetAll', ResponseObject: CONFIRM_SUCCESS
  }]
}
