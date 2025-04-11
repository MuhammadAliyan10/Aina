import React from "react";

const PrivacyPolicyAndTerms = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center">
            Privacy Policy & Terms of Service
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Effective Date: January 1, 2025
          </p>
        </header>

        {/* Privacy Policy Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <p className="mb-4">
            We value your privacy. This Privacy Policy explains how we collect,
            use, and share your information when you use our services.
          </p>

          <h3 className="text-xl font-semibold mb-2">
            1. Information We Collect
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li>
              Personal information, such as your name, email address, and
              contact details.
            </li>
            <li>
              Usage data, including how you interact with our website or app.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">
            2. How We Use Your Information
          </h3>
          <p className="mb-4">
            Your information is used to provide and improve our services,
            communicate with you, and ensure compliance with applicable laws.
          </p>

          <h3 className="text-xl font-semibold mb-2">
            3. Sharing of Information
          </h3>
          <p className="mb-4">
            We do not share your personal information with third parties except
            to comply with legal obligations or to provide our services.
          </p>

          <h3 className="text-xl font-semibold mb-2">4. Your Rights</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>You have the right to access, modify, or delete your data.</li>
            <li>You may withdraw consent to data processing at any time.</li>
          </ul>
        </section>

        {/* Terms of Service Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
          <p className="mb-4">
            These Terms of Service govern your use of our website and services.
            By accessing our platform, you agree to these terms.
          </p>

          <h3 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h3>
          <p className="mb-4">
            By using our services, you agree to comply with and be bound by
            these terms.
          </p>

          <h3 className="text-xl font-semibold mb-2">
            2. User Responsibilities
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li>
              You must provide accurate information when creating an account.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">
            3. Prohibited Activities
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Using the platform for illegal purposes.</li>
            <li>Interfering with the operation of the platform.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">4. Termination</h3>
          <p className="mb-4">
            We reserve the right to terminate or suspend your access to our
            platform for any violation of these terms.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t pt-4">
          <p className="text-center text-sm text-gray-600">
            If you have any questions, please contact us at{" "}
            <a
              href="mailto:support@yourapp.com"
              className="text-blue-500 hover:underline"
            >
              aliyannadeem10@gmail.com
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyAndTerms;
