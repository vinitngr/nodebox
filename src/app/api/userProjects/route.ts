import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import db from "@/lib/db/db";
import { projectsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProjects = await db
      .select({
        id: projectsTable.id,
        projectName: projectsTable.projectName,
        url: projectsTable.url,
        githubUrl: projectsTable.githubUrl,
        description: projectsTable.description,
        buildTime: projectsTable.buildTime,
        devTime: projectsTable.devTime,
        created: projectsTable.created_at
      })
      .from(projectsTable)
      .where(eq(projectsTable.email, session.user.email));

      return NextResponse.json(
      { projects: userProjects },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
}
