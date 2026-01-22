import Link from "next/link";
import type { ReactNode } from "react";

const profileLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/profile/edit", label: "Edit Profile" },
  { href: "/profile/change-password", label: "Change Password" },
  { href: "/profile/settings", label: "Settings" },
];

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="space-y-2">
          <h2 className="mb-4 text-lg font-semibold">Profile Menu</h2>
          <nav className="flex flex-col space-y-1">
            {profileLinks.map((link) => (
              <ProfileLink key={link.href} href={link.href}>
                {link.label}
              </ProfileLink>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}

function ProfileLink({ href, children }: { href: string; children: ReactNode }) {
  // This would use usePathname in client component
  return (
    <Link href={href} className="rounded-md px-4 py-2 transition-colors hover:bg-accent">
      {children}
    </Link>
  );
}
