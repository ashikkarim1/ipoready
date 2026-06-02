-- Seed prospectus data for test account (ACME Technology)
-- Test company ID: 2e31b75b-813f-48bf-a03f-2b2a0da0c0a9

-- Insert prospectus record
INSERT INTO prospectuses (
  company_id,
  exchange,
  status,
  completion_pct,
  sections_total,
  sections_complete,
  created_at,
  updated_at
) VALUES (
  '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'::uuid,
  'TSXV',
  'in_progress',
  42,
  12,
  5,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Get the prospectus ID
WITH prospectus_data AS (
  SELECT id FROM prospectuses 
  WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'::uuid
  LIMIT 1
)
INSERT INTO prospectus_sections (
  prospectus_id,
  title,
  section_number,
  status,
  created_at,
  updated_at
) 
SELECT 
  pd.id,
  section_data.title,
  section_data.section_number,
  section_data.status,
  NOW(),
  NOW()
FROM prospectus_data pd,
LATERAL (
  VALUES
    ('Company Overview', 1, 'completed'),
    ('Risk Factors', 2, 'completed'),
    ('Capitalization', 3, 'completed'),
    ('Use of Proceeds', 4, 'completed'),
    ('Management Discussion & Analysis', 5, 'completed'),
    ('Executive Compensation', 6, 'in_progress'),
    ('Litigation', 7, 'not_started'),
    ('Underwriters', 8, 'not_started'),
    ('Plan of Distribution', 9, 'not_started'),
    ('Description of Securities', 10, 'not_started'),
    ('Offering Details', 11, 'not_started'),
    ('Subsequent Events', 12, 'not_started')
) AS section_data(title, section_number, status)
ON CONFLICT DO NOTHING;

-- Add content to completed sections
WITH prospectus_data AS (
  SELECT id FROM prospectuses 
  WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'::uuid
  LIMIT 1
),
section_content AS (
  SELECT 
    ps.id,
    ps.section_number,
    CASE 
      WHEN ps.section_number = 1 THEN 'ACME Technology Corp. is a leading Health Tech platform providing AI-powered diagnostic solutions to hospitals and clinics across North America.'
      WHEN ps.section_number = 2 THEN 'The following risk factors should be considered by investors: regulatory changes, market competition, technology obsolescence, and key person dependencies.'
      WHEN ps.section_number = 3 THEN 'As of the date of this prospectus, the company has issued 10M common shares and has authorized but unissued shares reserved for future issuances.'
      WHEN ps.section_number = 4 THEN 'The net proceeds from this offering will be used for: 40% product development, 30% market expansion, 20% working capital, and 10% debt repayment.'
      WHEN ps.section_number = 5 THEN 'Our revenue grew 145% YoY to $18.2M in FY2024. EBITDA margin improved to 15% with continued investment in R&D and sales infrastructure.'
      WHEN ps.section_number = 6 THEN 'CEO: $500K salary + $200K bonus. CFO: $350K salary + $100K bonus. CTO: $400K salary + $150K bonus.'
    END as content
  FROM prospectuses p
  INNER JOIN prospectus_sections ps ON ps.prospectus_id = p.id
  WHERE p.company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'::uuid
  AND ps.section_number <= 6
)
INSERT INTO prospectus_section_content (
  section_id,
  content,
  version,
  created_at,
  updated_at
)
SELECT 
  sc.id,
  sc.content,
  1,
  NOW(),
  NOW()
FROM section_content sc
WHERE sc.content IS NOT NULL
ON CONFLICT DO NOTHING;
