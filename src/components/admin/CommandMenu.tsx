"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BookOpen, FileText, FolderOpen, Palette, Tag, UserCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

const navigationItems = [
  { title: "Dashboard", href: "/admin", icon: FileText },
  { title: "Comics", href: "/admin/comics", icon: BookOpen },
  { title: "Chapters", href: "/admin/chapters", icon: FileText },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Genres", href: "/admin/genres", icon: FolderOpen },
  { title: "Types", href: "/admin/types", icon: Tag },
  { title: "Authors", href: "/admin/authors", icon: UserCircle },
  { title: "Artists", href: "/admin/artists", icon: Palette },
  { title: "Create Comic", href: "/admin/comics/new", icon: BookOpen },
  { title: "Create Chapter", href: "/admin/chapters/new", icon: FileText },
  { title: "Create User", href: "/admin/users/new", icon: Users },
];

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  runCommand(() => router.push(item.href));
                }}
              >
                <Icon className="mr-2 size-4" />
                <span>{item.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
