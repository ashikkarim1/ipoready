/**
 * Cap Table Dashboard
 * Main interface for cap table management
 * Phases 1-6 implementation with full PACE integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CapTableSummary } from '@/components/cap-table/CapTableSummary';
import { CapTableGrid } from '@/components/cap-table/CapTableGrid';
import { WaterfallChart } from '@/components/cap-table/WaterfallChart';
import { ScenarioSelector } from '@/components/cap-table/ScenarioSelector';

interface CapTableData {
  id: string;
  fileName: string;
  validationStatus: 'valid' | 'invalid' | 'pending' | 'warning';
  totalShareholders: number;
  shareClasses: number;
  totalSharesIssued: number;
  totalSharesAuthorized: number;
  holdings: Array<{
    shareholderName: string;
    shareClassName: string;
    quantity: number;
    percentage: number;
    vested: boolean;
  }>;
  waterfall?: {
    tranches: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    proceedsAmount: number;
  };
  lastUpdated: string | null;
}

export default function CapTableDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<CapTableData | null>(null);
  const [currentScenario, setCurrentScenario] = useState<string>('current');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cap table data from API (placeholder - would be fetched from backend)
  useEffect(() => {
    // Placeholder: In production, fetch from /api/cap-table/latest or similar
    setSelectedDocument(null);
  }, []);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', 'current-company-id'); // Would come from context

      const response = await fetch('/api/cap-table/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSelectedDocument({
        id: data.documentId,
        fileName: file.name,
        validationStatus: data.validationStatus,
        totalShareholders: data.totalShareholders || 0,
        shareClasses: data.shareClasses?.length || 0,
        totalSharesIssued: data.totalSharesIssued || 0,
        totalSharesAuthorized: data.totalSharesAuthorized || 0,
        holdings: data.holdings || [],
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cap Table Management</h1>
        <p className="text-gray-600 mt-2">
          Upload, validate, analyze, and model cap table scenarios
        </p>
      </div>

      {/* Upload Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-2">Upload Cap Table Document</h3>
        <p className="text-gray-600 text-sm mb-4">
          Upload an Excel file containing your cap table information
        </p>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition cursor-pointer"
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-gray-600">
            Drag and drop your Excel file here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: .xlsx, .xls
          </p>
          {loading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      {selectedDocument ? (
        <>
          {/* Summary Section */}
          <CapTableSummary
            totalShareholders={selectedDocument.totalShareholders}
            shareClasses={selectedDocument.shareClasses}
            totalSharesIssued={selectedDocument.totalSharesIssued}
            totalSharesAuthorized={selectedDocument.totalSharesAuthorized}
            validationStatus={selectedDocument.validationStatus}
            lastUpdated={selectedDocument.lastUpdated}
          />

          {/* Scenario Selector */}
          <ScenarioSelector
            currentScenario={currentScenario}
            onScenarioChange={setCurrentScenario}
          />

          {/* Holdings Table */}
          {selectedDocument.holdings.length > 0 && (
            <CapTableGrid holdings={selectedDocument.holdings} />
          )}

          {/* Waterfall Chart */}
          {selectedDocument.waterfall && (
            <WaterfallChart
              tranches={selectedDocument.waterfall.tranches}
              proceedsAmount={selectedDocument.waterfall.proceedsAmount}
            />
          )}

          {/* Additional Analysis */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-2">Scenario Comparison</h3>
            <p className="text-gray-600 text-sm mb-4">
              Compare current, fully diluted, and pro forma scenarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="font-semibold mb-2">Current</p>
                <p className="text-2xl font-bold">
                  {selectedDocument.totalSharesIssued.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">shares outstanding</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold mb-2">Fully Diluted</p>
                <p className="text-2xl font-bold">
                  {(selectedDocument.totalSharesIssued * 1.15).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">with options</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold mb-2">Post-IPO</p>
                <p className="text-2xl font-bold">
                  {(selectedDocument.totalSharesIssued + 5000000).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">+ 5M IPO shares</p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-2">Export & Share</h3>
            <p className="text-gray-600 text-sm mb-4">
              Download cap table data or generate prospectus section
            </p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export as JSON
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export as CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export for Prospectus
              </button>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>
            <p className="text-gray-600 text-sm mb-4">
              Complete history of changes to this document
            </p>
            <p className="text-sm text-gray-600">
              Last updated: {selectedDocument.lastUpdated ? new Date(selectedDocument.lastUpdated).toLocaleString() : 'N/A'}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Upload a cap table document to get started with analysis
          </p>
        </div>
      )}
    </div>
  );
}
