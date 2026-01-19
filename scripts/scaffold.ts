#!/usr/bin/env node
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const templates = {
  page: (name: string) => `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${name}',
  description: '${name} page'
};

export default function ${name}Page() {
  return (
    <div>
      <h1>${name}</h1>
    </div>
  );
}
`,
  component: (name: string) => `import type { FC } from 'react';

interface ${name}Props {
  className?: string;
}

export const ${name}: FC<${name}Props> = ({ className }) => {
  return (
    <div className={className}>
      ${name}
    </div>
  );
};
`,
  api: (name: string) => `import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement GET logic
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    logger.error('Error in ${name} API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Implement POST logic
    return NextResponse.json({ message: 'Created' }, { status: 201 });
  } catch (error) {
    logger.error('Error in ${name} API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`,
  dal: (name: string) => `import { db } from "@/database/db";
import { ${name.toLowerCase()}s } from "@/database/schema";
import { eq } from 'drizzle-orm';
import { logger } from "@/lib/logger";

export class ${name}Dal {
  static async getAll() {
    try {
      return await db.select().from(${name.toLowerCase()}s);
    } catch (error) {
      logger.error('Error fetching ${name.toLowerCase()}s:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const [result] = await db
        .select()
        .from(${name.toLowerCase()}s)
        .where(eq(${name.toLowerCase()}s.id, id));
      return result;
    } catch (error) {
      logger.error('Error fetching ${name.toLowerCase()}:', error);
      throw error;
    }
  }

  static async create(data: typeof ${name.toLowerCase()}s.$inferInsert) {
    try {
      const [result] = await db.insert(${name.toLowerCase()}s).values(data).returning();
      return result;
    } catch (error) {
      logger.error('Error creating ${name.toLowerCase()}:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<typeof ${name.toLowerCase()}s.$inferInsert>) {
    try {
      const [result] = await db
        .update(${name.toLowerCase()}s)
        .set(data)
        .where(eq(${name.toLowerCase()}s.id, id))
        .returning();
      return result;
    } catch (error) {
      logger.error('Error updating ${name.toLowerCase()}:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await db.delete(${name.toLowerCase()}s).where(eq(${name.toLowerCase()}s.id, id));
    } catch (error) {
      logger.error('Error deleting ${name.toLowerCase()}:', error);
      throw error;
    }
  }
}
`,
};

async function main() {
  const type = process.argv[2];
  const name = process.argv[3];

  if (!type || !name) {
    console.log(`
Scaffold Generator

Usage: pnpm scaffold <type> <name>

Types:
  page       - Create a new Next.js page
  component  - Create a new React component
  api        - Create a new API route
  dal        - Create a new Data Access Layer

Examples:
  pnpm scaffold page Dashboard
  pnpm scaffold component Button
  pnpm scaffold api users
  pnpm scaffold dal User
    `);
    process.exit(1);
  }

  const template = templates[type as keyof typeof templates];
  if (!template) {
    console.error(`❌ Unknown template type: ${type}`);
    process.exit(1);
  }

  let targetPath: string;
  switch (type) {
    case "page":
      targetPath = join("src", "app", name.toLowerCase(), "page.tsx");
      break;
    case "component":
      targetPath = join("src", "components", `${name}.tsx`);
      break;
    case "api":
      targetPath = join("src", "app", "api", name.toLowerCase(), "route.ts");
      break;
    case "dal":
      targetPath = join("src", "dal", `${name}Dal.ts`);
      break;
    default:
      targetPath = join("src", `${name}.ts`);
  }

  const fullPath = join(process.cwd(), targetPath);
  await mkdir(join(fullPath, ".."), { recursive: true });
  await writeFile(fullPath, template(name));

  console.log(`✅ Created ${type}: ${targetPath}`);
}

main();
