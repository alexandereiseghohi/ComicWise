import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const profileLinks = [
  { href: '/profile', label: 'Profile' },
  { href: '/profile/edit', label: 'Edit Profile' },
  { href: '/profile/change-password', label: 'Change Password' },
  { href: '/profile/settings', label: 'Settings' },
];

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <h2 className="font-semibold text-lg mb-4">Profile Menu</h2>
          <nav className="flex flex-col space-y-1">
            {profileLinks.map((link) => (
              <ProfileLink key={link.href} href={link.href}>
                {link.label}
              </ProfileLink>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProfileLink({ href, children }: { href: string; children: ReactNode }) {
  // This would use usePathname in client component
  return (
    <Link 
      href={href}
      className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
    >
      {children}
    </Link>
  );
}
