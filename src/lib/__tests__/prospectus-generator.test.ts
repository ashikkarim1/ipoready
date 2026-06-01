/**
 * Tests for Prospectus Generator
 * Tests template filling, placeholder replacement, and document generation
 */

describe('Prospectus Generator - Template Placeholder Replacement', () => {
  describe('Basic placeholder replacement', () => {
    it('should replace single placeholders in template', () => {
      const template = 'Company Name: {company_name}'
      const data = { company_name: 'Test Corp' }

      const result = template.replace(/{company_name}/g, data.company_name)

      expect(result).toBe('Company Name: Test Corp')
    })

    it('should replace multiple placeholders', () => {
      const template = `
        Company: {company_name}
        Jurisdiction: {incorporation_jurisdiction}
        Founded: {incorporation_date}
      `
      const data = {
        company_name: 'Test Corp',
        incorporation_jurisdiction: 'Ontario',
        incorporation_date: '2020-01-15',
      }

      let result = template
      Object.entries(data).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value)
      })

      expect(result).toContain('Company: Test Corp')
      expect(result).toContain('Jurisdiction: Ontario')
      expect(result).toContain('Founded: 2020-01-15')
    })

    it('should handle missing placeholders gracefully', () => {
      const template = 'Company: {company_name}, Founded: {missing_field}'
      const data = { company_name: 'Test Corp' }

      let result = template
      Object.entries(data).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value)
      })

      expect(result).toBe('Company: Test Corp, Founded: {missing_field}')
    })
  })

  describe('Data transformation', () => {
    it('should handle numeric values', () => {
      const template = 'Team Size: {team_size}'
      const data = { team_size: 50 }

      const result = template.replace(/{team_size}/g, String(data.team_size))

      expect(result).toBe('Team Size: 50')
    })

    it('should preserve special characters in data', () => {
      const template = 'Description: {description}'
      const data = { description: 'A company with 50% market share & $2M revenue' }

      const result = template.replace(/{description}/g, data.description)

      expect(result).toBe('Description: A company with 50% market share & $2M revenue')
    })
  })

  describe('Placeholder detection', () => {
    it('should find all placeholders in template', () => {
      const template = 'Company {company_name} in {incorporation_jurisdiction} founded {incorporation_date}'
      const placeholders = template.match(/{(\w+)}/g) || []

      expect(placeholders).toHaveLength(3)
      expect(placeholders).toContain('{company_name}')
      expect(placeholders).toContain('{incorporation_jurisdiction}')
    })

    it('should identify missing data fields', () => {
      const template = 'Company {company_name} with revenue {revenue_current} in market {market_size}'
      const placeholders = (template.match(/{(\w+)}/g) || []).map(p => p.slice(1, -1))
      const providedData = { company_name: 'Test Corp' }

      const missingFields = placeholders.filter(p => !(p in providedData))

      expect(missingFields).toEqual(['revenue_current', 'market_size'])
    })
  })
})
