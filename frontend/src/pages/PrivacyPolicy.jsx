export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-slate-800/70 border border-slate-700 rounded-xl p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-slate-300 mb-8">Effective date: March 12, 2026</p>

        <div className="space-y-6 text-slate-200 leading-7">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p>
              We collect your name, email, phone number, device information, and charging activity needed
              to provide booking, payments, account security, and support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Data</h2>
            <p>
              Data is used to authenticate users, process bookings and payments, provide station discovery,
              improve app reliability, and prevent fraud or abuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
            <p>
              We only share required data with payment processors, charging partners, and infrastructure
              providers that operate the platform. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
            <p>
              We use access controls, encrypted transport (HTTPS), and operational safeguards to protect your
              data. No system can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Retention</h2>
            <p>
              We retain information only as long as needed for service delivery, legal compliance, dispute
              handling, and fraud prevention.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You can request access, correction, or deletion of your data by contacting us. Some data may
              be retained where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
            <p>
              Email: support@evcharging.example
              <br />
              Phone: +91-1900-111-0000
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
