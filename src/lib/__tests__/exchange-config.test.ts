/**
 * Exchange Configuration System Tests
 */

import {
  EXCHANGE_CONFIGS,
  getExchangeConfig,
  getAllExchangeConfigs,
  filterExchanges,
  compareExchanges,
} from '../exchange-config';

describe('Exchange Configuration System', () => {
  describe('EXCHANGE_CONFIGS', () => {
    it('should have configurations for all 5 exchanges', () => {
      const exchangeIds = Object.keys(EXCHANGE_CONFIGS);
      expect(exchangeIds).toHaveLength(5);
      expect(exchangeIds).toContain('TSX');
      expect(exchangeIds).toContain('TSXV');
      expect(exchangeIds).toContain('NASDAQ');
      expect(exchangeIds).toContain('NYSE');
      expect(exchangeIds).toContain('CSE');
    });

    it('should have complete configuration for TSX', () => {
      const tsx = EXCHANGE_CONFIGS.TSX;
      expect(tsx.id).toBe('TSX');
      expect(tsx.name).toBe('Toronto Stock Exchange');
      expect(tsx.country).toBe('Canada');
      expect(tsx.currency).toBe('CAD');
      expect(tsx.minFloat).toBe(25);
      expect(tsx.boardLot).toBe(100);
      expect(tsx.prospectusFormat.formName).toBe('41-101F1');
      expect(tsx.cusip.required).toBe(true);
    });

    it('should have complete configuration for NASDAQ', () => {
      const nasdaq = EXCHANGE_CONFIGS.NASDAQ;
      expect(nasdaq.id).toBe('NASDAQ');
      expect(nasdaq.name).toBe('NASDAQ Stock Market');
      expect(nasdaq.country).toBe('United States');
      expect(nasdaq.currency).toBe('USD');
      expect(nasdaq.minFloat).toBe(40);
      expect(nasdaq.prospectusFormat.formName).toBe('Form S-1');
    });

    it('should have greenShoe configurations for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.greenShoe).toBeDefined();
        expect(exchange.greenShoe.permitted).toBe(true);
        expect(exchange.greenShoe.maxPercentage).toBeGreaterThan(0);
        expect(exchange.greenShoe.exercisePeriodDays).toBeGreaterThan(0);
      });
    });

    it('should have CUSIP support for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.cusip).toBeDefined();
        expect(exchange.cusip.required).toBe(true);
        expect(exchange.cusip.issuerPrefixLength).toBe(8);
        expect(exchange.cusip.securitySuffixLength).toBe(2);
      });
    });

    it('should have resolution types for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.resolutionTypes.length).toBeGreaterThan(0);
        expect(
          exchange.resolutionTypes.some((r) => r.name === 'Ordinary Resolution')
        ).toBe(true);
      });
    });

    it('should have consent requirements for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.consentRequirements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getExchangeConfig()', () => {
    it('should return TSX configuration', () => {
      const config = getExchangeConfig('TSX');
      expect(config.id).toBe('TSX');
      expect(config.name).toBe('Toronto Stock Exchange');
    });

    it('should return NASDAQ configuration', () => {
      const config = getExchangeConfig('NASDAQ');
      expect(config.id).toBe('NASDAQ');
      expect(config.country).toBe('United States');
    });

    it('should return TSXV configuration', () => {
      const config = getExchangeConfig('TSXV');
      expect(config.id).toBe('TSXV');
      expect(config.minFloat).toBe(10);
    });

    it('should return NYSE configuration', () => {
      const config = getExchangeConfig('NYSE');
      expect(config.governance.independentDirectorPercentage).toBe(100);
    });

    it('should return CSE configuration', () => {
      const config = getExchangeConfig('CSE');
      expect(config.minFloat).toBe(5);
      expect(config.costs.listingFee).toBe(0.05);
    });

    it('should throw error for unknown exchange', () => {
      expect(() => {
        getExchangeConfig('UNKNOWN' as any);
      }).toThrow('Unknown exchange: UNKNOWN');
    });
  });

  describe('getAllExchangeConfigs()', () => {
    it('should return all 5 exchanges', () => {
      const configs = getAllExchangeConfigs();
      expect(configs).toHaveLength(5);
    });

    it('should return array of ExchangeConfig objects', () => {
      const configs = getAllExchangeConfigs();
      configs.forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.minFloat).toBeDefined();
      });
    });
  });

  describe('filterExchanges()', () => {
    it('should filter by country (Canada)', () => {
      const canadian = filterExchanges({ country: 'Canada' });
      expect(canadian).toHaveLength(3);
      expect(canadian.map((e) => e.id)).toEqual(['TSX', 'TSXV', 'CSE']);
    });

    it('should filter by country (United States)', () => {
      const us = filterExchanges({ country: 'United States' });
      expect(us).toHaveLength(2);
      expect(us.map((e) => e.id)).toEqual(['NASDAQ', 'NYSE']);
    });

    it('should filter by currency (CAD)', () => {
      const cad = filterExchanges({ currency: 'CAD' });
      expect(cad).toHaveLength(3);
    });

    it('should filter by currency (USD)', () => {
      const usd = filterExchanges({ currency: 'USD' });
      expect(usd).toHaveLength(2);
    });

    it('should filter by minFloat', () => {
      const highFloat = filterExchanges({ minFloat: 25 });
      expect(highFloat).toHaveLength(2); // TSX and NASDAQ
    });

    it('should apply multiple filters', () => {
      const filtered = filterExchanges({
        country: 'Canada',
        minFloat: 10,
      });
      expect(filtered).toHaveLength(2); // TSX and TSXV
      expect(filtered.map((e) => e.id)).toEqual(['TSX', 'TSXV']);
    });
  });

  describe('compareExchanges()', () => {
    it('should compare TSX and NASDAQ', () => {
      const comparison = compareExchanges('TSX', 'NASDAQ');
      expect(comparison.minFloat).toBeDefined();
      expect(comparison.minFloat.exchange1).toBe(25);
      expect(comparison.minFloat.exchange2).toBe(40);
    });

    it('should compare TSX and TSXV', () => {
      const comparison = compareExchanges('TSX', 'TSXV');
      expect(comparison.listingFee.exchange1).toBe(0.5);
      expect(comparison.listingFee.exchange2).toBe(0.15);
    });

    it('should include timeline comparison', () => {
      const comparison = compareExchanges('NASDAQ', 'NYSE');
      expect(comparison.timeline).toBeDefined();
      expect(comparison.timeline.exchange1).toContain('months');
      expect(comparison.timeline.exchange2).toContain('months');
    });

    it('should include governance comparison', () => {
      const comparison = compareExchanges('TSX', 'NYSE');
      expect(comparison.minDirectors).toBeDefined();
      expect(comparison.requiredCommittees).toBeDefined();
    });
  });

  describe('Prospectus Formats', () => {
    it('should have 41-101F1 for TSX', () => {
      const tsx = getExchangeConfig('TSX');
      expect(tsx.prospectusFormat.formName).toBe('41-101F1');
    });

    it('should have 41-101F2 for TSXV', () => {
      const tsxv = getExchangeConfig('TSXV');
      expect(tsxv.prospectusFormat.formName).toBe('41-101F2');
    });

    it('should have Form S-1 for NASDAQ and NYSE', () => {
      const nasdaq = getExchangeConfig('NASDAQ');
      const nyse = getExchangeConfig('NYSE');
      expect(nasdaq.prospectusFormat.formName).toBe('Form S-1');
      expect(nyse.prospectusFormat.formName).toBe('Form S-1');
    });

    it('should have required sections for each prospectus', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.prospectusFormat.requiredSections.length).toBeGreaterThan(0);
        expect(exchange.prospectusFormat.typicalPageRange[0]).toBeGreaterThan(0);
        expect(exchange.prospectusFormat.typicalPageRange[1]).toBeGreaterThan(
          exchange.prospectusFormat.typicalPageRange[0]
        );
      });
    });
  });

  describe('Trading Specifications', () => {
    it('should have trading hours for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.trading.operatingHours.open).toBeDefined();
        expect(exchange.trading.operatingHours.close).toBeDefined();
        expect(exchange.trading.operatingHours.timezone).toBeDefined();
      });
    });

    it('should have tick sizes for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.trading.tickSizes.length).toBeGreaterThan(0);
      });
    });

    it('should have circuit breaker levels for all exchanges', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        const cb = exchange.trading.circuitBreakers;
        expect(cb.level1PercentageDown).toBeGreaterThan(0);
        expect(cb.level2PercentageDown).toBeGreaterThan(cb.level1PercentageDown);
        expect(cb.level3PercentageDown).toBeGreaterThan(cb.level2PercentageDown);
      });
    });
  });

  describe('Governance Requirements', () => {
    it('NYSE should require 100% independent directors', () => {
      const nyse = getExchangeConfig('NYSE');
      expect(nyse.governance.independentDirectorPercentage).toBe(100);
    });

    it('TSX should require 50% independent directors', () => {
      const tsx = getExchangeConfig('TSX');
      expect(tsx.governance.independentDirectorPercentage).toBe(50);
    });

    it('TSXV should allow minimal governance', () => {
      const tsxv = getExchangeConfig('TSXV');
      expect(tsxv.governance.minDirectors).toBe(1);
      expect(tsxv.governance.requiredCommittees).toHaveLength(0);
    });

    it('CSE should have minimal governance requirements', () => {
      const cse = getExchangeConfig('CSE');
      expect(cse.governance.minDirectors).toBe(1);
      expect(cse.governance.independentDirectorPercentage).toBe(0);
    });
  });

  describe('Cost Analysis', () => {
    it('should have realistic cost estimates', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.costs.listingFee).toBeGreaterThan(0);
        expect(exchange.costs.auditCosts).toBeGreaterThan(0);
        expect(exchange.costs.legalCosts).toBeGreaterThan(0);
      });
    });

    it('NYSE should have higher costs than CSE', () => {
      const nyse = getExchangeConfig('NYSE');
      const cse = getExchangeConfig('CSE');
      expect(nyse.costs.legalCosts).toBeGreaterThan(cse.costs.legalCosts);
    });

    it('should have underwriting fees as percentage range', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        const [min, max] = exchange.costs.underwritingFeesPercent;
        expect(min).toBeGreaterThan(0);
        expect(max).toBeGreaterThan(min);
        expect(max).toBeLessThan(20);
      });
    });
  });

  describe('Timeline Estimates', () => {
    it('should have realistic timelines', () => {
      Object.values(EXCHANGE_CONFIGS).forEach((exchange) => {
        expect(exchange.timeline.minMonths).toBeGreaterThan(0);
        expect(exchange.timeline.expectedMonths).toBeGreaterThanOrEqual(
          exchange.timeline.minMonths
        );
        expect(exchange.timeline.maxMonths).toBeGreaterThanOrEqual(
          exchange.timeline.expectedMonths
        );
      });
    });

    it('CSE should be fastest', () => {
      const cse = getExchangeConfig('CSE');
      const all = getAllExchangeConfigs();
      const allExpectedMonths = all.map((e) => e.timeline.expectedMonths);
      expect(cse.timeline.expectedMonths).toBeLessThanOrEqual(
        Math.min(...allExpectedMonths)
      );
    });
  });
});
