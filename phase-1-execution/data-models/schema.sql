/**
 * Capital Markets Intelligence Database Schema
 * Phase 1 Implementation
 *
 * Tables:
 * - companies: Core company data
 * - company_financials: Financial metrics (annual and quarterly)
 * - company_peers: Peer relationships and quality scores
 * - peer_benchmarks: Aggregated benchmarking data
 * - valuation_multiples: EV/Revenue, EV/EBITDA, etc.
 * - ipos: IPO tracking data
 * - financing_rounds: Capital raise tracking
 *
 * Status: Ready for deployment to PostgreSQL 15+
 * Target: Monday 6/9/2026
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COMPANIES TABLE
-- Core company data and metadata
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cik VARCHAR(10) NOT NULL UNIQUE,  -- SEC CIK number
    name VARCHAR(255) NOT NULL,
    ticker VARCHAR(10),
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(2),
    state VARCHAR(2),
    market_cap NUMERIC(19,2),  -- Current market cap in dollars
    founded_year INTEGER,
    public_date DATE,
    website VARCHAR(255),
    description TEXT,

    -- Metadata
    data_quality_score NUMERIC(3,1),  -- 0-100
    last_10k_date DATE,
    last_10q_date DATE,
    data_source VARCHAR(50),  -- 'SEC', 'Bloomberg', 'Manual'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_cik (cik),
    INDEX idx_ticker (ticker),
    INDEX idx_sector (sector),
    INDEX idx_public_date (public_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPANY_FINANCIALS TABLE
-- Annual and quarterly financial data from 10-K and 10-Q filings
-- ============================================================================

CREATE TABLE company_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,

    -- Period Information
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER,  -- 0 for annual, 1-4 for quarterly
    filing_type VARCHAR(10),  -- '10-K' or '10-Q'
    filing_date DATE NOT NULL,
    period_end_date DATE NOT NULL,

    -- Income Statement (in dollars)
    revenue NUMERIC(19,2),
    cost_of_revenue NUMERIC(19,2),
    gross_profit NUMERIC(19,2),
    operating_expenses NUMERIC(19,2),
    research_development NUMERIC(19,2),
    selling_general_admin NUMERIC(19,2),
    operating_income NUMERIC(19,2),
    interest_expense NUMERIC(19,2),
    other_income NUMERIC(19,2),
    income_before_taxes NUMERIC(19,2),
    income_tax_expense NUMERIC(19,2),
    net_income NUMERIC(19,2),

    -- Balance Sheet (in dollars)
    total_assets NUMERIC(19,2),
    current_assets NUMERIC(19,2),
    cash_and_equivalents NUMERIC(19,2),
    accounts_receivable NUMERIC(19,2),
    inventory NUMERIC(19,2),
    total_liabilities NUMERIC(19,2),
    current_liabilities NUMERIC(19,2),
    accounts_payable NUMERIC(19,2),
    short_term_debt NUMERIC(19,2),
    long_term_debt NUMERIC(19,2),
    stockholders_equity NUMERIC(19,2),
    common_stock NUMERIC(19,2),
    retained_earnings NUMERIC(19,2),

    -- Cash Flow (in dollars)
    operating_cash_flow NUMERIC(19,2),
    investing_cash_flow NUMERIC(19,2),
    financing_cash_flow NUMERIC(19,2),
    free_cash_flow NUMERIC(19,2),

    -- Calculated Metrics (%)
    gross_margin NUMERIC(5,2),  -- (Gross Profit / Revenue) * 100
    operating_margin NUMERIC(5,2),  -- (Operating Income / Revenue) * 100
    net_margin NUMERIC(5,2),  -- (Net Income / Revenue) * 100

    -- Ratios
    current_ratio NUMERIC(5,2),  -- Current Assets / Current Liabilities
    quick_ratio NUMERIC(5,2),  -- (Current Assets - Inventory) / Current Liabilities
    debt_to_equity NUMERIC(5,2),  -- Total Debt / Stockholders' Equity
    roe NUMERIC(5,2),  -- (Net Income / Stockholders' Equity) * 100
    roa NUMERIC(5,2),  -- (Net Income / Total Assets) * 100

    -- Additional
    employee_count INTEGER,
    shares_outstanding BIGINT,
    earnings_per_share NUMERIC(10,4),
    book_value_per_share NUMERIC(10,4),

    -- Data Quality
    data_quality_score NUMERIC(3,1),  -- 0-100 (how confident in this data)
    extraction_confidence NUMERIC(3,1),  -- 0-100 (how well extracted from filing)
    validation_status VARCHAR(20),  -- 'valid', 'warning', 'error'
    validation_notes TEXT,

    source VARCHAR(50),  -- 'SEC_10K', 'SEC_10Q', 'Bloomberg', 'Manual'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_period (company_id, fiscal_year, fiscal_quarter),

    INDEX idx_company_fiscal (company_id, fiscal_year DESC),
    INDEX idx_filing_date (filing_date DESC),
    INDEX idx_sector_period (company_id, fiscal_year),
    INDEX idx_net_income (net_income),
    INDEX idx_revenue (revenue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPANY_PEERS TABLE
-- Define peer relationships with quality scores
-- ============================================================================

CREATE TABLE company_peers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    peer_company_id UUID NOT NULL,

    -- Quality Score (1-5 stars)
    quality_score NUMERIC(2,1),  -- 1-5, how good of a match

    -- Matching Criteria (boolean)
    sector_match BOOLEAN,
    size_match BOOLEAN,  -- Revenue within 50%
    geography_match BOOLEAN,
    business_model_match BOOLEAN,

    -- Metadata
    reason TEXT,  -- Why they're peers (JSON: {revenue_match, sector_match, etc.})
    industry_group VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (peer_company_id) REFERENCES companies(id) ON DELETE CASCADE,

    UNIQUE KEY unique_peer_pair (company_id, peer_company_id),
    INDEX idx_company (company_id),
    INDEX idx_quality (quality_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PEER_BENCHMARKS TABLE
-- Aggregated metrics: sector average, peer median, company percentile
-- ============================================================================

CREATE TABLE peer_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    benchmark_date DATE NOT NULL,

    -- Metric Name
    metric_name VARCHAR(100),  -- 'revenue_growth', 'net_margin', 'ev_revenue', etc.

    -- Values
    your_value NUMERIC(19,2),
    peer_median NUMERIC(19,2),
    peer_25th_percentile NUMERIC(19,2),
    peer_75th_percentile NUMERIC(19,2),
    sector_average NUMERIC(19,2),
    sector_25th_percentile NUMERIC(19,2),
    sector_75th_percentile NUMERIC(19,2),

    -- Percentile (0-100, where your_value ranks)
    percentile_vs_peers NUMERIC(3,1),
    percentile_vs_sector NUMERIC(3,1),

    -- Direction
    trend_direction VARCHAR(10),  -- 'up', 'down', 'flat'
    trend_percentage NUMERIC(5,2),  -- YoY change %

    peer_count INTEGER,
    data_quality NUMERIC(3,1),  -- 0-100

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,

    UNIQUE KEY unique_benchmark (company_id, metric_name, benchmark_date),
    INDEX idx_company_date (company_id, benchmark_date DESC),
    INDEX idx_metric (metric_name),
    INDEX idx_percentile (percentile_vs_peers)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VALUATION_MULTIPLES TABLE
-- Track EV/Revenue, EV/EBITDA, P/E ratios
-- ============================================================================

CREATE TABLE valuation_multiples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    valuation_date DATE NOT NULL,

    -- Stock Price Data
    stock_price NUMERIC(10,4),
    shares_outstanding BIGINT,
    market_cap NUMERIC(19,2),

    -- Enterprise Value
    total_debt NUMERIC(19,2),
    cash NUMERIC(19,2),
    enterprise_value NUMERIC(19,2),  -- Market Cap + Total Debt - Cash

    -- Multiples
    ev_revenue NUMERIC(8,2),  -- Enterprise Value / Revenue
    ev_ebitda NUMERIC(8,2),  -- Enterprise Value / EBITDA
    pe_ratio NUMERIC(8,2),  -- Stock Price / EPS
    price_to_book NUMERIC(8,2),  -- Market Cap / Stockholders Equity

    -- Benchmarks
    peer_median_ev_revenue NUMERIC(8,2),
    peer_median_ev_ebitda NUMERIC(8,2),
    sector_average_ev_revenue NUMERIC(8,2),
    sector_average_ev_ebitda NUMERIC(8,2),

    -- Context
    trailing_twelve_month BOOLEAN,  -- TTM vs LTM
    data_source VARCHAR(50),  -- 'SEC', 'Yahoo', 'Bloomberg'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,

    INDEX idx_company_date (company_id, valuation_date DESC),
    INDEX idx_ev_revenue (ev_revenue),
    INDEX idx_pe_ratio (pe_ratio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- IPOS TABLE
-- IPO tracking and performance metrics
-- ============================================================================

CREATE TABLE ipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID,
    cik VARCHAR(10),
    company_name VARCHAR(255),
    ticker VARCHAR(10),

    -- Dates
    s1_filing_date DATE,
    pricing_date DATE,
    listing_date DATE,
    first_day_close DATE,

    -- IPO Details
    shares_offered BIGINT,
    price_per_share NUMERIC(10,4),
    ipo_valuation NUMERIC(19,2),  -- Share count * Price
    underwriters JSON,  -- ["Goldman Sachs", "JPMorgan", ...]
    sector VARCHAR(100),

    -- Performance
    first_day_return NUMERIC(5,2),  -- % return on day 1
    price_30d_close NUMERIC(10,4),
    price_90d_close NUMERIC(10,4),
    price_365d_close NUMERIC(10,4),
    return_30d NUMERIC(5,2),
    return_90d NUMERIC(5,2),
    return_365d NUMERIC(5,2),
    return_vs_sp500_30d NUMERIC(5,2),
    return_vs_sp500_90d NUMERIC(5,2),
    return_vs_sp500_365d NUMERIC(5,2),

    -- Status
    status VARCHAR(20),  -- 'filed', 'priced', 'listed', 'closed'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_pricing_date (pricing_date DESC),
    INDEX idx_sector (sector),
    INDEX idx_return_30d (return_30d),
    INDEX idx_return_90d (return_90d)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FINANCING_ROUNDS TABLE
-- Track capital raises for public companies
-- ============================================================================

CREATE TABLE financing_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID,
    company_name VARCHAR(255),
    ticker VARCHAR(10),

    -- Round Details
    announcement_date DATE,
    close_date DATE,
    round_type VARCHAR(50),  -- 'secondary', 'convertible', 'bought_deal', 'atm'

    -- Amounts
    amount_raised NUMERIC(19,2),
    price_per_share NUMERIC(10,4),
    shares_issued BIGINT,

    -- Terms
    valuation NUMERIC(19,2),  -- Implied or stated valuation
    investors JSON,  -- List of investors
    use_of_proceeds TEXT,

    -- Context
    sector VARCHAR(100),
    market_conditions VARCHAR(100),  -- 'bull', 'bear', 'neutral'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_announcement_date (announcement_date DESC),
    INDEX idx_close_date (close_date DESC),
    INDEX idx_amount (amount_raised)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATA_SYNC_LOG TABLE
-- Track when data was last synced from each source
-- ============================================================================

CREATE TABLE data_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50),  -- 'SEC_EDGAR', 'Bloomberg', 'Crunchbase', 'Yahoo'
    entity_type VARCHAR(50),  -- 'companies', 'financials', 'ipos'

    last_sync_at TIMESTAMP,
    record_count INTEGER,
    error_count INTEGER,
    status VARCHAR(20),  -- 'success', 'partial', 'failed'
    error_message TEXT,

    duration_seconds INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_source_date (source, last_sync_at DESC),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Most recent financials for each company
CREATE OR REPLACE VIEW v_latest_financials AS
SELECT cf.*,
       c.name as company_name,
       c.ticker,
       c.sector
FROM company_financials cf
JOIN companies c ON cf.company_id = c.id
WHERE (cf.company_id, cf.fiscal_year, cf.fiscal_quarter) IN (
    SELECT company_id, fiscal_year, fiscal_quarter
    FROM company_financials
    WHERE fiscal_quarter = 0  -- Annual only
    ORDER BY company_id, fiscal_year DESC
);

-- Company performance ranking
CREATE OR REPLACE VIEW v_company_rankings AS
SELECT
    cf.company_id,
    c.name,
    c.ticker,
    c.sector,
    cf.fiscal_year,
    cf.revenue,
    cf.revenue / LAG(cf.revenue) OVER (PARTITION BY cf.company_id ORDER BY cf.fiscal_year) - 1 as revenue_growth,
    cf.net_margin,
    cf.roe,
    cf.roa,
    RANK() OVER (PARTITION BY c.sector ORDER BY cf.net_margin DESC) as margin_rank_in_sector
FROM company_financials cf
JOIN companies c ON cf.company_id = c.id
WHERE cf.fiscal_quarter = 0;

-- ============================================================================
-- MIGRATION: Seed with test data (run separately)
-- ============================================================================

-- Insert 5 test companies for development
INSERT INTO companies (cik, name, ticker, sector, public_date) VALUES
('0000320193', 'Apple Inc.', 'AAPL', 'Technology', '1980-12-12'),
('0000789019', 'Microsoft Corporation', 'MSFT', 'Technology', '1986-03-13'),
('0000000050', 'Coca-Cola Company', 'KO', 'Consumer', '1919-01-29'),
('0001018724', 'Amazon.com Inc.', 'AMZN', 'Retail', '1997-05-15'),
('0000913142', 'Tesla Inc.', 'TSLA', 'Automotive', '2010-06-29')
ON CONFLICT DO NOTHING;
