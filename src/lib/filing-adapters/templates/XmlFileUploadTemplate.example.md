# XML File Upload Adapter Template - Usage Guide

## Overview

This template provides a complete structure for integrating with regulatory authorities that require file-based submissions via SFTP/FTP instead of HTTP APIs. Documents are converted to XML format and uploaded to a secure file transfer server.

## When to Use This Template

Use this template when:
- Regulatory authority provides SFTP/FTP server for submissions (not HTTP API)
- Documents must be in XML or XBRL format
- Batch file uploads are required
- Status is tracked via file polling (not webhooks)
- Legacy regulatory systems with EDI-style submissions

**Example Jurisdictions:**
- EU regulators (ESMA, national financial authorities)
- Hong Kong, Singapore, Malaysia regulatory portals
- Some Asian exchanges with XBRL requirements
- Government agencies with file-based filing systems

## Implementation Steps (4 hours)

### Step 1: Copy and Customize Template (15 minutes)

```bash
cp src/lib/filing-adapters/templates/XmlFileUploadTemplate.ts \
   src/lib/filing-adapters/EUESMAAdapter.ts
```

### Step 2: Configure SFTP Credentials (30 minutes)

Get credentials from your regulatory authority (EU ESMA example):

```bash
# .env.example

# EU ESMA Adapter - SFTP Configuration
FILE_TRANSFER_HOST=sftp.esma.europa.eu
FILE_TRANSFER_PORT=22
FILE_TRANSFER_USERNAME=your_company_code
FILE_TRANSFER_PRIVATE_KEY_PATH=/path/to/sftp_key.pem
FILE_TRANSFER_INBOUND_PATH=/incoming/prospectuses
FILE_TRANSFER_OUTBOUND_PATH=/processed/acknowledgments
FILE_TRANSFER_ARCHIVE_PATH=/archive

# SFTP SSH private key passphrase (if key is encrypted)
FILE_TRANSFER_PRIVATE_KEY_PASSPHRASE=your_passphrase_here
```

### Step 3: Define XML Schema (30 minutes)

Update the XML schema configuration to match regulatory requirements:

```typescript
// EUESMAAdapter.ts

class EUESMAAdapter extends XmlFileUploadTemplate {
  constructor() {
    super();
    
    this.setXmlSchemaConfig({
      namespace: 'http://www.esma.europa.eu/regulatory-reporting/2024',
      schemaLocation: 'http://www.esma.europa.eu/schema/prospectus-2.0.xsd',
      rootElement: 'prospectusSubmission',
      version: '2.0',
      validationRequired: true,
    });
  }
}
```

### Step 4: Implement XML Generation (1 hour)

Customize the XML generation methods to match your schema:

```typescript
// EUESMAAdapter.ts - Override XML generation methods

private generateProspectusXml(doc: DocumentMetadata): string {
  // Parse document content
  const prospectusData = JSON.parse(doc.content as string);

  return `
  <prospectus>
    <prospectusHeader>
      <submissionID>${prospectusData.companyId}</submissionID>
      <companyName>${prospectusData.companyName}</companyName>
      <regulatoryApprovalRequired>true</regulatoryApprovalRequired>
      <prospectusType>${prospectusData.type || 'EU_PROSPECTUS'}</prospectusType>
      <currencyOfProspectus>EUR</currencyOfProspectus>
    </prospectusHeader>
    <prospectusBody>
      <documentTitle>
        ${this.escapeXmlText(prospectusData.title || 'Prospectus')}
      </documentTitle>
      <issuerInformation>
        <issuerName>${this.escapeXmlText(prospectusData.issuerName)}</issuerName>
        <issuerCountry>${prospectusData.country}</issuerCountry>
        <issuerJurisdiction>${prospectusData.jurisdiction}</issuerJurisdiction>
        <centralIndexKey>${prospectusData.cik || ''}</centralIndexKey>
      </issuerInformation>
      <summaryInformation>
        ${this.escapeXmlText((prospectusData.summary || '').substring(0, 2000))}
      </summaryInformation>
      <riskFactors>
        ${this.escapeXmlText((prospectusData.riskFactors || '').substring(0, 10000))}
      </riskFactors>
      <managementAndBoards>
        <boardMembers>
          ${(prospectusData.boardMembers || [])
            .map((member: any) => `
          <boardMember>
            <name>${this.escapeXmlText(member.name)}</name>
            <position>${this.escapeXmlText(member.position)}</position>
            <experience>${this.escapeXmlText(member.experience || '')}</experience>
          </boardMember>`)
            .join('')}
        </boardMembers>
      </managementAndBoards>
      <capitalStructure>
        <sharesOutstanding>${prospectusData.sharesOutstanding || 0}</sharesOutstanding>
        <sharePrice>${prospectusData.sharePrice || 0}</sharePrice>
        <marketCapitalization>${prospectusData.marketCap || 0}</marketCapitalization>
      </capitalStructure>
      <content>
        ${this.escapeXmlText(String(doc.content).substring(0, 50000))}
      </content>
    </prospectusBody>
  </prospectus>`;
}

private generateFinancialStatementsXml(doc: DocumentMetadata): string {
  const financialData = JSON.parse(doc.content as string);

  return `
  <financialStatements>
    <accountingStandard>IFRS</accountingStandard>
    <auditStatus>AUDITED</auditStatus>
    <fiscalYear>${financialData.fiscalYear}</fiscalYear>
    <fiscalPeriodEndDate>${financialData.endDate}</fiscalPeriodEndDate>
    <balanceSheet>
      <totalAssets>${financialData.totalAssets || 0}</totalAssets>
      <totalLiabilities>${financialData.totalLiabilities || 0}</totalLiabilities>
      <equityValue>${financialData.equityValue || 0}</equityValue>
    </balanceSheet>
    <incomeStatement>
      <revenue>${financialData.revenue || 0}</revenue>
      <operatingIncome>${financialData.operatingIncome || 0}</operatingIncome>
      <netIncome>${financialData.netIncome || 0}</netIncome>
    </incomeStatement>
    <cashFlowStatement>
      <operatingCashFlow>${financialData.operatingCashFlow || 0}</operatingCashFlow>
      <investingCashFlow>${financialData.investingCashFlow || 0}</investingCashFlow>
      <financingCashFlow>${financialData.financingCashFlow || 0}</financingCashFlow>
    </cashFlowStatement>
  </financialStatements>`;
}
```

### Step 5: Implement XML Validation (30 minutes)

Add XSD schema validation using a library:

```bash
npm install xsd
```

```typescript
// EUESMAAdapter.ts

import { validate } from 'xsd';

private async validateXmlSchema(
  xmlContent: string,
  documentType: DocumentType
): Promise<boolean> {
  try {
    // Fetch XSD schema
    const schemaUrl = this.xmlSchemaConfig.schemaLocation;
    const response = await fetch(schemaUrl);
    const schemaContent = await response.text();

    // Validate XML against schema
    const validationResult = validate(xmlContent, schemaContent);

    if (!validationResult.valid) {
      this.logWarn('XML schema validation failed', {
        documentType,
        errors: validationResult.errors,
      });
      return false;
    }

    this.logDebug('XML schema validation passed', { documentType });
    return true;
  } catch (error) {
    this.logError('XML schema validation error', {
      error: error instanceof Error ? error.message : String(error),
      documentType,
    });
    // Don't fail - fall back to basic validation
    return true;
  }
}
```

### Step 6: Implement SFTP Upload (45 minutes)

Install SFTP library and implement file upload:

```bash
npm install ssh2
```

```typescript
// EUESMAAdapter.ts

import Client from 'ssh2';
import fs from 'fs';
import { promisify } from 'util';

private async uploadFilesToServer(
  stagedFiles: string[],
  manifestPath: string,
  submissionId: string
): Promise<FileSubmissionResponse> {
  return new Promise((resolve, reject) => {
    const client = new Client();

    client.on('ready', async () => {
      try {
        const sftp = promisify(client.sftp.bind(client))();

        // Create submission directory on server
        const remoteDir = `${this.fileTransferConfig.inboundPath}/${submissionId}`;
        await this.createRemoteDirectory(sftp, remoteDir);

        // Upload each file
        for (const filePath of [...stagedFiles, manifestPath]) {
          const fileName = path.basename(filePath);
          const remotePath = `${remoteDir}/${fileName}`;

          this.logDebug('Uploading file', {
            localPath: filePath,
            remotePath,
          });

          await promisify(sftp.fastPut.bind(sftp))(filePath, remotePath);
        }

        this.logInfo('All files uploaded successfully', {
          submissionId,
          fileCount: stagedFiles.length + 1, // Include manifest
        });

        client.end();

        resolve({
          submissionId,
          fileName: path.basename(manifestPath),
          uploadPath: remoteDir,
          timestamp: new Date(),
          estimatedProcessingTime: 24 * 60 * 60 * 1000,
          acknowledgeFilePath: `${this.fileTransferConfig.outboundPath}/${submissionId}-ack.xml`,
          statusPollInterval: 5 * 60 * 1000,
        });
      } catch (error) {
        client.end();
        reject(error);
      }
    });

    client.on('error', reject);

    client.connect({
      host: this.fileTransferConfig.host,
      port: this.fileTransferConfig.port,
      username: this.fileTransferConfig.username,
      privateKey: fs.readFileSync(
        this.fileTransferConfig.privateKeyPath!
      ),
      passphrase: this.fileTransferConfig.privateKeyPassphrase,
      readyTimeout: this.fileTransferConfig.connectionTimeoutMs,
    });
  });
}

private async createRemoteDirectory(
  sftp: any,
  dirPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.mkdir(dirPath, (err: any) => {
      if (err && err.code !== 2) { // Ignore "directory already exists" error
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
```

### Step 7: Implement Status Polling (30 minutes)

Check for acknowledgment files on the SFTP server:

```typescript
// EUESMAAdapter.ts

private async downloadStatusFile(filePath: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const client = new Client();

    client.on('ready', async () => {
      try {
        const sftp = promisify(client.sftp.bind(client))();
        
        // Check if file exists
        const stat = await promisify(sftp.stat.bind(sftp))(filePath).catch(
          () => null
        );

        if (!stat) {
          client.end();
          resolve(null); // File doesn't exist yet
          return;
        }

        // Download file content
        const chunks: Buffer[] = [];
        const stream = sftp.createReadStream(filePath);

        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          client.end();
          resolve(Buffer.concat(chunks).toString('utf-8'));
        });
        stream.on('error', reject);
      } catch (error) {
        client.end();
        reject(error);
      }
    });

    client.on('error', reject);

    client.connect({
      host: this.fileTransferConfig.host,
      port: this.fileTransferConfig.port,
      username: this.fileTransferConfig.username,
      privateKey: fs.readFileSync(
        this.fileTransferConfig.privateKeyPath!
      ),
    });
  });
}

private parseStatusFile(fileContent: string): {
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn';
  timestamp: string;
  comments: string[];
  rejectionReasons: string[];
} {
  try {
    // Parse XML acknowledgment file
    // You might use xml2js for this
    // Example XML:
    // <acknowledgment>
    //   <status>ACCEPTED</status>
    //   <timestamp>2024-06-04T10:30:00Z</timestamp>
    //   <filingId>SUB-2024-001</filingId>
    // </acknowledgment>

    const statusMatch = fileContent.match(/<status>([^<]+)<\/status>/);
    const timestampMatch = fileContent.match(/<timestamp>([^<]+)<\/timestamp>/);
    const reasonMatches = fileContent.match(/<reason>([^<]+)<\/reason>/g);

    const statusMap: Record<string, any> = {
      'PENDING': 'submitted',
      'PROCESSING': 'processing',
      'ACCEPTED': 'accepted',
      'REJECTED': 'rejected',
      'WITHDRAWN': 'withdrawn',
    };

    return {
      status: statusMap[statusMatch?.[1] || 'PENDING'] || 'processing',
      timestamp: timestampMatch?.[1] || new Date().toISOString(),
      comments: [],
      rejectionReasons: (reasonMatches || []).map((r: string) =>
        r.replace(/<\/?reason>/g, '')
      ),
    };
  } catch (error) {
    this.logError('Status file parsing failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new FilingError(
      'STATUS_PARSE_FAILED',
      'Failed to parse status file',
      false,
      400
    );
  }
}
```

### Step 8: Create Status Polling Service (30 minutes)

Implement regular polling for filing status:

```typescript
// src/services/FilingStatusPoller.ts

import { EUESMAAdapter } from '@/lib/filing-adapters/EUESMAAdapter';
import { updateFilingStatus } from '@/db/filings';

class FilingStatusPoller {
  private adapter: EUESMAAdapter;
  private pollIntervalMs: number = 5 * 60 * 1000; // 5 minutes
  private activePolls: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.adapter = new EUESMAAdapter();
  }

  /**
   * Start polling for a filing's status
   */
  startPolling(filingId: string): void {
    if (this.activePolls.has(filingId)) {
      return; // Already polling
    }

    const pollId = setInterval(async () => {
      try {
        const status = await this.adapter.getStatus(filingId);
        
        // Update database
        await updateFilingStatus(filingId, status);

        // Stop polling if final status reached
        if (
          status.status === 'accepted' ||
          status.status === 'rejected' ||
          status.status === 'withdrawn'
        ) {
          this.stopPolling(filingId);
        }
      } catch (error) {
        console.error(`Polling failed for ${filingId}:`, error);
      }
    }, this.pollIntervalMs);

    this.activePolls.set(filingId, pollId);
    console.log(`Started polling for filing ${filingId}`);
  }

  /**
   * Stop polling for a filing
   */
  stopPolling(filingId: string): void {
    const pollId = this.activePolls.get(filingId);
    if (pollId) {
      clearInterval(pollId);
      this.activePolls.delete(filingId);
      console.log(`Stopped polling for filing ${filingId}`);
    }
  }

  /**
   * Stop all active polls (e.g., on server shutdown)
   */
  stopAllPolling(): void {
    for (const [filingId] of this.activePolls) {
      this.stopPolling(filingId);
    }
  }
}

export const poller = new FilingStatusPoller();
```

### Step 9: Write Unit Tests (30 minutes)

```typescript
// EUESMAAdapter.test.ts

import { EUESMAAdapter } from './EUESMAAdapter';
import { DocumentMetadata } from '../BaseFilingAdapter';

describe('EUESMAAdapter', () => {
  let adapter: EUESMAAdapter;

  beforeEach(() => {
    adapter = new EUESMAAdapter();
    adapter.setCredentials({
      method: 'api_key',
      apiKey: 'test-key',
    });
  });

  describe('XML Generation', () => {
    it('should generate valid prospectus XML', async () => {
      const doc: DocumentMetadata = {
        id: 'test-1',
        type: 'prospectus',
        format: 'json',
        fileName: 'prospectus.json',
        mimeType: 'application/json',
        size: 1000,
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: JSON.stringify({
          companyName: 'Test Corp',
          issuerName: 'Test Corp Inc',
          country: 'EU',
          summary: 'Test summary',
          riskFactors: 'Test risks',
          boardMembers: [],
        }),
      };

      const result = await adapter.validate([doc]);
      expect(result.isValid).toBe(true);
    });

    it('should handle XML escaping correctly', () => {
      const doc: DocumentMetadata = {
        id: 'test-1',
        type: 'prospectus',
        format: 'json',
        fileName: 'prospectus.json',
        mimeType: 'application/json',
        size: 1000,
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: JSON.stringify({
          companyName: 'Test & Co <Ltd>',
          issuerName: 'Test Corp "Inc"',
        }),
      };

      const result = await adapter.validate([doc]);
      expect(result.isValid).toBe(true);
    });
  });

  describe('File Upload', () => {
    it('should stage documents as XML files', async () => {
      // Test that documents are converted to XML and staged
      // This would typically use a test SFTP server
    });
  });
});
```

### Step 10: Register in Filing System (15 minutes)

```typescript
// src/lib/filing-adapters/index.ts

import { EUESMAAdapter } from './EUESMAAdapter';

export const FILING_ADAPTERS = {
  'us-sec': SECEdgarAdapter,
  'ca-sedar': SEDARAdapter,
  'eu-esma': EUESMAAdapter,  // Add this
};
```

## Configuration Checklist

Before going live, verify these settings with your regulatory authority:

- [ ] SFTP server hostname and port
- [ ] SFTP credentials (username, private key path)
- [ ] Inbound directory path for submissions
- [ ] Outbound directory path for acknowledgments
- [ ] XML schema version and namespace
- [ ] Minimum/maximum file sizes
- [ ] Required manifest format
- [ ] Acknowledgment file naming convention
- [ ] Processing time estimates
- [ ] Polling interval recommendations

## Common Issues & Solutions

### "Connection Timeout" Error
- Verify SFTP server hostname is correct
- Check firewall allows port 22 (SFTP)
- Verify SSH key permissions are 600
- Test with sftp client manually first: `sftp -i key.pem user@host`

### "XML Schema Validation Failed"
- Download latest XSD schema from regulator
- Check namespace matches schema requirements
- Validate XML locally with xmllint first
- Review regulator's example XML files

### "Authentication Failed"
- Verify private key format (OpenSSH vs PEM)
- Check key passphrase is correct
- Test SSH connection: `ssh -i key.pem user@host`
- Verify account permissions on SFTP server

### "Acknowledgment File Not Found"
- Check outbound directory path is correct
- Verify file naming convention matches (e.g., {submissionId}-ack.xml)
- Confirm regulator actually creates acknowledgment files
- Check file permissions allow reading from SFTP account

## Monitoring & Logging

Set up monitoring for:
- Upload success/failure rate
- Average processing time
- File size distribution
- SFTP connection errors
- Status polling delays

## Next Steps

1. **Test with sandbox:** Most regulators provide test SFTP environments
2. **Validate XML:** Use online validators or local tools
3. **Monitor uploads:** Set up alerts for failures
4. **Document errors:** Create runbook for common issues
5. **Schedule maintenance:** Plan for SFTP server outages

## Additional Resources

- See `/src/lib/filing-adapters/examples/` for implementation examples
- Review `/src/lib/filing-adapters/IMPLEMENTATION_GUIDE.md`
- Check regulatory authority's technical documentation for schema details
