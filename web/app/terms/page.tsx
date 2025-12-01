import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2024</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using CallFlex (&quot;Service&quot;), you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              CallFlex provides AI-powered virtual receptionist services, including automated call answering,
              appointment scheduling, call transcription, and call forwarding. The Service is provided on a
              subscription basis with various pricing tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You must create an account to use our Service. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and complete registration information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Billing and Payments</h2>
            <p className="text-gray-600 mb-4">
              Subscription fees are billed in advance on a monthly basis. All fees are non-refundable
              unless otherwise stated. We reserve the right to change pricing with 30 days notice.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Phone numbers are charged monthly ($2 for local, $3 for toll-free)</li>
              <li>Call minutes are charged at $0.02/minute</li>
              <li>Overages beyond your plan limit are billed at standard rates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Call Recording and Transcription</h2>
            <p className="text-gray-600 mb-4">
              You acknowledge that calls may be recorded and transcribed as part of the Service.
              You are responsible for complying with all applicable call recording laws and regulations
              in your jurisdiction, including obtaining necessary consents from callers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality are owned by CallFlex
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, CallFlex shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data,
              or business opportunities, arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
            <p className="text-gray-600 mb-4">
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service.
              We may suspend or terminate the Service for maintenance, updates, or other reasons without prior notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for any reason,
              including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes via email or through the Service. Continued use of the Service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: legal@callflex.ai<br />
              Support: support@callflex.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
