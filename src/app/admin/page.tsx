import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/database/db";
import { bookmark, chapter, comic, comment, user } from "@/database/schema";
import { desc, sql } from "drizzle-orm";
import { BookMarked, BookOpen, BookPlus, Eye, FileText, Plus, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function QuickActions() {
  const quickActions = [
    {
      title: "Create Comic",
      href: "/admin/comics/new",
      icon: BookPlus,
      description: "Add a new comic",
    },
    {
      title: "Add Chapter",
      href: "/admin/chapters/new",
      icon: Plus,
      description: "Upload a new chapter",
    },
    {
      title: "Add User",
      href: "/admin/users/new",
      icon: UserPlus,
      description: "Create new user",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            grid gap-4
            md:grid-cols-3
          `}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex-col items-start justify-start p-4"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="mb-2 size-6" />
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

async function StatsGrid() {
  const [usersCount, comicsCount, chaptersCount, bookmarksCount, totalViews] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .then((r) => r[0]?.count || 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(comic)
      .then((r) => r[0]?.count || 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(chapter)
      .then((r) => r[0]?.count || 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookmark)
      .then((r) => r[0]?.count || 0),
    db
      .select({ total: sql<number>`sum(views)::int` })
      .from(comic)
      .then((r) => r[0]?.total || 0),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: usersCount,
      description: "Registered users",
      icon: Users,
    },
    {
      title: "Total Comics",
      value: comicsCount,
      description: "Comics in database",
      icon: BookOpen,
    },
    {
      title: "Total Chapters",
      value: chaptersCount,
      description: "Chapters available",
      icon: FileText,
    },
    {
      title: "Total Bookmarks",
      value: bookmarksCount,
      description: "User bookmarks",
      icon: BookMarked,
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      description: "Comic views",
      icon: Eye,
    },
  ];

  return (
    <div
      className={`
        grid gap-4
        md:grid-cols-2
        lg:grid-cols-5
      `}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader
              className={`
                flex flex-row items-center justify-between space-y-0 pb-2
              `}
            >
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function RecentComics() {
  const recentComics = await db
    .select({
      id: comic.id,
      title: comic.title,
      status: comic.status,
      views: comic.views,
      createdAt: comic.createdAt,
    })
    .from(comic)
    .orderBy(desc(comic.createdAt))
    .limit(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Comics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentComics.map((c) => (
            <div
              key={c.id}
              className={`
                flex items-center justify-between border-b pb-2
                last:border-0
              `}
            >
              <div className="flex-1">
                <Link
                  href={`/admin/comics/${c.id}`}
                  className={`
                    font-medium
                    hover:underline
                  `}
                >
                  {c.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {c.status} • {c.views} views
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentComics.length === 0 && (
            <p className="text-sm text-muted-foreground">No comics yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentUsers() {
  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.map((u) => (
            <div
              key={u.id}
              className={`
                flex items-center justify-between border-b pb-2
                last:border-0
              `}
            >
              <div className="flex-1">
                <div className="font-medium">{u.name || u.email}</div>
                <p className="text-xs text-muted-foreground">
                  {u.role} • {u.email}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">No users yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentChapters() {
  const recentChapters = await db
    .select({
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      views: chapter.views,
      createdAt: chapter.createdAt,
    })
    .from(chapter)
    .orderBy(desc(chapter.createdAt))
    .limit(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Chapters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentChapters.map((ch) => (
            <div
              key={ch.id}
              className={`
                flex items-center justify-between border-b pb-2
                last:border-0
              `}
            >
              <div className="flex-1">
                <Link
                  href={`/admin/chapters/${ch.id}`}
                  className={`
                    font-medium
                    hover:underline
                  `}
                >
                  Ch. {ch.chapterNumber}: {ch.title}
                </Link>
                <p className="text-xs text-muted-foreground">{ch.views} views</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(ch.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentChapters.length === 0 && (
            <p className="text-sm text-muted-foreground">No chapters yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentComments() {
  const recentComments = await db
    .select({
      id: comment.id,
      content: comment.content,
      userName: user.name,
      createdAt: comment.createdAt,
    })
    .from(comment)
    .leftJoin(user, sql`${comment.userId} = ${user.id}`)
    .orderBy(desc(comment.createdAt))
    .limit(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentComments.map((cm) => (
            <div
              key={cm.id}
              className={`
                flex items-center justify-between border-b pb-2
                last:border-0
              `}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{cm.userName || "Anonymous"}</div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{cm.content}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(cm.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentComments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 *
 */
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your ComicWise platform</p>
      </div>

      <Suspense
        fallback={
          <div
            className={`
              grid gap-4
              md:grid-cols-2
              lg:grid-cols-5
            `}
          >
            Loading stats...
          </div>
        }
      >
        {/* Statistics */}
        <StatsGrid />
      </Suspense>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <div
        className={`
          grid gap-4
          md:grid-cols-2
          lg:grid-cols-2
        `}
      >
        <Suspense fallback={<div>Loading recent comics...</div>}>
          <RecentComics />
        </Suspense>
        <Suspense fallback={<div>Loading recent users...</div>}>
          <RecentUsers />
        </Suspense>
        <Suspense fallback={<div>Loading recent chapters...</div>}>
          <RecentChapters />
        </Suspense>
        <Suspense fallback={<div>Loading recent comments...</div>}>
          <RecentComments />
        </Suspense>
      </div>
    </div>
  );
}
