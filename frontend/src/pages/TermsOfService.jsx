export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-slate-800/70 border border-slate-700 rounded-xl p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-3">Terms of Service</h1>
        <p className="text-slate-300 mb-8">Effective date: March 12, 2026</p>

        <div className="space-y-6 text-slate-200 leading-7">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Service Scope</h2>
            <p>
              This platform provides EV charging station discovery, booking, and payment functionality for
              users, admins, and station owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Account Responsibility</h2>
            <p>
              You are responsible for maintaining account credentials and all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Payments and Refunds</h2>
            <p>
              Charges, settlement, and refund behavior follow the payment rules shown at booking time and may
              vary by operator and region.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Acceptable Use</h2>
            <p>
              You must not abuse platform resources, interfere with operations, attempt unauthorized access,
              or submit fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
            <p>
              We provide services on a best-effort basis and are not liable for outages, third-party failures,
              or losses beyond limits allowed by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
            <p>support@evcharging.example</p>
          </section>
        </div>
      </div>
    </div>
  );
}
