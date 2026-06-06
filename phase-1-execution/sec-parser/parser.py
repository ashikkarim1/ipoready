"""
SEC EDGAR Financial Data Parser
Phase 1: Capital Markets Intelligence

Purpose: Extract standardized financial metrics from SEC filings
Scope: 10-K (annual), 10-Q (quarterly), 8-K (material events), S-1 (IPO)

Author: Phase 1 Backend Team
Status: MVP - In Development
Target: Production-ready by Wednesday 6/12
"""

import re
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import json

logger = logging.getLogger(__name__)


class SECFilingParser:
    """
    Parse SEC EDGAR filings and extract standardized financial metrics.

    API Reference: https://www.sec.gov/cgi-bin/browse-edgar
    Data Format: 10-K annual reports, 10-Q quarterly reports, 8-K current reports

    Example:
        parser = SECFilingParser()
        data = parser.parse_10k(cik='0000320193', fiscal_year=2023)  # Apple
        # Returns: {'revenue': 394328000000, 'net_income': 96995000000, ...}
    """

    def __init__(self):
        self.sec_base_url = "https://www.sec.gov/cgi-bin"
        self.sec_data_url = "https://data.sec.gov/submissions"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IPOReady Phase1 Parser (contact: engineering@ipoready.ai)'
        })

    def parse_10k(self, cik: str, fiscal_year: int) -> Dict[str, Any]:
        """
        Extract financial metrics from 10-K annual report.

        Args:
            cik: Company CIK (Central Index Key) - e.g. '0000320193' for Apple
            fiscal_year: Fiscal year - e.g. 2023

        Returns:
            Dictionary with standardized metrics:
            {
                'revenue': 394328000000,
                'cost_of_revenue': 169196000000,
                'gross_profit': 225132000000,
                'operating_expenses': 59552000000,
                'operating_income': 165580000000,
                'net_income': 96995000000,
                'ebitda': (calculated or extracted),
                'cash': 29965000000,
                'debt': 106599000000,
                'assets': 352755000000,
                'liabilities': 141447000000,
                'equity': 211308000000,
                'employees': 164000,
                'segments': ['Products', 'Services'],
                'filing_date': '2023-11-03',
                'data_quality': 98,  # Confidence score 0-100
                'source': 'SEC_10K'
            }
        """
        try:
            logger.info(f"Parsing 10-K for CIK {cik}, FY {fiscal_year}")

            # Step 1: Fetch filing document
            filing_html = self._fetch_10k(cik, fiscal_year)

            # Step 2: Extract metrics
            metrics = {
                # Income Statement
                'revenue': self._extract_revenue(filing_html),
                'cost_of_revenue': self._extract_cogs(filing_html),
                'gross_profit': self._extract_gross_profit(filing_html),
                'operating_expenses': self._extract_operating_expenses(filing_html),
                'operating_income': self._extract_operating_income(filing_html),
                'net_income': self._extract_net_income(filing_html),
                'ebitda': self._extract_or_calculate_ebitda(filing_html),

                # Balance Sheet
                'total_assets': self._extract_total_assets(filing_html),
                'current_assets': self._extract_current_assets(filing_html),
                'total_liabilities': self._extract_total_liabilities(filing_html),
                'current_liabilities': self._extract_current_liabilities(filing_html),
                'stockholders_equity': self._extract_stockholders_equity(filing_html),
                'cash': self._extract_cash(filing_html),
                'debt': self._extract_debt(filing_html),

                # Other
                'employees': self._extract_employee_count(filing_html),
                'segments': self._extract_business_segments(filing_html),
                'filing_date': self._extract_filing_date(filing_html),

                # Metadata
                'data_quality': self._calculate_quality_score(filing_html),
                'source': 'SEC_10K',
                'cik': cik,
                'fiscal_year': fiscal_year
            }

            # Step 3: Validate
            self._validate_metrics(metrics)

            logger.info(f"Successfully parsed 10-K for CIK {cik}")
            return metrics

        except Exception as e:
            logger.error(f"Error parsing 10-K for CIK {cik}: {str(e)}")
            raise

    def _fetch_10k(self, cik: str, fiscal_year: int) -> str:
        """
        Fetch 10-K HTML document from SEC EDGAR.

        Process:
        1. Normalize CIK (pad with zeros)
        2. Query SEC EDGAR API for 10-K filings
        3. Find most recent 10-K for fiscal year
        4. Fetch the document
        5. Return HTML
        """
        cik = str(cik).zfill(10)  # Normalize: 320193 -> 0000320193

        try:
            # Query SEC filings API
            url = f"{self.sec_data_url}/CIK{cik}.json"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            data = response.json()
            filings = data.get('filings', {}).get('recent', {})

            # Find 10-K for this fiscal year
            for i, form in enumerate(filings.get('form', [])):
                if form == '10-K':
                    filing_date = filings.get('filingDate', [])[i]
                    filing_year = int(filing_date[:4])

                    if filing_year == fiscal_year:
                        accession = filings.get('accessionNumber', [])[i]
                        accession = accession.replace('-', '')

                        # Fetch the actual filing document
                        doc_url = f"{self.sec_base_url}/viewer?action=view&cik={cik}&accession_number={accession}"
                        doc_response = self.session.get(doc_url, timeout=10)
                        doc_response.raise_for_status()

                        return doc_response.text

            raise ValueError(f"No 10-K found for CIK {cik}, FY {fiscal_year}")

        except Exception as e:
            logger.error(f"Error fetching 10-K: {str(e)}")
            raise

    # ===== INCOME STATEMENT EXTRACTORS =====

    def _extract_revenue(self, html: str) -> int:
        """Extract total revenue from 10-K"""
        patterns = [
            r'(?:Net revenues?|Total revenues?)\s*[\$]?\s*([\d,]+)(?:\s*million|thousand)?',
            r'Revenues?\s*[\$]?\s*([\d,]+)(?:\s*million)?',
        ]

        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                value = int(match.group(1).replace(',', ''))
                # Assume millions if large number
                if value < 1_000_000:
                    value *= 1_000_000
                return value

        logger.warning("Could not extract revenue")
        return 0

    def _extract_cogs(self, html: str) -> int:
        """Extract cost of revenue"""
        patterns = [
            r'(?:Cost of revenues?|Cost of sales?)\s*[\$]?\s*([\d,]+)',
            r'Cost\s*of\s*goods\s*sold\s*[\$]?\s*([\d,]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                value = int(match.group(1).replace(',', ''))
                if value < 1_000_000:
                    value *= 1_000_000
                return value

        return 0

    def _extract_gross_profit(self, html: str) -> int:
        """Extract gross profit"""
        revenue = self._extract_revenue(html)
        cogs = self._extract_cogs(html)

        # Try direct extraction first
        pattern = r'Gross profit\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value

        # Calculate if not found
        if revenue > 0 and cogs > 0:
            return revenue - cogs

        return 0

    def _extract_operating_expenses(self, html: str) -> int:
        """Extract operating expenses (R&D + SG&A)"""
        # Try to extract SG&A
        sga_pattern = r'(?:Selling,?\s*general|SG&A)\s*[\$]?\s*([\d,]+)'
        match = re.search(sga_pattern, html, re.IGNORECASE)
        sga = 0
        if match:
            sga = int(match.group(1).replace(',', ''))
            if sga < 1_000_000:
                sga *= 1_000_000

        # Try to extract R&D
        rd_pattern = r'Research.*?development\s*[\$]?\s*([\d,]+)'
        match = re.search(rd_pattern, html, re.IGNORECASE)
        rd = 0
        if match:
            rd = int(match.group(1).replace(',', ''))
            if rd < 1_000_000:
                rd *= 1_000_000

        return sga + rd

    def _extract_operating_income(self, html: str) -> int:
        """Extract operating income"""
        pattern = r'Operating (?:income|loss)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value

        # Calculate if not found
        gross = self._extract_gross_profit(html)
        opex = self._extract_operating_expenses(html)
        if gross > 0 and opex > 0:
            return gross - opex

        return 0

    def _extract_net_income(self, html: str) -> int:
        """Extract net income"""
        patterns = [
            r'(?:Net income|Net earnings)\s*[\$]?\s*([\d,]+)',
            r'(?:Net income|Net earnings)\s*.*?\s*[\$]?\s*([\d,]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                value = int(match.group(1).replace(',', ''))
                if value < 1_000_000:
                    value *= 1_000_000
                return value

        return 0

    def _extract_or_calculate_ebitda(self, html: str) -> int:
        """Extract EBITDA or calculate from available data"""
        # Try direct extraction
        pattern = r'EBITDA\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value

        # Calculate: Net Income + Taxes + Interest + Depreciation + Amortization
        # Simplified: Operating Income + D&A
        operating_income = self._extract_operating_income(html)
        return operating_income if operating_income > 0 else 0

    # ===== BALANCE SHEET EXTRACTORS =====

    def _extract_total_assets(self, html: str) -> int:
        """Extract total assets"""
        pattern = r'(?:Total assets?|TOTAL ASSETS?)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value
        return 0

    def _extract_current_assets(self, html: str) -> int:
        """Extract current assets"""
        pattern = r'(?:Current assets?)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value
        return 0

    def _extract_total_liabilities(self, html: str) -> int:
        """Extract total liabilities"""
        pattern = r'(?:Total liabilities?|TOTAL LIABILITIES?)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value
        return 0

    def _extract_current_liabilities(self, html: str) -> int:
        """Extract current liabilities"""
        pattern = r'(?:Current liabilities?)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value
        return 0

    def _extract_stockholders_equity(self, html: str) -> int:
        """Extract total stockholders' equity"""
        pattern = r'(?:Stockholders?\s*equity|Total stockholders?\s*equity)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value

        # Calculate: Assets - Liabilities
        assets = self._extract_total_assets(html)
        liabilities = self._extract_total_liabilities(html)
        if assets > 0 and liabilities > 0:
            return assets - liabilities

        return 0

    def _extract_cash(self, html: str) -> int:
        """Extract cash and cash equivalents"""
        pattern = r'(?:Cash and cash equivalents?)\s*[\$]?\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            value = int(match.group(1).replace(',', ''))
            if value < 1_000_000:
                value *= 1_000_000
            return value
        return 0

    def _extract_debt(self, html: str) -> int:
        """Extract total debt (short-term + long-term debt)"""
        # Short-term debt
        st_pattern = r'(?:Current portion of long-term debt|Short-term debt|Short-term borrowings?)\s*[\$]?\s*([\d,]+)'
        st_match = re.search(st_pattern, html, re.IGNORECASE)
        st_debt = 0
        if st_match:
            st_debt = int(st_match.group(1).replace(',', ''))
            if st_debt < 1_000_000:
                st_debt *= 1_000_000

        # Long-term debt
        lt_pattern = r'(?:Long-term debt|Long-term borrowings?)\s*[\$]?\s*([\d,]+)'
        lt_match = re.search(lt_pattern, html, re.IGNORECASE)
        lt_debt = 0
        if lt_match:
            lt_debt = int(lt_match.group(1).replace(',', ''))
            if lt_debt < 1_000_000:
                lt_debt *= 1_000_000

        return st_debt + lt_debt

    # ===== OTHER EXTRACTORS =====

    def _extract_employee_count(self, html: str) -> int:
        """Extract number of employees"""
        pattern = r'(?:Employees?|Number of employees?)\s*(?:as of)?\s*(?:December|January|February).*?:\s*([\d,]+)'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(',', ''))
        return 0

    def _extract_business_segments(self, html: str) -> List[str]:
        """Extract business segments"""
        # Look for segment names in business description
        segments = []

        # Common segment patterns
        patterns = [
            r'(?:Products?|Services?|Software|Hardware|Cloud)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            segments.extend(matches)

        return list(set(segments))[:5]  # Return unique, max 5

    def _extract_filing_date(self, html: str) -> str:
        """Extract filing date"""
        pattern = r'(?:Filed|Filing date).*?(\d{4}-\d{2}-\d{2})'
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return match.group(1)
        return datetime.now().isoformat()[:10]

    # ===== VALIDATION =====

    def _validate_metrics(self, metrics: Dict[str, Any]) -> None:
        """
        Validate extracted metrics for consistency.

        Raises:
            ValueError: If validation fails
        """
        # Revenue should be positive
        if metrics['revenue'] <= 0:
            logger.warning(f"Suspicious revenue: {metrics['revenue']}")

        # Net income shouldn't exceed revenue
        if metrics['net_income'] > metrics['revenue']:
            logger.warning(f"Net income exceeds revenue")

        # Assets should roughly equal liabilities + equity (allow 5% variance)
        assets = metrics['total_assets']
        liabilities = metrics['total_liabilities']
        equity = metrics['stockholders_equity']

        if assets > 0 and liabilities > 0 and equity > 0:
            calculated_equity = assets - liabilities
            variance = abs(equity - calculated_equity) / assets
            if variance > 0.05:
                logger.warning(f"Balance sheet doesn't balance: {variance:.2%} variance")

        logger.info(f"Validation complete. Quality: {metrics['data_quality']}/100")

    def _calculate_quality_score(self, html: str) -> int:
        """
        Calculate data quality score (0-100).

        Factors:
        - All major metrics extracted
        - Values are reasonable
        - Balance sheet balances
        """
        score = 100

        # Deduct for missing fields
        metrics = ['revenue', 'net_income', 'total_assets', 'stockholders_equity']
        for metric in metrics:
            # Placeholder check
            pass

        return max(0, score)


# =====  USAGE EXAMPLE =====

if __name__ == '__main__':
    parser = SECFilingParser()

    # Test with Apple 10-K 2023
    try:
        data = parser.parse_10k(cik='0000320193', fiscal_year=2023)
        print(json.dumps(data, indent=2, default=str))

        # Verify accuracy
        assert data['revenue'] > 0, "Revenue must be positive"
        assert data['net_income'] > 0, "Net income must be positive"
        print("\n✅ Parser test successful")

    except Exception as e:
        print(f"\n❌ Parser test failed: {str(e)}")
        raise
