import ClientDate from "@/components/layout/ClientDate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ComicWise",
  description: "Learn how ComicWise collects, uses, and protects your personal information.",
};

// Force dynamic rendering for current date display
// export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription>How we collect, use, and protect your information</CardDescription>
        </CardHeader>
        <CardContent
          className={`
            prose
            dark:prose-invert
            max-w-none
          `}
        >
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <p className="mb-4">
              ComicWise (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you visit our website and use our services.
            </p>
            <p className="mb-4">
              Please read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Information We Collect</h2>

            <h3 className="mb-3 text-xl font-semibold">Personal Information</h3>
            <p className="mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Register for an account</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in activities on the site</li>
              <li>Contact us for support</li>
            </ul>
            <p className="mb-4">This information may include:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Name and email address</li>
              <li>Username and password</li>
              <li>Profile information</li>
              <li>Reading preferences and bookmarks</li>
            </ul>

            <h3 className="mt-6 mb-3 text-xl font-semibold">Automatically Collected Information</h3>
            <p className="mb-4">
              When you visit our site, we may automatically collect certain information about your
              device, including:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring URLs</li>
              <li>Pages viewed and time spent on pages</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Provide, operate, and maintain our services</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our site</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service, updates, and promotional purposes</li>
              <li>Send you emails and notifications</li>
              <li>Find and prevent fraud and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track activity on our service and
              store certain information. Cookies are files with a small amount of data which may
              include an anonymous unique identifier.
            </p>
            <p className="mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is
              being sent. However, if you do not accept cookies, you may not be able to use some
              portions of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information in the following situations:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Service Providers:</strong> We may share your information with third-party
                service providers who perform services on our behalf
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if required to
                do so by law or in response to valid requests by public authorities
              </li>
              <li>
                <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or
                asset sale, your information may be transferred
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your information for any other
                purpose with your consent
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Data Security</h2>
            <p className="mb-4">
              We use administrative, technical, and physical security measures to protect your
              personal information. However, no method of transmission over the Internet or method
              of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Your Data Protection Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights regarding your personal
              information:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Access:</strong> Request copies of your personal data
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate or incomplete data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data
              </li>
              <li>
                <strong>Restriction:</strong> Request restriction of processing your personal data
              </li>
              <li>
                <strong>Objection:</strong> Object to our processing of your personal data
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data to another
                organization
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our service does not address anyone under the age of 13. We do not knowingly collect
              personally identifiable information from children under 13. If you are a parent or
              guardian and you are aware that your child has provided us with personal information,
              please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Third-Party Links</h2>
            <p className="mb-4">
              Our service may contain links to third-party websites. We are not responsible for the
              privacy practices or content of these third-party sites. We encourage you to read the
              privacy policy of every website you visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="font-mono">
                Email: privacycomicwise.com
                <br />
                Subject: Privacy Policy Inquiry
              </p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: <ClientDate />
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
