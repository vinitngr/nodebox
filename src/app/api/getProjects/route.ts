import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/db";
import { projectsTable, usersTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = Number(searchParams.get("start") || 0);
    const end = Number(searchParams.get("end") || 9);
    const limit = end - start + 1;

    if (isNaN(start) || isNaN(end) || start < 0 || end < start) {
      return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    const projects = await db
      .select({
        id: projectsTable.id,
        projectName: projectsTable.projectName,
        url: projectsTable.url,
        githubUrl: projectsTable.githubUrl,
        description: projectsTable.description,
        userName: usersTable.name,
        userimage: usersTable.image,
        created: projectsTable.created_at
      })
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.email, usersTable.email))
      .orderBy(desc(projectsTable.created_at))
      .offset(start)
      .limit(limit);
      return NextResponse.json({ projects }, {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to fetch community projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch community projects" },
      { status: 500 }
    );
  }
}
