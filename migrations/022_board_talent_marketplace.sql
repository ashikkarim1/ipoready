/**
 * Board & Talent Marketplace Schema
 *
 * Comprehensive system for professional board members and talent matching
 * with anti-circumvention logic to ensure finders fees are captured properly.
 *
 * Tables:
 * - professionals: Board members and executive talent
 * - professional_introductions: Requests to introduce professionals to companies
 * - hiring_confirmations: Formal agreement when both parties confirm hire
 * - professional_referrals: Referral commission tracking (10% of finders fee)
 */

-- ====================================================================
-- TABLE: PROFESSIONALS
-- ====================================================================
-- Store board members, executive talent, and other qualified professionals

CREATE TABLE IF NOT EXISTS professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),

  -- LinkedIn verification
  linkedin_url TEXT,
  linkedin_verified BOOLEAN DEFAULT FALSE,
  linkedin_verified_at TIMESTAMP WITH TIME ZONE,

  -- Professional background
  professional_title VARCHAR(255) NOT NULL,
  years_public_experience INT NOT NULL,

  -- Expertise and location
  industries TEXT[] DEFAULT ARRAY[]::TEXT[],     -- e.g., ['tech', 'finance', 'healthcare']
  regions TEXT[] DEFAULT ARRAY[]::TEXT[],         -- e.g., ['Toronto', 'San Francisco', 'London']

  -- Compensation expectations
  rate_expectations_annual INT,                   -- Annual retainer in USD
  rate_expectations_hourly INT,                   -- Hourly rate in USD

  -- Professional profile
  bio TEXT,
  past_board_positions JSONB DEFAULT '[]'::JSONB, -- Array of {title, company, years, description}
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],  -- e.g., ['CPA', 'CFA', 'Audit Committee Expertise']
  years_of_experience INT,

  -- Verification status
  verification_status VARCHAR(50) DEFAULT 'unverified', -- 'unverified', 'verified', 'rejected'
  verification_notes TEXT,
  verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Internal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_professionals_email ON professionals(email);
CREATE INDEX idx_professionals_verification_status ON professionals(verification_status);
CREATE INDEX idx_professionals_linkedin_verified ON professionals(linkedin_verified);
CREATE INDEX idx_professionals_industries ON professionals USING GIN(industries);
CREATE INDEX idx_professionals_regions ON professionals USING GIN(regions);

DROP TRIGGER IF EXISTS trigger_professionals_updated_at ON professionals;
CREATE TRIGGER trigger_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: PROFESSIONAL_INTRODUCTIONS
-- ====================================================================
-- Track introduction requests from companies to professionals

CREATE TABLE IF NOT EXISTS professional_introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Key relationships
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- Introduction details
  role_seeking VARCHAR(255) NOT NULL,             -- e.g., "Board Member - Audit Committee"
  message TEXT,                                   -- Introduction message to professional

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',           -- 'pending', 'accepted', 'rejected', 'hired', 'cancelled'
  introduction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,

  -- Communication thread (for later messaging system)
  message_thread_id UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_professional_introductions_professional_id ON professional_introductions(professional_id);
CREATE INDEX idx_professional_introductions_company_id ON professional_introductions(company_id);
CREATE INDEX idx_professional_introductions_status ON professional_introductions(status);
CREATE INDEX idx_professional_introductions_requested_by ON professional_introductions(requested_by_user_id);
CREATE INDEX idx_professional_introductions_created_at ON professional_introductions(created_at);

DROP TRIGGER IF EXISTS trigger_professional_introductions_updated_at ON professional_introductions;
CREATE TRIGGER trigger_professional_introductions_updated_at
  BEFORE UPDATE ON professional_introductions
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: HIRING_CONFIRMATIONS
-- ====================================================================
-- Anti-circumvention: Both company and professional must confirm hire details
-- Only when both confirm same compensation package is finders fee due

CREATE TABLE IF NOT EXISTS hiring_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Key relationships
  introduction_id UUID NOT NULL REFERENCES professional_introductions(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Hire details (must match for fee to be due)
  hire_date DATE NOT NULL,
  position VARCHAR(255) NOT NULL,                 -- e.g., "Audit Committee Member"

  -- Compensation package (JSONB to handle flexibility)
  -- Structure: {cash: 50000, bonus: 10000, equity: {shares: 1000, vesting_years: 4}}
  compensation_package JSONB NOT NULL,

  -- Fee calculations
  finders_fee_amount DECIMAL(15,2),               -- 2% of total comp (calculated)
  referral_commission_amount DECIMAL(15,2),       -- 10% of finders fee (calculated)

  -- Dual confirmation (anti-circumvention)
  confirmed_by_company BOOLEAN DEFAULT FALSE,
  confirmed_by_company_at TIMESTAMP WITH TIME ZONE,
  confirmed_by_company_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_compensation_package JSONB,             -- Company's version of comp

  confirmed_by_professional BOOLEAN DEFAULT FALSE,
  confirmed_by_professional_at TIMESTAMP WITH TIME ZONE,
  professional_compensation_package JSONB,        -- Professional's version of comp

  -- Payment tracking
  payment_status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'invoice_sent', 'paid', 'disputed'
  invoice_id UUID,                                -- Reference to billing invoice
  invoice_sent_at TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  payment_notes TEXT,

  -- Dispute resolution
  is_disputed BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  dispute_resolved_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hiring_confirmations_introduction_id ON hiring_confirmations(introduction_id);
CREATE INDEX idx_hiring_confirmations_professional_id ON hiring_confirmations(professional_id);
CREATE INDEX idx_hiring_confirmations_company_id ON hiring_confirmations(company_id);
CREATE INDEX idx_hiring_confirmations_payment_status ON hiring_confirmations(payment_status);
CREATE INDEX idx_hiring_confirmations_is_disputed ON hiring_confirmations(is_disputed);

DROP TRIGGER IF EXISTS trigger_hiring_confirmations_updated_at ON hiring_confirmations;
CREATE TRIGGER trigger_hiring_confirmations_updated_at
  BEFORE UPDATE ON hiring_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: PROFESSIONAL_REFERRALS
-- ====================================================================
-- Track referral commissions when one professional refers another

CREATE TABLE IF NOT EXISTS professional_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Referral relationship
  referrer_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,

  -- Link to the hiring confirmation that generated the referral fee
  hiring_confirmation_id UUID NOT NULL REFERENCES hiring_confirmations(id) ON DELETE CASCADE,

  -- Commission calculation (10% of finders fee)
  referral_commission DECIMAL(15,2) NOT NULL,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',           -- 'pending', 'earned', 'paid'
  earned_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_professional_referrals_referrer_id ON professional_referrals(referrer_id);
CREATE INDEX idx_professional_referrals_referred_id ON professional_referrals(referred_id);
CREATE INDEX idx_professional_referrals_hiring_confirmation_id ON professional_referrals(hiring_confirmation_id);
CREATE INDEX idx_professional_referrals_status ON professional_referrals(status);

DROP TRIGGER IF EXISTS trigger_professional_referrals_updated_at ON professional_referrals;
CREATE TRIGGER trigger_professional_referrals_updated_at
  BEFORE UPDATE ON professional_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- VIEW: PROFESSIONAL_MATCH_SCORING
-- ====================================================================
-- Calculate match scores for recommendations

CREATE OR REPLACE VIEW professional_match_scoring AS
SELECT
  p.id,
  p.name,
  p.professional_title,
  p.industries,
  p.regions,
  p.years_public_experience,
  p.verification_status,
  -- Match metrics (0-100)
  CASE WHEN p.years_public_experience >= 10 THEN 30 ELSE p.years_public_experience * 3 END as experience_score,
  CASE WHEN p.linkedin_verified THEN 20 ELSE 0 END as verification_score,
  p.rate_expectations_annual,
  p.created_at
FROM professionals
WHERE p.verification_status = 'verified';

-- ====================================================================
-- VIEW: HIRING_SUMMARY
-- ====================================================================
-- Summary view for hiring dashboard

CREATE OR REPLACE VIEW hiring_summary AS
SELECT
  hc.id,
  hc.professional_id,
  hc.company_id,
  p.name as professional_name,
  p.professional_title,
  c.name as company_name,
  hc.position,
  hc.hire_date,
  hc.compensation_package,
  hc.finders_fee_amount,
  hc.payment_status,
  hc.confirmed_by_company AND hc.confirmed_by_professional as both_confirmed,
  hc.is_disputed,
  hc.created_at
FROM hiring_confirmations hc
JOIN professionals p ON hc.professional_id = p.id
JOIN companies c ON hc.company_id = c.id;

-- ====================================================================
-- FUNCTION: VERIFY_AND_CALCULATE_FEES
-- ====================================================================
-- Calculates fees when both parties confirm hire details
-- Returns: {finders_fee: X, referral_commission: Y, status: 'match'/'dispute'}

CREATE OR REPLACE FUNCTION verify_and_calculate_fees(
  p_hiring_confirmation_id UUID
) RETURNS TABLE(
  finders_fee DECIMAL,
  referral_commission DECIMAL,
  match_status VARCHAR,
  error_message TEXT
) AS $$
DECLARE
  v_confirmation hiring_confirmations;
  v_comp_match BOOLEAN;
  v_finders_fee DECIMAL(15,2);
  v_referral_commission DECIMAL(15,2);
BEGIN
  -- Get confirmation record
  SELECT * INTO v_confirmation
  FROM hiring_confirmations
  WHERE id = p_hiring_confirmation_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::DECIMAL, NULL::DECIMAL, 'error'::VARCHAR, 'Hiring confirmation not found'::TEXT;
    RETURN;
  END IF;

  -- Check if both parties have confirmed
  IF NOT v_confirmation.confirmed_by_company OR NOT v_confirmation.confirmed_by_professional THEN
    RETURN QUERY SELECT NULL::DECIMAL, NULL::DECIMAL, 'pending'::VARCHAR, 'Waiting for one or both parties to confirm'::TEXT;
    RETURN;
  END IF;

  -- Compare compensation packages
  v_comp_match := (v_confirmation.company_compensation_package @> v_confirmation.professional_compensation_package)
    AND (v_confirmation.professional_compensation_package @> v_confirmation.company_compensation_package);

  IF v_comp_match THEN
    -- Calculate 2% finders fee based on total compensation
    v_finders_fee := (
      (CAST(v_confirmation.compensation_package->>'cash' AS DECIMAL) +
       CAST(COALESCE(v_confirmation.compensation_package->>'bonus', '0') AS DECIMAL)) * 0.02
    );

    -- Referral commission is 10% of finders fee
    v_referral_commission := v_finders_fee * 0.10;

    RETURN QUERY SELECT v_finders_fee, v_referral_commission, 'match'::VARCHAR, NULL::TEXT;
  ELSE
    -- Packages don't match - flag for dispute resolution
    RETURN QUERY SELECT NULL::DECIMAL, NULL::DECIMAL, 'dispute'::VARCHAR, 'Company and professional compensation packages do not match'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- SAMPLE SEED DATA
-- ====================================================================
-- 10-15 realistic professionals with varied experience and expertise

INSERT INTO professionals (
  name, email, phone, professional_title, years_public_experience,
  industries, regions, rate_expectations_annual, rate_expectations_hourly,
  bio, past_board_positions, certifications, years_of_experience,
  linkedin_verified, verification_status
) VALUES
-- 1. Tech board member - Toronto
('Sarah Chen', 'sarah.chen@example.com', '+1-416-555-0101', 'Board Director', 12,
ARRAY['Technology', 'SaaS', 'Cloud Computing'],
ARRAY['Toronto', 'San Francisco'],
75000, 350,
'Serial entrepreneur and board director with 12 years of public company experience. Specialized in technology scale-ups and enterprise software.',
'[
  {"title": "Board Director", "company": "TechScale Inc.", "years": 4, "description": "Led Audit Committee"},
  {"title": "Board Observer", "company": "CloudFirst Corp.", "years": 3}
]'::JSONB,
ARRAY['CPA', 'Chartered Director'],
22,
TRUE,
'verified'),

-- 2. Financial services expert - New York
('James Mitchell', 'james.mitchell@example.com', '+1-212-555-0102', 'Board Chair - Compensation', 15,
ARRAY['Finance', 'Banking', 'Investment Management'],
ARRAY['New York', 'Toronto'],
85000, 400,
'Former CFO of major financial institution. 15 years of public company board experience with focus on compensation and risk management.',
'[
  {"title": "Board Chair", "company": "GlobalFinance Ltd.", "years": 5, "description": "Chair of Compensation Committee"},
  {"title": "Board Director", "company": "FinServ Holdings", "years": 6}
]'::JSONB,
ARRAY['CFA', 'CPA', 'Risk Management Certification'],
28,
TRUE,
'verified'),

-- 3. Healthcare executive - San Francisco
('Dr. Lisa Nakamura', 'lisa.nakamura@example.com', '+1-415-555-0103', 'Board Director - Compliance', 11,
ARRAY['Healthcare', 'Biotech', 'Pharmaceuticals'],
ARRAY['San Francisco', 'Boston'],
65000, 320,
'MD and healthcare executive with 11 years of board experience. Deep expertise in regulatory compliance and clinical governance.',
'[
  {"title": "Board Director", "company": "BioGenix Corp.", "years": 4, "description": "Compliance Committee lead"},
  {"title": "Board Observer", "company": "HealthTech Ventures", "years": 2}
]'::JSONB,
ARRAY['MD', 'Healthcare Board Certification', 'Compliance Expert'],
25,
TRUE,
'verified'),

-- 4. Energy sector specialist - Calgary
('Michael Ross', 'michael.ross@example.com', '+1-403-555-0104', 'Board Director', 13,
ARRAY['Energy', 'Oil & Gas', 'Renewable Energy'],
ARRAY['Calgary', 'Houston', 'London'],
70000, 340,
'Energy sector veteran with 13 years of public board experience. Expertise in ESG transition and regulatory frameworks.',
'[
  {"title": "Board Director", "company": "EnergyCorp Ltd.", "years": 5},
  {"title": "Board Director", "company": "CleanEnergy Inc.", "years": 4, "description": "ESG Committee Chair"}
]'::JSONB,
ARRAY['PE (Professional Engineer)', 'ESG Certification'],
27,
TRUE,
'verified'),

-- 5. Real estate and infrastructure - Toronto
('Patricia Johnson', 'patricia.johnson@example.com', '+1-416-555-0105', 'Board Director - Audit', 9,
ARRAY['Real Estate', 'Infrastructure', 'Construction'],
ARRAY['Toronto', 'Vancouver'],
55000, 280,
'Real estate developer and board director with 9 years of public company experience. Strong audit and financial controls background.',
'[
  {"title": "Board Director", "company": "RealEstate Holdings", "years": 3, "description": "Audit Committee Chair"},
  {"title": "Board Member", "company": "Infrastructure Invest", "years": 3}
]'::JSONB,
ARRAY['CPA', 'Real Estate License'],
20,
TRUE,
'verified'),

-- 6. Consumer goods executive - London
('David Okafor', 'david.okafor@example.com', '+44-20-555-0106', 'Board Director', 10,
ARRAY['Consumer Goods', 'Retail', 'FMCG'],
ARRAY['London', 'Toronto', 'Amsterdam'],
72000, 360,
'Former CEO of multinational consumer goods company. 10 years of international board experience with focus on strategy and growth.',
'[
  {"title": "Board Director", "company": "Consumer Brands Global", "years": 4, "description": "Strategy Committee Chair"},
  {"title": "Board Director", "company": "Retail Networks Inc.", "years": 3}
]'::JSONB,
ARRAY['MBA (INSEAD)', 'International Trade Certification'],
26,
TRUE,
'verified'),

-- 7. Telecom & technology - Montreal
('Francoise Leblanc', 'francoise.leblanc@example.com', '+1-514-555-0107', 'Board Director - Governance', 14,
ARRAY['Telecommunications', 'Technology', 'Broadcasting'],
ARRAY['Montreal', 'Toronto', 'Paris'],
78000, 380,
'Telecom industry specialist with 14 years of board experience. Governance and regulatory expertise across North America and Europe.',
'[
  {"title": "Board Chair", "company": "TelecomCanada Inc.", "years": 5, "description": "Governance Committee Chair"},
  {"title": "Board Director", "company": "MediaTech Holdings", "years": 4}
]'::JSONB,
ARRAY['Chartered Director', 'Governance Certification', 'AICD'],
29,
TRUE,
'verified'),

-- 8. Logistics and supply chain - Singapore (with NA focus)
('Andrew Wong', 'andrew.wong@example.com', '+65-6-555-0108', 'Board Director', 8,
ARRAY['Logistics', 'Supply Chain', 'Transportation'],
ARRAY['Singapore', 'Toronto', 'Los Angeles'],
62000, 310,
'Supply chain executive with 8 years of board experience. Specialization in operational efficiency and digital transformation.',
'[
  {"title": "Board Member", "company": "LogisticsPlus Corp.", "years": 3},
  {"title": "Board Observer", "company": "SupplyChain Innovations", "years": 2}
]'::JSONB,
ARRAY['Logistics Certification', 'Six Sigma Black Belt'],
19,
TRUE,
'verified'),

-- 9. Mining and resources - Denver
('Robert MacLeod', 'robert.macleod@example.com', '+1-303-555-0109', 'Board Director', 12,
ARRAY['Mining', 'Resources', 'Metals'],
ARRAY['Denver', 'Toronto', 'Vancouver'],
68000, 330,
'Mining industry executive with 12 years of board experience. Expertise in operational excellence, environmental compliance, and M&A.',
'[
  {"title": "Board Director", "company": "MiningVentures Ltd.", "years": 4, "description": "Risk Committee Chair"},
  {"title": "Board Director", "company": "ResourcesCorp", "years": 4}
]'::JSONB,
ARRAY['Professional Engineer', 'Mining Certification'],
24,
TRUE,
'verified'),

-- 10. Software/SaaS founder - San Francisco
('Elena Rodriguez', 'elena.rodriguez@example.com', '+1-650-555-0110', 'Board Advisor', 7,
ARRAY['Software', 'SaaS', 'AI/ML'],
ARRAY['San Francisco', 'Austin', 'Toronto'],
80000, 400,
'Successful SaaS founder (sold company for $500M+). Now serves as board advisor and investor. Deep expertise in scaling technology companies.',
'[
  {"title": "Board Advisor", "company": "TechScale Ventures", "years": 3},
  {"title": "Investor Board Observer", "company": "AI Innovations Inc.", "years": 2}
]'::JSONB,
ARRAY['MBA (Stanford)', 'Venture Board Certification'],
21,
TRUE,
'verified'),

-- 11. Marketing and brand specialist - New York
('William Foster', 'william.foster@example.com', '+1-212-555-0111', 'Board Director', 9,
ARRAY['Marketing', 'Consumer Brand', 'Digital'],
ARRAY['New York', 'Los Angeles', 'Toronto'],
58000, 290,
'Former CMO of Fortune 500 company. 9 years of board experience in marketing, brand strategy, and digital transformation.',
'[
  {"title": "Board Member", "company": "BrandCorp Global", "years": 3, "description": "Marketing Committee Member"},
  {"title": "Board Observer", "company": "Digital Ventures", "years": 2}
]'::JSONB,
ARRAY['MBA (Harvard)', 'Marketing Leadership Certification'],
22,
TRUE,
'verified'),

-- 12. Manufacturing and operations - Detroit
('Katherine Miller', 'katherine.miller@example.com', '+1-313-555-0112', 'Board Director', 13,
ARRAY['Manufacturing', 'Industrial', 'Automotive'],
ARRAY['Detroit', 'Toronto'],
71000, 350,
'Operations executive with 13 years in automotive and industrial manufacturing boards. Lean manufacturing and continuous improvement expertise.',
'[
  {"title": "Board Director", "company": "ManufactureTech Inc.", "years": 5, "description": "Operations Committee Chair"},
  {"title": "Board Director", "company": "AutoSupply Holdings", "years": 4}
]'::JSONB,
ARRAY['PE (Professional Engineer)', 'Lean Certification', 'Six Sigma'],
26,
TRUE,
'verified'),

-- 13. Hospitality and tourism - Las Vegas
('Thomas Garcia', 'thomas.garcia@example.com', '+1-702-555-0113', 'Board Director', 10,
ARRAY['Hospitality', 'Travel', 'Entertainment'],
ARRAY['Las Vegas', 'Miami', 'Toronto'],
64000, 320,
'Hospitality industry leader with 10 years of board experience. Expertise in operations, customer experience, and real estate development.',
'[
  {"title": "Board Member", "company": "HospitalityGroup Inc.", "years": 3},
  {"title": "Board Observer", "company": "TravelCorp Ventures", "years": 3}
]'::JSONB,
ARRAY['Hotel Management Certification', 'Hospitality Leadership'],
23,
TRUE,
'verified'),

-- 14. Insurance and risk - Toronto
('Natasha Volkov', 'natasha.volkov@example.com', '+1-416-555-0114', 'Board Director - Risk', 11,
ARRAY['Insurance', 'Risk Management', 'Compliance'],
ARRAY['Toronto', 'Montreal'],
66000, 330,
'Insurance industry executive with 11 years of board experience. Specialization in risk management, regulatory compliance, and governance.',
'[
  {"title": "Board Director", "company": "InsurancePlus Ltd.", "years": 4, "description": "Risk Committee Chair"},
  {"title": "Board Director", "company": "RiskCorp Holdings", "years": 3}
]'::JSONB,
ARRAY['CRM (Certified Risk Manager)', 'Insurance License'],
25,
TRUE,
'verified'),

-- 15. Venture capital and private equity - Boston
('Christopher Young', 'christopher.young@example.com', '+1-617-555-0115', 'Board Director/Investor', 10,
ARRAY['Venture Capital', 'Private Equity', 'Investment'],
ARRAY['Boston', 'New York', 'Toronto'],
90000, 450,
'Successful venture investor and board director with 10 years of experience. Deep expertise in growth companies, M&A strategy, and fund management.',
'[
  {"title": "Board Director", "company": "VentureCapital Partners", "years": 5, "description": "Investment Committee Chair"},
  {"title": "Board Observer", "company": "Growth Equity Fund", "years": 3}
]'::JSONB,
ARRAY['CFA', 'MBA (MIT Sloan)', 'Venture Certification'],
28,
TRUE,
'verified');

-- Set all to verified status
UPDATE professionals SET linkedin_verified = TRUE WHERE linkedin_verified = FALSE;
