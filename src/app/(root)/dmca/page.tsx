import ClientDate from "@/components/layout/client-date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Notice | ComicWise",
  description:
    "Digital Millennium Copyright Act (DMCA) notice and copyright infringement policy for ComicWise.",
};

// Force dynamic rendering for current date display
// export const dynamic = "force-dynamic";

export default function DMCAPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">DMCA Notice</CardTitle>
          <CardDescription>Digital Millennium Copyright Act Policy</CardDescription>
        </CardHeader>
        <CardContent
          className={`
            prose
            dark:prose-invert
            max-w-none
          `}
        >
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Copyright Policy</h2>
            <p className="mb-4">
              ComicWise respects the intellectual property rights of others and expects its users to
              do the same. It is our policy to respond to clear notices of alleged copyright
              infringement that comply with the Digital Millennium Copyright Act (DMCA).
            </p>
            <p className="mb-4">
              If you believe that your work has been copied in a way that constitutes copyright
              infringement, please provide our Copyright Agent with the following information:
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Required Information for DMCA Notice</h2>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>
                An electronic or physical signature of the person authorized to act on behalf of the
                owner of the copyright interest
              </li>
              <li>A description of the copyrighted work that you claim has been infringed</li>
              <li>
                A description of where the material that you claim is infringing is located on the
                site, with enough detail that we may find it on the website
              </li>
              <li>Your address, telephone number, and email address</li>
              <li>
                A statement by you that you have a good faith belief that the disputed use is not
                authorized by the copyright owner, its agent, or the law
              </li>
              <li>
                A statement by you, made under penalty of perjury, that the above information in
                your notice is accurate and that you are the copyright owner or authorized to act on
                the copyright owner&apos;s behalf
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
            <p className="mb-4">DMCA notices can be sent to our designated Copyright Agent at:</p>
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="font-mono">
                Email: dmcacomicwise.com
                <br />
                Subject: DMCA Copyright Infringement Notice
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially
              misrepresents that material or activity is infringing may be subject to liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Counter-Notification</h2>
            <p className="mb-4">
              If you believe that your content that was removed (or to which access was disabled) is
              not infringing, or that you have the authorization from the copyright owner, the
              copyright owner&apos;s agent, or pursuant to the law, to post and use the material,
              you may send a counter-notice containing the following information to our Copyright
              Agent:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>Your physical or electronic signature</li>
              <li>
                Identification of the content that has been removed or to which access has been
                disabled
              </li>
              <li>
                A statement that you have a good faith belief that the content was removed or
                disabled as a result of mistake or a misidentification of the content
              </li>
              <li>
                Your name, address, telephone number, and email address, and a statement that you
                consent to the jurisdiction of the federal court in your district
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Repeat Infringer Policy</h2>
            <p className="mb-4">
              In accordance with the DMCA and other applicable law, ComicWise has adopted a policy
              of terminating, in appropriate circumstances and at our sole discretion, users who are
              deemed to be repeat infringers. We may also at our sole discretion limit access to the
              site and/or terminate the accounts of any users who infringe any intellectual property
              rights of others, whether or not there is any repeat infringement.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify this DMCA policy at any time. Any changes will be
              effective immediately upon posting on this page.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: <ClientDate />
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
