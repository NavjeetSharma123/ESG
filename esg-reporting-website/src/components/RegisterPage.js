import React, { useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { isAuthenticated, login, register } from '../utils/auth';
import './LoginPage.css';

const initialForm = {
  organization_name: '', industry: '', sector: '', company_type: '', website: '',
  registration_number: '', gst_number: '', cin_number: '', country: '', state: '', city: '',
  employee_count: '', annual_revenue: '', first_name: '', last_name: '', designation: '',
  email: '', password: '', confirmPassword: '',
};

const Field = ({ label, name, value, onChange, type = 'text', required = false, ...props }) => (
  <div className="register-field">
    <label htmlFor={name}>{label}{required ? ' *' : ''}</label>
    <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} {...props} />
  </div>
);

const RegisterPage = () => {
  const history = useHistory();
  const [form, setForm] = useState(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (isAuthenticated()) return <Redirect to="/profile" />;

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleTermsChange = (event) => {
    setAcceptedTerms(event.target.checked);
    setError('');
//    if (event.target.checked) setShowTerms(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!form.cin_number.trim()) return setError('CIN number is required to create your Documents folder.');
    if (!acceptedTerms) return setError('Please accept the Terms and Conditions to register.');
    setSending(true);
    try {
      const timestamp = new Date().toISOString();
      const user = await register({
        ...form,
        organization_name: form.organization_name,
        first_name: form.first_name,
        password_hash: form.password,
        email_verified: false,
        organization_verified: false,
        verification_token: null,
        verification_token_expiry: null,
        role: 'organization_admin',
        report_generation_count: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });
      await login(user.email, form.password);
      history.replace('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return <main className="login-page"><section className="login-panel register-panel"><span className="login-kicker">Create your workspace</span><h1>Register</h1><p>Provide your organisation and account details to create your workspace.</p><form className="login-form" onSubmit={handleSubmit}>
    <fieldset className="register-section"><legend>Organisation details</legend><div className="register-grid">
      <Field label="Organisation name" name="organization_name" value={form.organization_name} onChange={change} required />
      <Field label="Industry" name="industry" value={form.industry} onChange={change} required />
      <Field label="Sector" name="sector" value={form.sector} onChange={change} required />
      <Field label="Company type" name="company_type" value={form.company_type} onChange={change} required />
      <Field label="Website" name="website" type="url" value={form.website} onChange={change} placeholder="https://example.com" />
      <Field label="Registration number" name="registration_number" value={form.registration_number} onChange={change} />
      <Field label="GST number" name="gst_number" value={form.gst_number} onChange={change} />
      <Field label="CIN number" name="cin_number" value={form.cin_number} onChange={change} required />
      <Field label="Employee count" name="employee_count" type="number" min="0" value={form.employee_count} onChange={change} />
      <Field label="Annual revenue" name="annual_revenue" type="number" min="0" value={form.annual_revenue} onChange={change} />
    </div></fieldset>
    <fieldset className="register-section"><legend>Location</legend><div className="register-grid">
      <Field label="Country" name="country" value={form.country} onChange={change} required />
      <Field label="State" name="state" value={form.state} onChange={change} required />
      <Field label="City" name="city" value={form.city} onChange={change} required />
    </div></fieldset>
    <fieldset className="register-section"><legend>Account contact</legend><div className="register-grid">
      <Field label="First name" name="first_name" value={form.first_name} onChange={change} required />
      <Field label="Last name" name="last_name" value={form.last_name} onChange={change} required />
      <Field label="Designation" name="designation" value={form.designation} onChange={change} required />
      <Field label="Work email" name="email" type="email" value={form.email} onChange={change} required />
      <Field label="Password" name="password" type="password" value={form.password} onChange={change} minLength="8" required />
      <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} required />
    </div></fieldset>
    <label className="terms-checkbox" htmlFor="tnc">
      <input type="checkbox" id="tnc" name="tnc" checked={acceptedTerms} onChange={handleTermsChange} required />
      <span>I agree to the <button type="button" style={{background:"white", color:"black"}} className="terms-link" onClick={() => setShowTerms(true)}>Terms and Conditions</button>.</span>
    </label>
    {message ? <div className="login-success" role="status">{message}</div> : null}{error ? <div className="login-error" role="alert">{error}</div> : null}<button type="submit" disabled={sending}>{sending ? 'Registering...' : 'Register'}</button>
  </form>
  <p className="login-switch">Already registered? <Link to="/login">Sign in</Link></p></section>

  {showTerms ? <div className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
    <div className="terms-modal__content">
      <button type="button" className="terms-modal__close" aria-label="Close Terms and Conditions" onClick={() => setShowTerms(false)}>×</button>
      <h2 id="terms-title">Terms and Conditions</h2>
      <div className="terms-modal__body">
      <br></br>[Platform / Product Name]
      <br></br>Operated by:
<br></br>[Company Legal Name]
<br></br>[Registered Office Address]
<br></br>([Company Registration / CIN Number])
<br></br>Last Updated / Effective Date: [DD Month YYYY]
<br></br>These Terms and Conditions ("Terms", "Agreement") constitute a legally binding agreement between the entity or individual accessing or using the platform ("Customer", "Organization", "User", "you", "your") and [Company Legal Name], a company incorporated under the laws of [Country/State of Incorporation], having its registered office at [Registered Office Address] ("Company", "we", "us", "our"), governing your access to and use of the [Platform Name] ESG data management, questionnaire, reporting, benchmarking, and analytics platform, together with all related websites, applications, APIs, dashboards, and services (collectively, the "Platform" or "Services").
<br></br>Please read these Terms carefully. They contain important disclaimers regarding the informational nature of ESG reports, scores, benchmarks, and AI-generated recommendations, and limitations on liability. By accessing, registering for, or using the Platform, you agree to be bound by these Terms and by our Privacy Policy, which is incorporated herein by reference.
<br></br>1. Acceptance of Terms
<br></br>1.1  By creating an account, clicking "I Accept", or otherwise accessing or using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines, order forms, or annexures referenced herein.
<br></br>1.2  If you are entering into this Agreement on behalf of a company, institution, or other legal entity, you represent and warrant that you have the authority to bind that entity, in which case "you" and "Customer" refer to that entity.
<br></br>1.3  If you do not agree to these Terms in their entirety, you must not access or use the Platform.
<br></br>1.4  These Terms apply in addition to, and not in lieu of, any separately executed Master Services Agreement, Order Form, or Enterprise Agreement between you and the Company. In the event of a conflict, the terms of such separately executed agreement shall prevail to the extent of the conflict.
<br></br>2. Definitions
<br></br>Unless the context otherwise requires, the following terms shall have the meanings set out below:
<br></br>(a) "Account" means the unique registration created by a User to access the Platform.
<br></br>(b) "AI Recommendations" means suggestions, insights, action points, risk flags, or narrative content generated by artificial intelligence or machine learning models within the Platform based on User Content.
<br></br>(c) "Benchmarking Data" means comparative or aggregated/anonymized ESG performance data used to generate peer comparison outputs.
<br></br>(d) "Documents" means any files, evidence, certificates, policies, or records uploaded by a User to support responses to ESG Questionnaires.
<br></br>(e) "ESG Frameworks" means globally recognized ESG disclosure and reporting standards supported by the Platform, including but not limited to GRI, BRSR, SASB, IFRS S1/S2, TCFD, and UNGC, as updated from time to time.
<br></br>(f) "ESG Report" means any report, scorecard, dashboard export, or PDF output generated by the Platform based on User Content and/or Questionnaire responses.
<br></br>(g) "Questionnaire" means the structured set of ESG disclosure questions made available on the Platform corresponding to one or more ESG Frameworks.
<br></br>(h) "Sample Report" means the illustrative, non-customer-specific ESG report made available on the Platform for review prior to purchase.
<br></br>(i) "Subscription" means the paid or trial plan under which a User is granted access to the Platform.
<br></br>(j) "User Content" means all data, responses, Documents, text, files, and other information that a User inputs, uploads, or submits to the Platform.
<br></br>(k) "Applicable Data Protection Laws" means all applicable laws relating to privacy and the processing of personal data, including the EU/UK General Data Protection Regulation ("GDPR"), India's Digital Personal Data Protection Act, 2023 ("DPDP Act"), and any other applicable state, national, or regional data protection legislation.
<br></br>3. Eligibility
<br></br>3.1  The Platform is intended for business and institutional use. By registering, you represent that you are at least 18 years of age and have the legal capacity to enter into binding contracts.
<br></br>3.2  You represent that your use of the Platform, and the Organization's use of the Platform, complies with all applicable laws, including export control, anti-corruption, and sanctions laws in your jurisdiction and ours.
<br></br>3.3  The Company reserves the right to refuse registration or terminate access to any individual or entity at its sole discretion, including where required for legal or regulatory compliance.
<br></br>4. Account Registration
<br></br>4.1  To use the Platform, you must create an Account by providing accurate, current, and complete information, including organizational details and an authorized administrator's contact information.
<br></br>4.2  You are responsible for maintaining the confidentiality of your Account credentials and for all activities that occur under your Account, whether or not authorized by you.
<br></br>4.3  You must notify the Company immediately of any unauthorized use of your Account or any other breach of security.
<br></br>4.4  Organizations may create multiple user roles (e.g., Administrator, Contributor, Reviewer, Viewer) with differing levels of access. The Organization's Administrator is solely responsible for assigning roles and permissions, and for the actions of all individuals granted access under its Account.
<br></br>4.5  The Company is not liable for any loss or damage arising from your failure to comply with this Section 4.
<br></br>5. Subscription Plans, Billing, Renewal, Cancellation & Refund Policy
<br></br>5.1  The Platform is offered under various subscription tiers (e.g., trial, standard, professional, enterprise), each with defined features, user seats, Questionnaire access, report generation limits, and support levels, as described on the Platform or in an applicable Order Form.
<br></br>5.2  Fees are exclusive of applicable taxes, duties, and levies (including GST, VAT, or withholding tax) unless expressly stated otherwise, which shall be borne by the Customer.
<br></br>5.3  Subscriptions automatically renew for successive terms equal to the initial term unless either party provides written notice of non-renewal at least [Number] days prior to the renewal date, or as otherwise specified in an Order Form.
<br></br>5.4  Cancellation may be initiated by the Customer through the Platform's account settings or by written notice to the Company. Cancellation will take effect at the end of the then-current billing cycle unless otherwise agreed in writing. No pro-rata refund shall be provided for the unused portion of a billing cycle unless expressly required by applicable law.
<br></br>5.5  Sample Report Review Prior to Purchase. The Company makes available a Sample Report on the Platform illustrating the Questionnaire requirements, report structure, disclosures, methodology, and expected outputs for the relevant ESG Framework(s). Users are strongly encouraged to review the Sample Report before purchasing any Subscription or report-generation service. By making payment, the User acknowledges and agrees that it has had a reasonable opportunity to review the Sample Report and accepts the format, structure, methodology, and nature of the deliverables generated by the Platform.
<br></br>5.6  Refund Policy. Except as expressly set out in an applicable Order Form or as mandated by applicable consumer protection law, all fees are non-refundable. Without limiting the foregoing:
<br></br>(a) Dissatisfaction with the format, layout, structure, or presentation of a generated ESG Report, where such format was represented in the Sample Report, shall not, by itself, entitle the User to a refund.
<br></br>(b) No refund shall be issued for reports already generated, downloaded, or made available for download, save where such report was demonstrably not generated due to a verified technical fault attributable solely to the Company.
<br></br>(c) Refund requests must be submitted in writing to [Billing Support Email] within [Number] days of the relevant charge and are subject to the Company's review and approval.
<br></br>5.7  The Company reserves the right to modify subscription fees prospectively upon at least [Number] days' prior written notice. Continued use of the Platform after the effective date of a fee change constitutes acceptance of the revised fees.
<br></br>5.8  Failure to pay undisputed fees when due may result in suspension or termination of access in accordance with Section 21 (Suspension & Termination).
<br></br>6. Scope of Services
<br></br>6.1  Subject to these Terms and an active Subscription, the Company grants the Customer a non-exclusive, non-transferable, revocable right to access and use the Platform for its internal business purposes, including to:
<br></br>(a) Complete structured ESG Questionnaires aligned to selected ESG Frameworks (including GRI, BRSR, SASB, IFRS S1/S2, TCFD, and UNGC);
<br></br>(b) Upload supporting Documents as evidence for Questionnaire responses;
<br></br>(c) Generate ESG Reports, scorecards, and downloadable PDF outputs based on submitted data;
<br></br>(d) Access peer benchmarking outputs generated from aggregated and/or anonymized data;
<br></br>(e) Receive AI-generated recommendations and insights;
<br></br>(f) Collaborate with internal and permitted external team members through role-based access; and
<br></br>(g) View dashboards summarizing ESG performance and progress over time.
<br></br>6.2  The Company may modify, enhance, deprecate, or discontinue features of the Platform from time to time, provided that no such change shall materially reduce the core functionality of a paid Subscription during its then-current term without reasonable notice.
<br></br>6.3  The Platform is a software tool that processes and structures information provided by Users. The Platform does not independently investigate, audit, or verify the truth, accuracy, or completeness of any information submitted by Users, except to the limited extent expressly described in Section 12 (Document Upload & Verification).
<br></br>7. User Responsibilities
<br></br>7.1  Accuracy of Information. The Organization and its authorized Users are solely and entirely responsible for the accuracy, completeness, authenticity, currency, and legality of all information, Questionnaire responses, and Documents submitted to the Platform. The Company assumes no responsibility for verifying the substantive correctness of such information.
<br></br>7.2  Users shall ensure that all individuals granted access under the Organization's Account are authorized, appropriately trained, and comply with these Terms.
<br></br>7.3  Users shall promptly update information submitted to the Platform where it becomes inaccurate, outdated, or incomplete, particularly where such information forms the basis of a generated ESG Report.
<br></br>7.4  Users shall maintain their own records and back-up copies of source Documents and data submitted to the Platform, in addition to relying on the Platform's storage.
<br></br>7.5  Users shall not use the Platform to submit any information that is fraudulent, misleading, or that the User knows or reasonably ought to know is false, or to misrepresent the Organization's ESG performance, practices, or credentials.
<br></br>7.6  The Organization shall be responsible for obtaining any internal approvals, sign-offs, or board-level authorizations required before submitting information or publishing any ESG Report externally.
<br></br>8. Data Ownership
<br></br>8.1  Customer Ownership. As between the Company and the Customer, the Customer retains all right, title, and interest in and to all User Content, including uploaded Documents, Questionnaire responses, and any proprietary data submitted to the Platform ("Customer Data"). Nothing in these Terms transfers ownership of Customer Data to the Company.
<br></br>8.2  Limited License to the Company. The Customer grants the Company a limited, non-exclusive, worldwide, royalty-free license to access, host, store, process, reproduce, and display Customer Data solely to the extent necessary to: (i) provide, maintain, and support the Platform and Services; (ii) generate ESG Reports, benchmarks, dashboards, and AI Recommendations requested by the Customer; (iii) provide customer support; and (iv) comply with applicable law. This license terminates upon deletion of the relevant Customer Data or closure of the Account, subject to Section 8.4 and the Company's standard back-up and legal retention cycles.
<br></br>8.3  Aggregated and Anonymized Data. The Company may create aggregated and/or anonymized data derived from Customer Data, which does not identify the Customer or any individual, for purposes including Benchmarking Data, product improvement, research, and industry insights. The Company owns such aggregated/anonymized data, provided it cannot reasonably be used to re-identify the Customer.
<br></br>8.4  Upon termination of the Subscription, the Customer may export its Customer Data for a period of [Number] days, after which the Company may delete such data from its active systems in accordance with its data retention policy and Section 15 (Privacy & Data Protection), save where retention is required by law.
<br></br>8.5  The Company does not claim ownership over any Customer Data and will not sell Customer Data to third parties.
<br></br>9. AI Recommendation Disclaimer
<br></br>This section contains important disclaimers regarding artificial intelligence features. Please read carefully.
<br></br>9.1  The Platform may use artificial intelligence, machine learning, or large language models to generate recommendations, risk flags, narrative summaries, gap analyses, or suggested actions ("AI Recommendations") based on User Content.
<br></br>9.2  AI Recommendations are generated automatically and are provided for informational and illustrative purposes only. They do not constitute professional, legal, financial, regulatory, sustainability, assurance, or investment advice, and must not be relied upon as a substitute for independent professional judgment.
<br></br>9.3  AI Recommendations are only as accurate, complete, and relevant as the User Content on which they are based. The Company does not warrant that AI Recommendations are error-free, complete, unbiased, suitable for any particular purpose, or reflective of the most current regulatory requirements.
<br></br>9.4  Users must independently review, validate, and, where appropriate, obtain professional advice before acting upon, publishing, or relying upon any AI Recommendation.
<br></br>9.5  The Company shall not be liable for any loss, damage, penalty, or adverse outcome arising from a User's reliance on, or implementation of, any AI Recommendation.
<br></br>10. ESG Report Disclaimer
<br></br>This section contains important disclaimers regarding the nature and limitations of ESG Reports. Please read carefully.
<br></br>10.1  ESG Reports generated through the Platform (including outputs mapped to GRI, BRSR, SASB, IFRS S1/S2, TCFD, and UNGC formats) are compiled and formatted based solely on the information, Questionnaire responses, and Documents submitted by the User. The Company does not independently verify, audit, or assure the underlying data.
<br></br>10.2  ESG Reports, scores, and ratings generated by the Platform are provided for informational and internal management purposes only. They do not constitute, and shall not be represented as:
<br></br>(a) A certification, attestation, or assurance of compliance with any ESG Framework, law, regulation, listing requirement, or industry standard;
<br></br>(b) An independent audit, verification, or third-party assurance report of any kind;
<br></br>(c) A guarantee of regulatory approval, filing acceptance, investment outcome, credit rating, or ESG rating by any third-party rating agency, exchange, or regulator;
<br></br>(d) Legal, financial, tax, or investment advice.
<br></br>10.3  No Guarantee of Compliance or Outcomes. The Company does not guarantee that use of the Platform or reliance on any ESG Report will result in regulatory compliance, certification, audit approval, favorable investment decisions, or any specific ESG rating or score from any third party. Any such indications, scores, or suggestions provided within the Platform are illustrative in nature and should be treated as suggestions only, not assurances or guarantees.
<br></br>10.4  It is the sole responsibility of the Organization to review each ESG Report for accuracy and completeness prior to internal approval, filing with any regulator or exchange, or external publication or distribution.
<br></br>10.5  Where a User requires an assured, audited, or certified ESG disclosure (e.g., for regulatory filing, exchange listing, or third-party assurance purposes), the User must separately engage a qualified, independent assurance provider, auditor, or professional advisor. The Platform is a reporting and drafting tool and does not substitute for such independent professional engagement.
<br></br>11. Benchmarking Disclaimer
<br></br>11.1  Peer benchmarking outputs are generated using aggregated and/or anonymized data submitted by other Users or drawn from third-party or publicly available datasets, and are provided for general, comparative, and informational purposes only.
<br></br>11.2  The Company does not guarantee the representativeness, statistical significance, comparability, or completeness of any peer group, industry classification, or benchmark dataset.
<br></br>11.3  Benchmarking outputs should not be relied upon as a definitive indicator of an Organization's relative ESG standing, market position, or as a basis for any investment, procurement, lending, or business decision without independent verification.
<br></br>11.4  The Company is not responsible for any decision made by the User or any third party in reliance on benchmarking outputs.
<br></br>12. Document Upload & Verification
<br></br>12.1  Users may upload Documents (e.g., policies, certificates, invoices, utility bills, board resolutions) as supporting evidence for Questionnaire responses.
<br></br>12.2  No Verification of Authenticity. Uploaded Documents are used by the Platform solely as supporting evidence to substantiate Questionnaire responses and to enable report generation. Except where the Platform expressly offers a defined document-verification feature, the Company does not verify, authenticate, notarize, or certify the genuineness, validity, or legal effect of any uploaded Document. Acceptance of a Document by the Platform does not constitute confirmation of its authenticity or accuracy.
<br></br>12.3  The Organization warrants that it has all necessary rights, licenses, and consents to upload each Document, including any third-party or personal data contained therein, and that such upload does not infringe any third party's rights or violate applicable law.
<br></br>12.4  The Company reserves the right (but has no obligation) to request additional information, flag inconsistencies, or decline to process Documents that appear, on their face, to be incomplete, corrupted, or manifestly fraudulent, without thereby assuming any verification obligation.
<br></br>12.5  Users are responsible for ensuring uploaded Documents do not contain malicious code, malware, or content that infringes third-party intellectual property or privacy rights.
<br></br>13. Acceptable Use Policy
<br></br>13.1  Users shall not:
<br></br>(a) Use the Platform for any unlawful, fraudulent, or misleading purpose, including to fabricate or misrepresent ESG performance;
<br></br>(b) Reverse engineer, decompile, or attempt to extract the source code or underlying models of the Platform, except to the extent such restriction is prohibited by applicable law;
<br></br>(c) Use automated means (bots, scrapers) to access the Platform without prior written consent;
<br></br>(d) Introduce viruses, malware, or other harmful code;
<br></br>(e) Attempt to gain unauthorized access to other Users' accounts, data, or Platform infrastructure;
<br></br>(f) Resell, sublicense, or provide access to the Platform to any third party without the Company's prior written consent, except to the Organization's own authorized personnel and permitted advisors;
<br></br>(g) Use the Platform to develop a competing product or service;
<br></br>(h) Upload content that is defamatory, obscene, discriminatory, or that infringes any third party's intellectual property, privacy, or other rights.
<br></br>13.2  The Company reserves the right to investigate suspected violations of this Acceptable Use Policy and to take appropriate action, including suspension or termination under Section 21.
<br></br>14. Confidentiality
<br></br>14.1  Each party agrees to protect the other party's Confidential Information with the same degree of care it uses for its own confidential information of similar nature, and no less than reasonable care.
<br></br>14.2  "Confidential Information" means non-public information disclosed by one party to the other, including Customer Data, business plans, pricing, and technical information, but excludes information that is or becomes publicly available through no breach of these Terms, is independently developed, or is rightfully received from a third party without restriction.
<br></br>14.3  Each party may disclose the other's Confidential Information to employees, contractors, and advisors on a need-to-know basis, provided such recipients are bound by confidentiality obligations at least as protective as those herein.
<br></br>14.4  Confidential Information may be disclosed where required by law, regulation, or court order, provided that (to the extent legally permitted) the disclosing party gives the other party prior written notice to allow it to seek a protective order.
<br></br>15. Privacy & Data Protection
<br></br>15.1  The Company processes personal data in accordance with its Privacy Policy, available at [Privacy Policy URL], which forms part of these Terms.
<br></br>15.2  Role of the Parties. Where the Customer submits personal data of its employees, directors, suppliers, or other third parties to the Platform, the Customer acts as the data controller (or "Data Fiduciary" under the DPDP Act) and the Company acts as a data processor (or "Data Processor") acting on the Customer's documented instructions, except where the Company processes account and billing data of the Customer's authorized users as an independent controller for its own administrative and legal purposes.
<br></br>15.3  Where applicable, the parties shall enter into a Data Processing Addendum ("DPA") incorporating standard contractual clauses or equivalent transfer mechanisms for cross-border data transfers, consistent with GDPR Chapter V and other applicable cross-border transfer requirements.
<br></br>15.4  GDPR Commitments. Where the GDPR applies, the Company shall: (i) process personal data only on documented instructions from the Customer, save where required by law; (ii) ensure persons authorized to process personal data are bound by confidentiality; (iii) implement appropriate technical and organizational measures; (iv) assist the Customer in responding to data subject requests and in complying with its obligations relating to data protection impact assessments and breach notifications; and (v) delete or return personal data at the end of the provision of services, subject to legal retention requirements.
<br></br>15.5  DPDP Act Commitments. Where the DPDP Act applies, the Company shall process personal data only for the specified purpose of providing the Services, implement reasonable security safeguards to prevent personal data breaches, assist the Customer (as Data Fiduciary) in fulfilling its obligations to Data Principals, and notify the Customer without undue delay upon becoming aware of a personal data breach affecting Customer Data.
<br></br>15.6  Users are responsible for obtaining any necessary consents from data subjects (e.g., employees, suppliers) prior to submitting their personal data to the Platform, and for ensuring a lawful basis exists for such processing.
<br></br>15.7  Users may exercise applicable data subject rights (access, correction, erasure, portability, objection) by contacting [Data Protection/Privacy Contact Email]. The Company will respond in accordance with Applicable Data Protection Laws.
<br></br>15.8  The Company shall not sell personal data to third parties and shall not use Customer Data for third-party advertising purposes.
<br></br>16. Security Measures
<br></br>16.1  The Company implements administrative, technical, and physical safeguards designed to protect the confidentiality, integrity, and availability of Customer Data, including encryption of data in transit and at rest, role-based access controls, logging and monitoring, and periodic security assessments.
<br></br>16.2  Notwithstanding the foregoing, no method of transmission or electronic storage is completely secure, and the Company cannot guarantee absolute security. Users acknowledge the inherent risks of transmitting data over the internet.
<br></br>16.3  In the event of a confirmed security incident affecting Customer Data, the Company shall notify the affected Customer without undue delay and in accordance with Applicable Data Protection Laws and any applicable DPA, and shall reasonably cooperate with the Customer's response efforts.
<br></br>16.4  Users are responsible for maintaining the security of their own devices, networks, and Account credentials used to access the Platform.
<br></br>17. Intellectual Property
<br></br>17.1  Company IP. The Platform, including its software, source code, questionnaire libraries, scoring methodologies, report templates, AI models, user interface, trademarks, and all related documentation ("Company IP"), is and shall remain the exclusive property of the Company and its licensors. No rights are granted to the Customer except the limited right to use the Platform as expressly set out in these Terms.
<br></br>17.2  The Customer shall not copy, modify, distribute, sell, or lease any part of the Company IP, nor attempt to extract the source code of the Platform, except as permitted by applicable law notwithstanding this restriction.
<br></br>17.3  Customer Data and Feedback. As set out in Section 8, the Customer retains ownership of Customer Data. If the Customer provides feedback, suggestions, or ideas regarding the Platform, the Customer grants the Company a perpetual, royalty-free, worldwide license to use such feedback to improve the Platform, without any obligation of attribution or compensation.
<br></br>17.4  Generated ESG Reports (the compiled document itself, as distinct from the underlying Customer Data) may be used freely by the Customer for its own internal and external reporting purposes; however, the underlying templates, scoring logic, and methodology remain the Company's intellectual property.
<br></br>18. Third-Party Services
<br></br>18.1  The Platform may integrate with, rely upon, or link to third-party services, including cloud hosting providers, payment gateways, identity/authentication providers, AI model providers, and data enrichment or benchmarking data sources ("Third-Party Services").
<br></br>18.2  The Company is not responsible for the availability, accuracy, security, or content of any Third-Party Service, and use of such services may be subject to separate terms and privacy policies of the relevant third party.
<br></br>18.3  Where the Platform incorporates third-party or publicly sourced ESG framework content, benchmark data, or regulatory taxonomies, such content is provided "as is" and the Company makes no representation as to its completeness or currency, though the Company will use reasonable efforts to keep framework mappings updated.
<br></br>18.4  The Company shall not be liable for any loss or damage arising from the acts, omissions, or unavailability of any Third-Party Service.
<br></br>19. Service Availability & Maintenance
<br></br>19.1  The Company will use commercially reasonable efforts to maintain the availability of the Platform, targeting the uptime levels (if any) specified in an applicable Service Level Agreement or Order Form.
<br></br>19.2  The Company may perform scheduled maintenance, during which the Platform may be temporarily unavailable. Where reasonably possible, the Company will provide advance notice of scheduled maintenance likely to cause material downtime.
<br></br>19.3  The Company shall not be liable for unavailability or performance issues caused by factors outside its reasonable control, including internet service provider failures, force majeure events, third-party hosting or Third-Party Service outages, or Customer-side network or configuration issues.
<br></br>19.4  The Company may, at its discretion, provide emergency or unscheduled maintenance without prior notice where necessary to address security vulnerabilities or critical issues.
<br></br>20. Payments
<br></br>20.1  Payments shall be made in the currency and through the payment methods specified on the Platform or in the applicable Order Form, via the Company's designated payment processor(s).
<br></br>20.2  The Customer authorizes the Company (or its payment processor) to charge the designated payment method for all applicable fees, including recurring Subscription renewals, unless cancelled in accordance with Section 5.
<br></br>20.3  Late payments may accrue interest at the rate of [Number]% per month or the maximum rate permitted by applicable law, whichever is lower, and may result in suspension of access under Section 21.
<br></br>20.4  The Customer is responsible for providing accurate billing information and promptly updating it upon any change, including changes to payment instruments or billing contacts.
<br></br>20.5  All invoices shall be deemed accepted unless disputed in writing within [Number] days of the invoice date.
<br></br>21. Suspension & Termination
<br></br>21.1  Either party may terminate these Terms for the Customer's convenience by providing written notice in accordance with Section 5.4, subject to any minimum term specified in an Order Form.
<br></br>21.2  The Company may suspend or terminate access to the Platform, in whole or in part, immediately upon notice, if:
<br></br>(a) The Customer fails to pay undisputed fees within [Number] days of the due date;
<br></br>(b) The Customer materially breaches these Terms and fails to cure such breach within [Number] days of written notice (where curable);
<br></br>(c) The Company reasonably believes the Customer's use of the Platform poses a security risk, legal liability, or violates the Acceptable Use Policy;
<br></br>(d) Required to comply with applicable law or a competent authority's order.
<br></br>21.3  Upon termination: (i) all licenses granted to the Customer under these Terms shall immediately cease; (ii) the Customer shall remain liable for all fees accrued prior to termination; and (iii) Section 8.4 (data export/retention), and Sections 14, 17, 22, 23, 24, 26, and 29 shall survive termination.
<br></br>21.4  Termination shall not relieve the Customer of its obligation to pay fees accrued up to the effective date of termination.
<br></br>22. Limitation of Liability
<br></br>This section limits the Company's liability. Please review carefully and seek independent legal advice regarding enforceability in your jurisdiction.
<br></br>22.1  To the maximum extent permitted by applicable law, in no event shall the Company, its affiliates, officers, employees, or licensors be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss of profits, revenue, goodwill, data, or business opportunity, arising out of or related to these Terms or use of the Platform, even if advised of the possibility of such damages.
<br></br>22.2  Reliance on User-Provided Information. Without limiting the generality of the foregoing, the Company shall not be liable for any incorrect, incomplete, or misleading ESG Report, score, benchmark, or AI Recommendation, nor for any regulatory action, penalty, fine, investigation, reputational harm, financial loss, denial of certification, loss of investment, or adverse decision by any third party (including regulators, exchanges, investors, lenders, or customers), arising from or in connection with inaccurate, incomplete, outdated, misleading, or fraudulent information, Questionnaire responses, or Documents submitted by any User, including errors or omissions made while completing Questionnaires or uploading Documents.
<br></br>22.3  Subject to Section 22.1, the Company's aggregate liability arising out of or relating to these Terms, whether in contract, tort, or otherwise, shall not exceed the total fees paid by the Customer to the Company in the [twelve (12)] months immediately preceding the event giving rise to the claim.
<br></br>22.4  The limitations in this Section 22 shall not apply to: (i) either party's indemnification obligations under Section 23; (ii) the Company's breach of its confidentiality obligations under Section 14; (iii) a party's fraud or willful misconduct; or (iv) liability that cannot be limited or excluded under applicable law.
<br></br>22.5  Some jurisdictions do not allow the exclusion or limitation of certain damages; in such jurisdictions, the Company's liability shall be limited to the maximum extent permitted by applicable law.
<br></br>23. Indemnification
<br></br>23.1  Customer Indemnity. The Customer shall indemnify, defend, and hold harmless the Company, its affiliates, and their respective officers, directors, employees, and agents from and against any third-party claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or relating to: (i) the Customer's or its Users' breach of these Terms; (ii) the inaccuracy, illegality, or unauthorized nature of any User Content, Questionnaire response, or Document submitted; (iii) the Customer's violation of applicable law, including data protection or securities disclosure law; or (iv) any dispute between the Customer and its own employees, contractors, or third parties arising from use of the Platform.
<br></br>23.2  Company Indemnity. The Company shall indemnify, defend, and hold harmless the Customer from and against any third-party claims to the extent arising from an allegation that the Platform, as provided by the Company and used in accordance with these Terms, infringes a third party's intellectual property rights, subject to the limitations in Section 22. This indemnity does not extend to claims arising from Customer Data, unauthorized use, or modifications not made by the Company.
<br></br>23.3  The indemnified party shall promptly notify the indemnifying party of any claim, provide reasonable cooperation, and allow the indemnifying party to control the defense and settlement thereof, provided that no settlement imposing liability on the indemnified party shall be made without its consent.
<br></br>24. Warranty Disclaimer
<br></br>24.1  Except as expressly stated in these Terms, the Platform and all outputs (including ESG Reports, scores, benchmarks, dashboards, and AI Recommendations) are provided "AS IS" and "AS AVAILABLE", without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, and any warranty arising from course of dealing or usage of trade.
<br></br>24.2  The Company does not warrant that: (i) the Platform will be uninterrupted, timely, secure, or error-free; (ii) any ESG Report, score, benchmark, or AI Recommendation will be accurate, complete, or fit for any regulatory, investment, or certification purpose; or (iii) any defects will be corrected.
<br></br>24.3  The Company does not warrant, and expressly disclaims, any assurance of regulatory compliance, certification, audit approval, investment outcome, or third-party ESG rating resulting from use of the Platform. Any indications to that effect within the Platform are suggestions only and not guarantees.
<br></br>24.4  No advice or information, whether oral or written, obtained from the Company or through the Platform shall create any warranty not expressly stated in these Terms.
<br></br>25. Regulatory Compliance
<br></br>25.1  The Platform is designed to assist Organizations in structuring and drafting ESG disclosures aligned with recognized frameworks. It is the sole responsibility of the Organization to determine which ESG Framework(s), regulatory filings, and disclosure obligations apply to it, and to ensure compliance with all applicable laws, listing rules, and regulatory requirements in its jurisdiction(s) of operation.
<br></br>25.2  The Company does not provide legal, financial, tax, sustainability consulting, assurance, certification, or investment advice. Users requiring such advice should consult qualified, independent professionals licensed in the relevant jurisdiction.
<br></br>25.3  Reports generated by the Platform are not independent audits, assurance engagements, or attestations under any auditing or assurance standard (including ISAE 3000, AA1000AS, or equivalent), and shall not be represented as such by the Organization to any regulator, exchange, investor, or third party.
<br></br>25.4  The Company will use reasonable efforts to update Questionnaire content and report templates to reflect material changes to supported ESG Frameworks, but does not guarantee that the Platform reflects the most current version of every applicable law, regulation, or standard at all times. Organizations should independently verify the current requirements applicable to them.
<br></br>26. Governing Law
<br></br>26.1  These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of [Governing Law Jurisdiction, e.g., India / State of Delaware, USA], without regard to its conflict of laws principles.
<br></br>26.2  Subject to Section 26.3, the courts at [City/Jurisdiction for Exclusive Courts] shall have exclusive jurisdiction over any dispute arising out of or in connection with these Terms.
<br></br>26.3  Alternative Dispute Resolution (Optional). The parties may agree that disputes shall first be referred to arbitration under the [Arbitration Rules/Institution], seated at [Seat of Arbitration], conducted in the [Language] language, with the arbitral award being final and binding, save for enforcement proceedings.
<br></br>26.4  Nothing in this Section shall prevent either party from seeking urgent injunctive or equitable relief in any court of competent jurisdiction.
<br></br>27. Changes to Terms
<br></br>27.1  The Company may amend these Terms from time to time to reflect changes in law, Platform functionality, or business practices.
<br></br>27.2  Material changes will be notified to Users by email and/or through an in-Platform notice at least [Number] days before taking effect. Non-material or clarificatory changes may take effect immediately upon posting of the revised Terms with an updated "Last Updated" date.
<br></br>27.3  Continued use of the Platform after the effective date of any amendment constitutes acceptance of the revised Terms. If the Customer does not agree to the revised Terms, it may terminate its Subscription in accordance with Section 5.4 prior to the effective date.
<br></br>28. Contact Information
<br></br>For any questions, notices, or requests regarding these Terms, the Platform, or your data, please contact:
<br></br>Company: [Company Legal Name]
<br></br>Registered Address: [Registered Office Address]
<br></br>General Support: [Support Email]
<br></br>Billing Queries: [Billing Support Email]
<br></br>Data Protection / Privacy Officer: [Data Protection Contact Email]
<br></br>Legal Notices: [Legal Notices Email/Address]
<br></br>29. Entire Agreement
<br></br>29.1  These Terms, together with the Privacy Policy, any applicable Order Form(s), Data Processing Addendum, and any other documents expressly incorporated by reference, constitute the entire agreement between the Customer and the Company with respect to the subject matter hereof, and supersede all prior or contemporaneous understandings, negotiations, and agreements, whether written or oral.
<br></br>29.2  If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid provision shall be deemed modified to the minimum extent necessary to make it enforceable.
<br></br>29.3  No waiver of any provision of these Terms shall be effective unless in writing. The failure of either party to enforce any right or provision shall not constitute a waiver of such right or provision.
<br></br>29.4  Neither party may assign these Terms without the prior written consent of the other party, except that the Company may assign these Terms in connection with a merger, acquisition, or sale of substantially all of its assets, upon notice to the Customer.
<br></br>29.5  These Terms may be executed or accepted electronically, and electronic acceptance (including click-through acceptance) shall be deemed valid and binding.
<br></br>

      </div>
      <button type="button" className="terms-modal__accept" onClick={() => { setAcceptedTerms(true); setShowTerms(false); }}>I Agree</button>
    </div>
  </div> : null}
  
  </main>;
  
};

export default RegisterPage;
