import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | IPOReady.AI',
  description: 'Terms of Service for IPOReady.AI IPO readiness platform',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-sm">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: May 31, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using IPOReady.AI (the "Service"), you accept and agree to be bound by the terms and provision
            of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on IPOReady.AI
            for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and
            under this license you may not:
          </p>
          <ul className="list-disc ml-6">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
          <p>
            The materials on IPOReady.AI are provided on an 'as is' basis. IPOReady.AI makes no warranties, expressed or
            implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties
            or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or
            other violation of rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
          <p>
            In no event shall IPOReady.AI or its suppliers be liable for any damages (including, without limitation, damages
            for loss of data or profit, or due to business interruption) arising out of the use or inability to use the
            materials on IPOReady.AI, even if IPOReady.AI or an authorized representative has been notified orally or in
            writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on IPOReady.AI could include technical, typographical, or photographic errors.
            IPOReady.AI does not warrant that any of the materials on the Service are accurate, complete, or current.
            IPOReady.AI may make changes to the materials contained on the Service at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Links</h2>
          <p>
            IPOReady.AI has not reviewed all of the sites linked to its website and is not responsible for the contents of any
            such linked site. The inclusion of any link does not imply endorsement by IPOReady.AI of the site. Use of any such
            linked website is at the user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
          <p>
            IPOReady.AI may revise these terms of service for the Service at any time without notice. By using this service,
            you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which
            IPOReady.AI operates, and you irrevocably submit to the exclusive jurisdiction of the courts located there.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. User Accounts</h2>
          <p>
            When you create an account on IPOReady.AI, you must provide accurate, complete, and current information. You are
            responsible for maintaining the confidentiality of your account and password and for restricting access to your
            account. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Intellectual Property</h2>
          <p>
            All content included on the Service, such as text, graphics, logos, images, as well as the compilation thereof, and
            any software used on the Service is the property of IPOReady.AI or its suppliers and protected by international
            copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@ipoready.ai" className="text-blue-600 hover:underline">
              legal@ipoready.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
