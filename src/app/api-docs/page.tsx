'use client'

/**
 * API Documentation Page
 * Swagger UI for IPOReady API
 */

import dynamic from 'next/dynamic'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(
  () => import('swagger-ui-react'),
  { ssr: false }
)

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                API Documentation
              </h1>
              <p className="mt-2 text-gray-600">
                Interactive API reference for IPOReady services
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">v1.0.0</p>
                <p className="text-xs text-gray-500">Production</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#section-capital-markets"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <h3 className="font-semibold text-blue-900">Capital Markets</h3>
              <p className="text-sm text-blue-700">Companies, IPOs, benchmarks</p>
            </a>
            <a
              href="#section-documents"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <h3 className="font-semibold text-green-900">Documents</h3>
              <p className="text-sm text-green-700">Upload, manage, retrieve</p>
            </a>
            <a
              href="#section-admin"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
            >
              <h3 className="font-semibold text-purple-900">Admin</h3>
              <p className="text-sm text-purple-700">Deployment, ingestion</p>
            </a>
          </div>
        </div>
      </div>

      {/* API Explorer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Swagger UI will be rendered here */}
          <style jsx global>{`
            .swagger-ui {
              padding: 0;
            }
            .swagger-ui .info .title {
              font-size: 28px;
              margin-top: 0;
            }
            .swagger-ui .info .description {
              margin: 20px 0;
            }
            .swagger-ui .btn-group {
              display: none;
            }
            .swagger-ui .topbar {
              display: none;
            }
            .swagger-ui .scheme-container {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
          `}</style>
          <SwaggerUI
            url="/openapi.yaml"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Authentication */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Authentication</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Uses NextAuth JWT tokens</li>
                <li>Include token in Authorization header</li>
                <li>Expires after 30 days</li>
              </ul>
            </div>

            {/* Rate Limits */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Rate Limits</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Standard: 100 req/min</li>
                <li>Bulk: 10 req/min</li>
                <li>Admin: 50 req/min</li>
              </ul>
            </div>

            {/* Response Format */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Response Format</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>All responses are JSON</li>
                <li>Timestamps in ISO 8601</li>
                <li>IDs are UUIDs</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="https://ipoready.com/docs"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@ipoready.com"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <a
                    href="https://ipoready.com/status"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Status Page
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <p className="text-sm text-gray-600">
              IPOReady API v1.0.0 •
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 mx-1"
              >
                Changelog
              </a>
              •
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 mx-1"
              >
                Feedback
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
