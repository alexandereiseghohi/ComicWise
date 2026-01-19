"use client";

import { ThemeToggle } from "@/components/admin/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Palette,
  Tag,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Comics",
    icon: BookOpen,
    href: "/admin/comics",
  },
  {
    title: "Chapters",
    icon: FileText,
    href: "/admin/chapters",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Authors",
    icon: UserCircle,
    href: "/admin/authors",
  },
  {
    title: "Artists",
    icon: Palette,
    href: "/admin/artists",
  },
  {
    title: "Genres",
    icon: FolderOpen,
    href: "/admin/genres",
  },
  {
    title: "Types",
    icon: Tag,
    href: "/admin/types",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <BookOpen className="size-6" />
            <span className="text-lg font-bold">ComicWise Admin</span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          ComicWise v1.0.0 • Press{" "}
          <kbd
            className={`
              rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold
            `}
          >
            ⌘K
          </kbd>{" "}
          to search
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
