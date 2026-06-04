/**
 * DIRECTOR RESUMES & LINKEDIN SEED DATA
 *
 * Comprehensive seed data for populating board member resumes and LinkedIn verification data.
 * Includes 5 realistic board members with:
 * - Professional profile details
 * - Resume text extraction
 * - LinkedIn verification with extracted education, experience, and certifications
 * - Prospectus synchronization tracking
 *
 * Companies: VentureTech Innovations Inc (TSXV listing)
 * Database: IPOReady PostgreSQL
 */

-- ====================================================================
-- CLEAR EXISTING DATA (Optional - for fresh seeding)
-- ====================================================================
-- DELETE FROM director_prospectus_sync WHERE professional_id IN (
--   SELECT id FROM professionals WHERE email IN (
--     'jennifer.wong@ipoadvisors.com',
--     'sarah.chen@ipoready.com',
--     'michael.rodriguez@techleaders.com',
--     'james.porter@equity.com',
--     'victoria.lee@governance.com'
--   )
-- );
--
-- DELETE FROM director_linkedin_verification WHERE professional_id IN (
--   SELECT id FROM professionals WHERE email IN (
--     'jennifer.wong@ipoadvisors.com',
--     'sarah.chen@ipoready.com',
--     'michael.rodriguez@techleaders.com',
--     'james.porter@equity.com',
--     'victoria.lee@governance.com'
--   )
-- );
--
-- DELETE FROM director_resumes WHERE professional_id IN (
--   SELECT id FROM professionals WHERE email IN (
--     'jennifer.wong@ipoadvisors.com',
--     'sarah.chen@ipoready.com',
--     'michael.rodriguez@techleaders.com',
--     'james.porter@equity.com',
--     'victoria.lee@governance.com'
--   )
-- );
--
-- DELETE FROM professionals WHERE email IN (
--   'jennifer.wong@ipoadvisors.com',
--   'sarah.chen@ipoready.com',
--   'michael.rodriguez@techleaders.com',
--   'james.porter@equity.com',
--   'victoria.lee@governance.com'
-- );

-- ====================================================================
-- 1. INSERT PROFESSIONALS (Board Members)
-- ====================================================================

INSERT INTO professionals
  (id, name, email, phone, linkedin_url, professional_title, years_public_experience,
   industries, regions, rate_expectations_annual, certifications, years_of_experience, bio,
   verification_status, linkedin_verified, linkedin_verified_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001',
   'Jennifer Wong',
   'jennifer.wong@ipoadvisors.com',
   '+1-415-555-0101',
   'https://www.linkedin.com/in/jennifer-wong-tech/',
   'Independent Director & Board Advisor',
   15,
   '["technology","software","venture"]'::TEXT[],
   '["San Francisco","Toronto","Seattle"]'::TEXT[],
   85000,
   '["CFA","Board Governance","Technology Audit Committee"]'::TEXT[],
   18,
   'Jennifer Wong is an accomplished technology executive with 15+ years of public company board experience. She holds an MBA from Stanford and serves on multiple technology company boards. Expert in tech strategy, digital transformation, and audit committee governance.',
   'verified',
   TRUE,
   NOW()),

  ('550e8400-e29b-41d4-a716-446655440002',
   'Sarah Chen',
   'sarah.chen@ipoready.com',
   '+1-416-555-0102',
   'https://www.linkedin.com/in/sarah-chen-cfo/',
   'CFO & Finance Director',
   12,
   '["finance","software","healthcare"]'::TEXT[],
   '["Toronto","New York","Boston"]'::TEXT[],
   95000,
   '["CPA","CFA","Audit Committee Financial Expert"]'::TEXT[],
   16,
   'Sarah Chen is an experienced CFO with expertise in financial reporting, audit committee leadership, and public company finance. She has led two prior TSXV listings and specializes in SaaS financial models. CFA charterholder and registered public accountant.',
   'verified',
   TRUE,
   NOW()),

  ('550e8400-e29b-41d4-a716-446655440003',
   'Michael Rodriguez',
   'michael.rodriguez@techleaders.com',
   '+1-650-555-0103',
   'https://www.linkedin.com/in/michael-rodriguez-architect/',
   'CTO & Technology Board Member',
   18,
   '["technology","software","cloud"]'::TEXT[],
   '["San Francisco","Seattle","Austin"]'::TEXT[],
   80000,
   '["Cloud Architecture","Technology Leadership","Security"]'::TEXT[],
   22,
   'Michael Rodriguez brings 18+ years of experience in enterprise software and cloud architecture. He has led technology teams at Fortune 500 companies and startups. Expert in infrastructure scaling, cybersecurity, and technical due diligence for IPOs.',
   'verified',
   TRUE,
   NOW()),

  ('550e8400-e29b-41d4-a716-446655440004',
   'James Porter',
   'james.porter@equity.com',
   '+1-212-555-0104',
   'https://www.linkedin.com/in/james-porter-equity/',
   'Independent Director & Compensation Committee Chair',
   20,
   '["finance","equity","corporate governance"]'::TEXT[],
   '["New York","Toronto","London"]'::TEXT[],
   100000,
   '["CPA","Compensation Committee Expertise","Executive Compensation"]'::TEXT[],
   25,
   'James Porter is a seasoned compensation and governance expert with 20+ years on public company boards. He chairs compensation committees and specializes in equity incentive plan design. Extensive experience with equity-heavy tech companies.',
   'verified',
   TRUE,
   NOW()),

  ('550e8400-e29b-41d4-a716-446655440005',
   'Victoria Lee',
   'victoria.lee@governance.com',
   '+1-604-555-0105',
   'https://www.linkedin.com/in/victoria-lee-governance/',
   'Board Chair & Governance Expert',
   22,
   '["technology","governance","venture capital"]'::TEXT[],
   '["Vancouver","Toronto","San Francisco"]'::TEXT[],
   120000,
   '["CPA","Board Chair Certification","Corporate Governance"]'::TEXT[],
   28,
   'Victoria Lee is an accomplished board chair with 22+ years of public company experience. She specializes in corporate governance, board composition, and stakeholder relations. Has chaired boards through multiple M&A transactions and growth phases.',
   'verified',
   TRUE,
   NOW())
ON CONFLICT (email) DO UPDATE SET
  professional_title = EXCLUDED.professional_title,
  years_public_experience = EXCLUDED.years_public_experience,
  verification_status = 'verified';

-- ====================================================================
-- 2. INSERT DIRECTOR RESUMES
-- ====================================================================

INSERT INTO director_resumes
  (professional_id, file_name, file_size, file_mime_type, version, is_current,
   uploaded_at, verified_at, verification_status, is_readable, text_extract,
   page_count, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001',
   'Jennifer_Wong_Resume_2025.pdf',
   245000,
   'application/pdf',
   1,
   TRUE,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days',
   'verified',
   TRUE,
   'JENNIFER WONG
San Francisco, CA | (415) 555-0101 | jennifer.wong@ipoadvisors.com | LinkedIn.com/in/jennifer-wong-tech

EXECUTIVE PROFILE
Independent Director and Board Advisor with 18+ years in technology leadership and public company governance.
Expertise in digital transformation, SaaS scaling, and audit committee oversight. CFA charterholder with Stanford MBA.

EDUCATION
Stanford Graduate School of Business - MBA, Technology Management (2011)
University of California, Berkeley - BS, Computer Science (2007)

PROFESSIONAL CERTIFICATIONS
Chartered Financial Analyst (CFA) Level III, CFA Institute (2018)
Board Governance Certification, National Association of Corporate Directors (2016)
Technology Audit Committee Certification (2014)

BOARD POSITIONS & DIRECTORSHIPS
• Board Member, TechVenture Inc (NASDAQ: TVEN) - 2019-Present
  - Member, Audit Committee | Compensation Committee Chair
  - Oversight of $200M+ in technical infrastructure investments
• Board Member, CloudScale Corp (TSXV: SCAL) - 2018-Present
  - Chair, Technology Committee | Member, Risk Committee
  - Led successful IPO process; guided $50M capital raise
• Board Member, DataSecure Solutions LLC - 2020-Present
  - Member, Audit Committee | Compliance oversight

EXECUTIVE EXPERIENCE
Vice President, Technology Strategy | Silicon Valley Tech Consortium (2018-2021)
- Led strategic initiatives for 15+ portfolio companies
- Managed $150M technology investment portfolio
- Expertise in infrastructure scaling and cost optimization

Senior Director, Enterprise Architecture | Google Cloud (2014-2018)
- Managed team of 25+ engineers across three continents
- Architected cloud solutions for Fortune 100 customers
- Revenue impact: $80M+ annually

SKILLS & EXPERTISE
• Board Governance & Committee Management
• Technology Due Diligence & Risk Assessment
• SaaS & Cloud Business Models
• Financial Reporting & Audit Oversight
• Regulatory Compliance (SOX, GDPR, PIPEDA)
• Equity Incentive Planning
• Investor Relations & Communications',
   2,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days'),

  ('550e8400-e29b-41d4-a716-446655440002',
   'Sarah_Chen_CFO_Resume_2025.pdf',
   245000,
   'application/pdf',
   1,
   TRUE,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days',
   'verified',
   TRUE,
   'SARAH CHEN, CPA, CFA
Toronto, ON | (416) 555-0102 | sarah.chen@ipoready.com | LinkedIn.com/in/sarah-chen-cfo

EXECUTIVE PROFILE
Chief Financial Officer and Finance Director with 16+ years of public company financial leadership.
Expert in IPO preparation, public company accounting, and audit committee governance.
CPA and CFA charterholder with proven track record leading two TSXV listings.

EDUCATION
Ivey Business School, University of Western Ontario - MBA, Finance (2010)
University of Toronto - BComm, Accounting (2006)

PROFESSIONAL CERTIFICATIONS
Chartered Professional Accountant (CPA), CPA Ontario (2014)
Chartered Financial Analyst (CFA) Level III, CFA Institute (2016)
Audit Committee Financial Expert Designation (2018)
Sarbanes-Oxley (SOX) Compliance Specialist (2019)

FINANCIAL LEADERSHIP EXPERIENCE
Chief Financial Officer | VentureTech Growth Partners (2021-Present)
- Oversee financial operations for $500M+ diversified portfolio
- Led audit committee of board; managed $50M+ annual audit budget
- Implemented SOX-compliant financial reporting infrastructure
- Year-over-year revenue growth: +65%

Chief Financial Officer | TechScale Corp (TSXV: TSCL) - IPO (2018-2021)
- Led full IPO process from pre-prospectus planning through post-listing
- Managed $30M+ in securities issuance; secured $45M Series C funding
- Implemented TSXV-compliant financial systems and controls
- Achieved 94% audit committee effectiveness rating

Vice President, Finance | HealthTech Solutions (2015-2018)
- Oversaw financial planning, accounting, and investor relations
- Prepared audited financial statements (IFRS and GAAP)
- Managed relationships with Big 4 auditors (Deloitte, PwC, EY)

BOARD POSITIONS
• Audit Committee Member, InnovateTech Inc (TSXV) - 2022-Present
• Finance Committee Chair, Educational Tech Foundation - 2020-Present

SKILLS & EXPERTISE
• Financial Reporting & IFRS/GAAP Compliance
• IPO Preparation & Prospectus Development
• Audit Committee Oversight & SOX Implementation
• Capital Raise Execution & Securities Management
• Budgeting & Financial Planning
• Risk Management & Internal Controls
• Investor Relations & Communications',
   2,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days'),

  ('550e8400-e29b-41d4-a716-446655440003',
   'Michael_Rodriguez_CTO_Resume_2025.pdf',
   245000,
   'application/pdf',
   1,
   TRUE,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days',
   'verified',
   TRUE,
   'MICHAEL RODRIGUEZ
Seattle, WA | (650) 555-0103 | michael.rodriguez@techleaders.com | LinkedIn.com/in/michael-rodriguez-architect

EXECUTIVE PROFILE
Chief Technology Officer with 22+ years of enterprise software architecture and technology leadership.
Proven expertise in cloud infrastructure scaling, cybersecurity, and technical due diligence for IPOs.
Successfully architected systems for 100M+ users and $1B+ in transaction volume.

EDUCATION
Carnegie Mellon University - MS, Computer Science (Systems) (2003)
University of Washington - BS, Computer Engineering (2001)

PROFESSIONAL CERTIFICATIONS
AWS Solutions Architect Professional (2020)
Google Cloud Architect (2019)
Certified Information Systems Security Professional (CISSP) - ISC² (2018)

TECHNOLOGY LEADERSHIP EXPERIENCE
Chief Technology Officer | CloudArchitect Inc (2019-Present)
- Lead technology strategy and architecture for 150+ engineering team
- Oversee infrastructure supporting 100M+ monthly active users
- Managed successful SOC 2 Type II and ISO 27001 certifications
- Designed architecture supporting 99.99% uptime SLA
- Cost optimization initiatives: $15M+ annual savings

Vice President, Infrastructure | TechScale Corp (TSXV IPO, 2018-2021)
- Built engineering organization from 20 to 120 engineers
- Architected cloud infrastructure for TSXV compliance
- Led technical due diligence during $45M capital raise
- Implemented CI/CD pipeline; 40% deployment time reduction

Senior Director, Cloud Architecture | Google (2014-2019)
- Managed cloud solutions for Fortune 500 customers
- Led security initiatives affecting 10,000+ employees
- Technical mentor for 25+ engineers across three offices

BOARD & ADVISORY POSITIONS
• Technology Committee Member, TechVenture Inc (NASDAQ) - 2019-Present
• Technical Advisor, Venture Capital Fund (2020-Present)

SKILLS & EXPERTISE
• Cloud Architecture & Infrastructure Scaling
• Cybersecurity & Compliance (SOC 2, ISO 27001, HIPAA)
• DevOps & CI/CD Pipeline Design
• Technology Due Diligence for M&A/IPO
• Team Building & Technical Leadership
• Cost Optimization & Resource Management',
   2,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days'),

  ('550e8400-e29b-41d4-a716-446655440004',
   'James_Porter_Compensation_Expert_Resume_2025.pdf',
   245000,
   'application/pdf',
   1,
   TRUE,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days',
   'verified',
   TRUE,
   'JAMES PORTER, CPA
New York, NY | (212) 555-0104 | james.porter@equity.com | LinkedIn.com/in/james-porter-equity

EXECUTIVE PROFILE
Compensation and Governance Specialist with 25+ years of public company board experience.
Expert in equity incentive plan design, executive compensation disclosure, and governance.
Compensation Committee Chair at multiple Fortune 500 and TSXV-listed companies.

EDUCATION
Harvard Business School - MBA, Finance & Governance (1999)
University of Pennsylvania - BS, Business Administration (1995)

PROFESSIONAL CERTIFICATIONS
Certified Public Accountant (CPA), New York Board of Accountancy (1999)
Compensation Committee Expert Designation (2012)
Executive Compensation Specialist (ISS Academy, 2015)

GOVERNANCE & COMPENSATION LEADERSHIP
Compensation Committee Chair | EquityTech Corp (NYSE) - 2018-Present
- Oversee $500M+ equity compensation program
- Lead proxy statement executive compensation disclosure
- Manage Say-on-Pay initiatives; 87% average shareholder approval

Board Member & Compensation Chair | TechScale Corp (TSXV IPO, 2018-2021)
- Designed equity package for IPO and post-listing retention
- Implemented performance-based stock option plans
- Created management incentive plan (MIP) for 50+ executives
- Advised on Section 16 and Insider Trading compliance

Compensation Committee Member | HealthVenture Inc (NASDAQ) - 2015-Present
- Oversee executive compensation and equity awards
- Lead annual say-on-pay shareholder votes

ADVISORY & CONSULTING EXPERIENCE
Senior Advisor | Willis Towers Watson - Executive Compensation (2012-2018)
- Advised 100+ public companies on compensation strategy
- Expertise in technology, healthcare, and financial services sectors
- Supported multiple IPO compensation planning initiatives

SKILLS & EXPERTISE
• Executive Compensation Planning & Design
• Equity Incentive Plan Architecture
• Say-on-Pay & Proxy Statement Disclosure
• Section 16 & Insider Trading Compliance
• Performance Metrics & Clawback Provisions
• Shareholder Value Alignment
• Board Governance & Committee Management',
   2,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days'),

  ('550e8400-e29b-41d4-a716-446655440005',
   'Victoria_Lee_Board_Chair_Resume_2025.pdf',
   245000,
   'application/pdf',
   1,
   TRUE,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days',
   'verified',
   TRUE,
   'VICTORIA LEE, CPA
Vancouver, BC | (604) 555-0105 | victoria.lee@governance.com | LinkedIn.com/in/victoria-lee-governance

EXECUTIVE PROFILE
Board Chair and Corporate Governance Expert with 28+ years of board-level experience.
Specializes in corporate governance, board composition, and stakeholder relations.
Successfully chaired boards through multiple M&A transactions and growth phases.

EDUCATION
University of British Columbia - MBA, Corporate Governance (1997)
University of British Columbia - BComm, Accounting (1993)

PROFESSIONAL CERTIFICATIONS
Chartered Professional Accountant (CPA), CPA British Columbia (2000)
Board Chair Certification, National Association of Corporate Directors (2015)
Corporate Governance Specialist (2016)

BOARD CHAIR EXPERIENCE
Board Chair & CEO | GrowthTech Inc (Private equity backed) - 2020-Present
- Lead 9-member board; oversee quarterly governance reviews
- Managed $200M acquisition; created post-acquisition integration roadmap
- Improved board effectiveness: 92% board satisfaction rating

Board Chair | TechVenture Corp (NASDAQ: TVEN) - 2015-2022
- Led board of 10 directors through successful IPO (2017)
- Managed $150M+ capital raise; 99% institutional investor participation
- Implemented ESG governance framework; received top-quartile ratings
- Negotiated $500M strategic acquisition (2021)

Board Chair | InnovateLabs TSXV (TSXV: INNV) - 2012-2018
- Guided company through IPO process; $75M successful offering
- Established board committees: Audit, Compensation, Technology
- Improved governance maturity from Level 2 to Level 4 (4/5 scale)

SKILLS & EXPERTISE
• Strategic Board Leadership & Governance
• Board Composition & Committee Structure
• Stakeholder Relations & Communications
• M&A Transaction Oversight
• Risk Management & Compliance
• Investor Relations & Capital Markets
• Executive Search & Succession Planning',
   2,
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 3. INSERT LINKEDIN VERIFICATION DATA
-- ====================================================================

INSERT INTO director_linkedin_verification
  (professional_id, linkedin_url, verification_status, verified_at, verification_method,
   verification_provider, extracted_education, extracted_experience, extracted_certifications,
   confidence_score, data_completeness_score, profile_headline, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001',
   'https://www.linkedin.com/in/jennifer-wong-tech/',
   'verified',
   NOW() - INTERVAL '20 days',
   'automated_scrape',
   'manual_review',
   '[
     {"school": "Stanford Graduate School of Business", "degree": "MBA", "field_of_study": "Technology Management", "start_date": "2009-09-01", "end_date": "2011-06-01"},
     {"school": "University of California, Berkeley", "degree": "BS", "field_of_study": "Computer Science", "start_date": "2003-08-01", "end_date": "2007-05-01"}
   ]'::JSONB,
   '[
     {"title": "Board Member", "company": "TechVenture Inc", "location": "San Francisco, CA", "start_date": "2019-06-01", "end_date": null, "description": "Audit Committee and Compensation Committee Member"},
     {"title": "Board Member", "company": "CloudScale Corp", "location": "Toronto, ON", "start_date": "2018-04-01", "end_date": null, "description": "Technology Committee Chair, Risk Committee Member"},
     {"title": "Vice President, Technology Strategy", "company": "Silicon Valley Tech Consortium", "location": "San Francisco, CA", "start_date": "2018-01-01", "end_date": "2021-12-01", "description": "Portfolio company oversight, investment management"}
   ]'::JSONB,
   '[
     {"name": "CFA Level III", "issuer": "CFA Institute", "issued_date": "2018-08-01"},
     {"name": "Board Governance Certification", "issuer": "NACD", "issued_date": "2016-11-01"},
     {"name": "Technology Audit Committee Certification", "issuer": "NACD", "issued_date": "2014-03-01"}
   ]'::JSONB,
   0.94,
   0.88,
   'Board Member & Technology Executive',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days'),

  ('550e8400-e29b-41d4-a716-446655440002',
   'https://www.linkedin.com/in/sarah-chen-cfo/',
   'verified',
   NOW() - INTERVAL '20 days',
   'automated_scrape',
   'manual_review',
   '[
     {"school": "Ivey Business School, University of Western Ontario", "degree": "MBA", "field_of_study": "Finance", "start_date": "2008-09-01", "end_date": "2010-05-01"},
     {"school": "University of Toronto", "degree": "BComm", "field_of_study": "Accounting", "start_date": "2002-09-01", "end_date": "2006-05-01"}
   ]'::JSONB,
   '[
     {"title": "Chief Financial Officer", "company": "VentureTech Growth Partners", "location": "Toronto, ON", "start_date": "2021-03-01", "end_date": null, "description": "Financial operations, audit oversight, $500M portfolio"},
     {"title": "Chief Financial Officer", "company": "TechScale Corp", "location": "Toronto, ON", "start_date": "2018-06-01", "end_date": "2021-02-01", "description": "IPO preparation and execution, $45M capital raise"}
   ]'::JSONB,
   '[
     {"name": "CPA", "issuer": "CPA Ontario", "issued_date": "2014-06-01"},
     {"name": "CFA Level III", "issuer": "CFA Institute", "issued_date": "2016-08-01"},
     {"name": "Audit Committee Financial Expert", "issuer": "PCAOB", "issued_date": "2018-09-01"}
   ]'::JSONB,
   0.92,
   0.88,
   'Chief Financial Officer & IPO Expert',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days'),

  ('550e8400-e29b-41d4-a716-446655440003',
   'https://www.linkedin.com/in/michael-rodriguez-architect/',
   'verified',
   NOW() - INTERVAL '20 days',
   'automated_scrape',
   'manual_review',
   '[
     {"school": "Carnegie Mellon University", "degree": "MS", "field_of_study": "Computer Science (Systems)", "start_date": "2001-09-01", "end_date": "2003-05-01"},
     {"school": "University of Washington", "degree": "BS", "field_of_study": "Computer Engineering", "start_date": "1997-09-01", "end_date": "2001-05-01"}
   ]'::JSONB,
   '[
     {"title": "Chief Technology Officer", "company": "CloudArchitect Inc", "location": "Seattle, WA", "start_date": "2019-04-01", "end_date": null, "description": "Cloud infrastructure, 150+ engineering team, 100M+ users"},
     {"title": "Vice President, Infrastructure", "company": "TechScale Corp", "location": "Seattle, WA", "start_date": "2018-06-01", "end_date": "2019-03-01", "description": "Infrastructure scaling, IPO support"},
     {"title": "Senior Director, Cloud Architecture", "company": "Google", "location": "San Francisco, CA", "start_date": "2014-01-01", "end_date": "2019-03-01", "description": "Fortune 500 solutions, team leadership"}
   ]'::JSONB,
   '[
     {"name": "AWS Solutions Architect Professional", "issuer": "AWS", "issued_date": "2020-06-01"},
     {"name": "Google Cloud Architect", "issuer": "Google Cloud", "issued_date": "2019-12-01"},
     {"name": "CISSP", "issuer": "ISC²", "issued_date": "2018-09-01"}
   ]'::JSONB,
   0.91,
   0.88,
   'Chief Technology Officer & Cloud Architect',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days'),

  ('550e8400-e29b-41d4-a716-446655440004',
   'https://www.linkedin.com/in/james-porter-equity/',
   'verified',
   NOW() - INTERVAL '20 days',
   'automated_scrape',
   'manual_review',
   '[
     {"school": "Harvard Business School", "degree": "MBA", "field_of_study": "Finance & Governance", "start_date": "1997-09-01", "end_date": "1999-05-01"},
     {"school": "University of Pennsylvania", "degree": "BS", "field_of_study": "Business Administration", "start_date": "1991-09-01", "end_date": "1995-05-01"}
   ]'::JSONB,
   '[
     {"title": "Compensation Committee Chair", "company": "EquityTech Corp", "location": "New York, NY", "start_date": "2018-02-01", "end_date": null, "description": "NYSE listed, $500M equity compensation oversight"},
     {"title": "Board Member & Compensation Chair", "company": "TechScale Corp", "location": "Toronto, ON", "start_date": "2018-06-01", "end_date": "2021-02-01", "description": "IPO preparation, equity plan design"},
     {"title": "Senior Advisor", "company": "Willis Towers Watson", "location": "New York, NY", "start_date": "2012-01-01", "end_date": "2018-12-01", "description": "Executive compensation consulting, 100+ clients"}
   ]'::JSONB,
   '[
     {"name": "CPA", "issuer": "New York Board of Accountancy", "issued_date": "1999-06-01"},
     {"name": "Compensation Committee Expert", "issuer": "ISS Academy", "issued_date": "2012-10-01"},
     {"name": "Executive Compensation Specialist", "issuer": "ISS Academy", "issued_date": "2015-06-01"}
   ]'::JSONB,
   0.89,
   0.88,
   'Compensation & Governance Expert',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days'),

  ('550e8400-e29b-41d4-a716-446655440005',
   'https://www.linkedin.com/in/victoria-lee-governance/',
   'verified',
   NOW() - INTERVAL '20 days',
   'automated_scrape',
   'manual_review',
   '[
     {"school": "University of British Columbia", "degree": "MBA", "field_of_study": "Corporate Governance", "start_date": "1995-09-01", "end_date": "1997-05-01"},
     {"school": "University of British Columbia", "degree": "BComm", "field_of_study": "Accounting", "start_date": "1989-09-01", "end_date": "1993-05-01"}
   ]'::JSONB,
   '[
     {"title": "Board Chair & CEO", "company": "GrowthTech Inc", "location": "Vancouver, BC", "start_date": "2020-05-01", "end_date": null, "description": "9-member board, $200M acquisition management"},
     {"title": "Board Chair", "company": "TechVenture Corp", "location": "San Francisco, CA", "start_date": "2015-01-01", "end_date": "2022-12-01", "description": "NASDAQ listed, IPO and $500M acquisition oversight"},
     {"title": "Board Chair", "company": "InnovateLabs", "location": "Toronto, ON", "start_date": "2012-06-01", "end_date": "2018-12-01", "description": "TSXV listed, $75M IPO governance"}
   ]'::JSONB,
   '[
     {"name": "CPA", "issuer": "CPA British Columbia", "issued_date": "2000-06-01"},
     {"name": "Board Chair Certification", "issuer": "NACD", "issued_date": "2015-11-01"},
     {"name": "Corporate Governance Specialist", "issuer": "NACD", "issued_date": "2016-03-01"}
   ]'::JSONB,
   0.95,
   0.88,
   'Board Chair & Governance Leader',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 4. INSERT PROSPECTUS SYNC RECORDS
-- ====================================================================
-- Note: Requires existing prospectus_document or use prospectus_id instead

INSERT INTO director_prospectus_sync
  (professional_id, prospectus_document_id, sync_key, section_type, sync_status,
   sync_confidence, created_at, updated_at)
SELECT
  prof.id,
  p.id as prospectus_document_id,
  CASE
    WHEN prof.email = 'jennifer.wong@ipoadvisors.com' THEN 'independent_director_1'
    WHEN prof.email = 'sarah.chen@ipoready.com' THEN 'audit_committee_expert'
    WHEN prof.email = 'michael.rodriguez@techleaders.com' THEN 'technology_committee_member'
    WHEN prof.email = 'james.porter@equity.com' THEN 'compensation_committee_chair'
    WHEN prof.email = 'victoria.lee@governance.com' THEN 'board_chair'
  END as sync_key,
  CASE
    WHEN prof.email IN ('jennifer.wong@ipoadvisors.com', 'michael.rodriguez@techleaders.com', 'victoria.lee@governance.com') THEN 'board_of_directors'
    WHEN prof.email = 'sarah.chen@ipoready.com' THEN 'audit_committee'
    WHEN prof.email = 'james.porter@equity.com' THEN 'compensation_committee'
  END as section_type,
  'pending' as sync_status,
  0.75 as sync_confidence,
  NOW() as created_at,
  NOW() as updated_at
FROM professionals prof
CROSS JOIN prospectuses p
WHERE prof.email IN (
  'jennifer.wong@ipoadvisors.com',
  'sarah.chen@ipoready.com',
  'michael.rodriguez@techleaders.com',
  'james.porter@equity.com',
  'victoria.lee@governance.com'
)
AND p.company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- VERIFICATION SUMMARY
-- ====================================================================
-- Run these queries to verify data was inserted correctly:

-- SELECT COUNT(*) as professional_count FROM professionals
--   WHERE email IN (
--     'jennifer.wong@ipoadvisors.com',
--     'sarah.chen@ipoready.com',
--     'michael.rodriguez@techleaders.com',
--     'james.porter@equity.com',
--     'victoria.lee@governance.com'
--   );
-- Expected: 5

-- SELECT COUNT(*) as resume_count FROM director_resumes
--   WHERE professional_id IN (
--     SELECT id FROM professionals WHERE email IN (
--       'jennifer.wong@ipoadvisors.com',
--       'sarah.chen@ipoready.com',
--       'michael.rodriguez@techleaders.com',
--       'james.porter@equity.com',
--       'victoria.lee@governance.com'
--     )
--   );
-- Expected: 5

-- SELECT COUNT(*) as linkedin_count FROM director_linkedin_verification
--   WHERE professional_id IN (
--     SELECT id FROM professionals WHERE email IN (
--       'jennifer.wong@ipoadvisors.com',
--       'sarah.chen@ipoready.com',
--       'michael.rodriguez@techleaders.com',
--       'james.porter@equity.com',
--       'victoria.lee@governance.com'
--     )
--   );
-- Expected: 5

-- SELECT COUNT(*) as sync_count FROM director_prospectus_sync
--   WHERE professional_id IN (
--     SELECT id FROM professionals WHERE email IN (
--       'jennifer.wong@ipoadvisors.com',
--       'sarah.chen@ipoready.com',
--       'michael.rodriguez@techleaders.com',
--       'james.porter@equity.com',
--       'victoria.lee@governance.com'
--     )
--   );
-- Expected: 5
