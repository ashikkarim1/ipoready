const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedProspectus() {
  try {
    const companyId = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

    // Check if prospectus already exists
    const existing = await sql`
      SELECT id FROM prospectuses WHERE company_id = ${companyId}
    `;

    let prospectusId;
    
    if (existing.length === 0) {
      // Create prospectus record
      const prospectusResult = await sql`
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
          ${companyId},
          'TSXV',
          'in_progress',
          42,
          12,
          5,
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      
      prospectusId = prospectusResult[0].id;
      console.log('✅ Prospectus created with ID:', prospectusId);
    } else {
      prospectusId = existing[0].id;
      console.log('✅ Prospectus already exists with ID:', prospectusId);
      return;
    }

    // Create prospectus sections with sample content
    const sections = [
      {
        title: 'Company Overview',
        section_number: 1,
        status: 'completed',
        content: 'ACME Technology Corp. is a leading Health Tech platform providing AI-powered diagnostic solutions to hospitals and clinics across North America.'
      },
      {
        title: 'Risk Factors',
        section_number: 2,
        status: 'completed',
        content: 'The following risk factors should be considered by investors: regulatory changes, market competition, technology obsolescence, and key person dependencies.'
      },
      {
        title: 'Capitalization',
        section_number: 3,
        status: 'completed',
        content: 'As of the date of this prospectus, the company has issued 10M common shares and has authorized but unissued shares reserved for future issuances.'
      },
      {
        title: 'Use of Proceeds',
        section_number: 4,
        status: 'completed',
        content: 'The net proceeds from this offering will be used for: 40% product development, 30% market expansion, 20% working capital, and 10% debt repayment.'
      },
      {
        title: 'Management Discussion & Analysis',
        section_number: 5,
        status: 'completed',
        content: 'Our revenue grew 145% YoY to $18.2M in FY2024. EBITDA margin improved to 15% with continued investment in R&D and sales infrastructure.'
      },
      {
        title: 'Executive Compensation',
        section_number: 6,
        status: 'in_progress',
        content: 'CEO: $500K salary + $200K bonus. CFO: $350K salary + $100K bonus. CTO: $400K salary + $150K bonus.'
      },
      {
        title: 'Litigation',
        section_number: 7,
        status: 'not_started',
        content: null
      },
      {
        title: 'Underwriters',
        section_number: 8,
        status: 'not_started',
        content: null
      },
      {
        title: 'Plan of Distribution',
        section_number: 9,
        status: 'not_started',
        content: null
      },
      {
        title: 'Description of Securities',
        section_number: 10,
        status: 'not_started',
        content: null
      },
      {
        title: 'Offering Details',
        section_number: 11,
        status: 'not_started',
        content: null
      },
      {
        title: 'Subsequent Events',
        section_number: 12,
        status: 'not_started',
        content: null
      }
    ];

    for (const section of sections) {
      await sql`
        INSERT INTO prospectus_sections (
          prospectus_id,
          title,
          section_number,
          status,
          created_at,
          updated_at
        ) VALUES (
          ${prospectusId},
          ${section.title},
          ${section.section_number},
          ${section.status},
          NOW(),
          NOW()
        )
      `;

      if (section.content) {
        const sectionResult = await sql`
          SELECT id FROM prospectus_sections 
          WHERE prospectus_id = ${prospectusId} 
          AND section_number = ${section.section_number}
        `;

        const sectionId = sectionResult[0].id;

        await sql`
          INSERT INTO prospectus_section_content (
            section_id,
            content,
            version,
            created_at,
            updated_at
          ) VALUES (
            ${sectionId},
            ${section.content},
            1,
            NOW(),
            NOW()
          )
        `;
      }
    }

    console.log('✅ Prospectus sections created:');
    console.log('   - 5 completed sections (Company Overview, Risk Factors, Capitalization, Use of Proceeds, MD&A)');
    console.log('   - 1 in-progress section (Executive Compensation)');
    console.log('   - 6 not-started sections');
    console.log('✅ Overall prospectus completion: 42% (5 of 12 sections)');

  } catch (error) {
    console.error('❌ Error seeding prospectus:', error.message);
    process.exit(1);
  }
}

seedProspectus().then(() => {
  console.log('✅ Prospectus seeding complete!');
  process.exit(0);
});
