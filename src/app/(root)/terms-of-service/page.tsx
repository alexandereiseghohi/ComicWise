import ClientDate from "@/components/layout/ClientDate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ComicWise",
  description: "Terms and conditions for using ComicWise services.",
};

// Force dynamic rendering for current date display
// export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <CardDescription>Agreement for using ComicWise services</CardDescription>
        </CardHeader>
        <CardContent
          className={`
            prose
            dark:prose-invert
            max-w-none
          `}
        >
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Agreement to Terms</h2>
            <p className="mb-4">
              By accessing and using ComicWise (&quot;the Service&quot;), you accept and agree to be
              bound by the terms and provision of this agreement. If you do not agree to abide by
              the above, please do not use this service.
            </p>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Your continued use of the
              Service following any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily access the materials on ComicWise for personal,
              non-commercial transitory viewing only. This is the grant of a license, not a transfer
              of title, and under this license you may not:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on ComicWise</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>
                Transfer the materials to another person or &quot;mirror&quot; the materials on any
                other server
              </li>
            </ul>
            <p className="mb-4">
              This license shall automatically terminate if you violate any of these restrictions
              and may be terminated by ComicWise at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">User Accounts</h2>
            <p className="mb-4">
              To access certain features of the Service, you may be required to create an account.
              You agree to:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept all responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account if any information provided
              during registration or thereafter proves to be inaccurate, not current, or incomplete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Prohibited Uses</h2>
            <p className="mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms.
              You agree not to use the Service:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                In any way that violates any applicable national or international law or regulation
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or promotional material
                without our prior written consent
              </li>
              <li>
                To impersonate or attempt to impersonate ComicWise, a ComicWise employee, another
                user, or any other person or entity
              </li>
              <li>
                To engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment
                of the Service
              </li>
              <li>
                To use any robot, spider, or other automatic device to access the Service for any
                purpose
              </li>
              <li>
                To introduce any viruses, trojan horses, worms, logic bombs, or other material that
                is malicious or technologically harmful
              </li>
              <li>To attempt to gain unauthorized access to any portion of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">User Content</h2>
            <p className="mb-4">
              Our Service may allow you to post, submit, or otherwise make available content such as
              comments, reviews, and bookmarks (&quot;User Content&quot;). You retain all rights in,
              and are solely responsible for, the User Content you make available through the
              Service.
            </p>
            <p className="mb-4">
              By making any User Content available through the Service, you grant us a
              non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use,
              copy, modify, create derivative works based on, distribute, publicly display, publicly
              perform, and otherwise exploit in any manner such User Content in all formats and
              distribution channels now known or hereafter devised.
            </p>
            <p className="mb-4">You represent and warrant that:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>You own or control all rights in and to the User Content</li>
              <li>
                The User Content does not violate the privacy rights, publicity rights, copyrights,
                or other rights of any person
              </li>
              <li>
                The User Content does not contain material that is defamatory, obscene, indecent,
                abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise
                objectionable
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content (excluding User Content), features, and
              functionality are and will remain the exclusive property of ComicWise and its
              licensors. The Service is protected by copyright, trademark, and other laws of both
              the United States and foreign countries.
            </p>
            <p className="mb-4">
              Our trademarks and trade dress may not be used in connection with any product or
              service without the prior written consent of ComicWise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Copyright Policy</h2>
            <p className="mb-4">
              We respect the intellectual property rights of others. It is our policy to respond to
              any claim that content posted on the Service infringes a copyright or other
              intellectual property infringement of any person.
            </p>
            <p className="mb-4">
              If you believe that any content on the Service violates your copyright, please see our{" "}
              <a
                href="/dmca"
                className={`
                  text-primary
                  hover:underline
                `}
              >
                DMCA Policy
              </a>{" "}
              for information on how to file a notice of copyright infringement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Disclaimer</h2>
            <p className="mb-4">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS.
              COMICWISE MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS
              TO THE OPERATION OF THE SERVICE OR THE INFORMATION, CONTENT, OR MATERIALS INCLUDED ON
              THE SERVICE.
            </p>
            <p className="mb-4">
              YOU EXPRESSLY AGREE THAT YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. TO THE FULL
              EXTENT PERMISSIBLE BY APPLICABLE LAW, COMICWISE DISCLAIMS ALL WARRANTIES, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY AND
              FITNESS FOR A PARTICULAR PURPOSE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Limitation of Liability</h2>
            <p className="mb-4">
              IN NO EVENT SHALL COMICWISE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE
              TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL
              DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Indemnification</h2>
            <p className="mb-4">
              You agree to defend, indemnify, and hold harmless ComicWise and its licensors and
              licensees, and their employees, contractors, agents, officers, and directors, from and
              against any claims, damages, obligations, losses, liabilities, costs, or debt, and
              expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and bar access to the Service immediately,
              without prior notice or liability, under our sole discretion, for any reason
              whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p className="mb-4">
              If you wish to terminate your account, you may simply discontinue using the Service or
              contact us to request account deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws of the
              applicable jurisdiction, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. What constitutes a material change will be determined at our sole discretion. By
              continuing to access or use our Service after any revisions become effective, you
              agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p className="mb-4">If you have any questions about these Terms, please contact us:</p>
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="font-mono">
                Email: legalcomicwise.com
                <br />
                Subject: Terms of Service Inquiry
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
