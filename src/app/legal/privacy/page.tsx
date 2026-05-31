import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | IPOReady.AI',
  description: 'Privacy Policy for IPOReady.AI IPO readiness platform',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-sm">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: May 31, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            IPOReady.AI ("we," "us," "our," or "Company") operates the IPOReady.AI website and service. This page informs you
            of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the
            choices you have associated with that data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally
              identifiable information ("Personal Data") including but not limited to:
              <ul className="list-circle ml-6 mt-2">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Company name and industry</li>
                <li>Cookies and Usage Data</li>
              </ul>
            </li>
            <li>
              <strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage
              Data") including the computer's Internet Protocol address (e.g. IP address), browser type, pages of our Service
              that you visit, the time and date of your visit, and other diagnostic data.
            </li>
            <li>
              <strong>Tracking Cookies Data:</strong> We use cookies and similar tracking technologies to track activity on our
              Service and hold certain information.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Use of Data</h2>
          <p>IPOReady.AI uses the collected data for various purposes:</p>
          <ul className="list-disc ml-6">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service</li>
            <li>To provide customer care and support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To provide you with news, special offers and general information about other goods, services and events</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet or
            method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your
            Personal Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy
            Policy on this page and updating the "effective date" at the top of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@ipoready.ai" className="text-blue-600 hover:underline">
              privacy@ipoready.ai
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. CCPA/GDPR Compliance</h2>
          <p>
            IPOReady.AI respects the privacy rights of individuals and is committed to protecting personal information in
            compliance with the California Consumer Privacy Act (CCPA), General Data Protection Regulation (GDPR), and other
            applicable privacy laws.
          </p>
          <p className="mt-4">
            If you are a California resident and would like to exercise your rights under the CCPA, or if you are located in
            the European Union and have questions regarding GDPR compliance, please contact us at{' '}
            <a href="mailto:privacy@ipoready.ai" className="text-blue-600 hover:underline">
              privacy@ipoready.ai
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
          <p>
            IPOReady.AI will retain your Personal Data for as long as necessary to provide our Service and fulfill the
            purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>
        </section>
      </div>
    </div>
  )
}
