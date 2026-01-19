"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookOpen, LogOut, Menu, Search, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { cn } from "utils";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: _session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/comics", label: "Browse" },
    { href: "/bookmarks", label: "Bookmarks", protected: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/comics?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm
        supports-backdrop-filter:bg-background/60
      `}
    >
      <div
        className={`
          container mx-auto flex h-16 items-center justify-between px-4
        `}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="size-6" />
          <span
            className={`
              hidden
              sm:inline
            `}
          >
            ComicWise
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          className={`
            hidden items-center gap-6
            md:flex
          `}
        >
          {navLinks.map((link) => {
            if (link.protected && status !== "authenticated") {
              return null;
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  `
                    text-sm font-medium transition-colors
                    hover:text-primary
                  `,
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className={`
            mx-6 hidden max-w-sm flex-1
            lg:flex
          `}
        >
          <div className="relative w-full">
            <Search
              className={`
                absolute top-1/2 left-3 size-4 -translate-y-1/2
                text-muted-foreground
              `}
            />
            <Input
              type="search"
              placeholder="Search comics..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="size-8 animate-pulse rounded-full bg-muted" />
          ) : status === "authenticated" ? (
            <>
              <Link
                href="/bookmarks"
                className={`
                  hidden
                  md:inline-block
                `}
              >
                <Button variant="ghost" size="icon">
                  <Bookmark className="size-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="size-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className={`
                  hidden
                  md:inline-flex
                `}
              >
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <div
              className={`
                hidden gap-2
                md:flex
              `}
            >
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`
            border-t
            md:hidden
          `}
        >
          <div className="container mx-auto space-y-4 p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search
                className={`
                  absolute top-1/2 left-3 size-4 -translate-y-1/2
                  text-muted-foreground
                `}
              />
              <Input
                type="search"
                placeholder="Search comics..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                if (link.protected && status !== "authenticated") {
                  return null;
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      `
                        rounded-md px-4 py-2 text-sm font-medium
                        transition-colors
                      `,
                      isActive(link.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {status === "authenticated" ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      rounded-md px-4 py-2 text-sm font-medium
                      text-muted-foreground
                      hover:bg-muted
                    `}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/sign-in" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
