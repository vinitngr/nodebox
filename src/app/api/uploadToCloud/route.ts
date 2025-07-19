import { NextRequest, NextResponse } from "next/server";
import { unzipSync } from "fflate";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from 'mime';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import db from "@/lib/db/db";
import { projectsTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { NeonDbError } from "@neondatabase/serverless";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return new Response("Unauthorized", { status: 401 });
    
    const [{count}] = await db
    .select({count : sql<number> `count(*)`})
    .from(projectsTable)
    .where(eq(projectsTable.email, session.user.email))
    
    const isDev = process.env.ENV === "development";
    if(count > 5 && !isDev && session.user.email !== "vinitnagar56@gmail.com") {
      return new Response("You have reached the limit of 5 projects", { status: 403 });
    }

    const origin = req.headers.get("origin") || "";
    const allowedOrigin = process.env.FRONTENDURL || "http://localhost:3000";
    
    if (origin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const media = formData.get('media');

    let projectName = formData.get("projectName");


    if (!(file instanceof Blob)) throw new Error("Invalid file");
    if (media && !(media instanceof Blob)) throw new Error("Invalid media");
    if (typeof projectName !== "string") throw new Error("Invalid projectName");
    
    projectName = projectName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!file || !projectName) {
      return new Response("Missing file or projectName", { status: 400 });
    }

    const fileBuffer = Buffer.from(await (file as Blob).arrayBuffer());
    const zip = unzipSync(fileBuffer);

    let finalName = projectName;
    const existing = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.projectName, projectName))
      .limit(1);

    if (existing.length > 0) {
      const suffix = randomBytes(2).toString('hex');
      finalName = `${projectName}-${suffix}`;
    }

    let fileCount = Object.keys(zip).length;
    

    const mediaBuffer = Buffer.from(await (media as Blob).arrayBuffer());
    const mediazip = unzipSync(mediaBuffer);
    fileCount += Object.keys(mediazip).length;


    if (fileCount > 20) {
      throw new Error(`Upload aborted: Too many files in zip (${fileCount})`);
    }

    for (const [path, content] of Object.entries(zip)) {
      try {
        console.log('Uploading:', path);
        const relativePath = path.startsWith('dist/') ? path.slice(5) : path;
        if (!relativePath || relativePath.endsWith('/')) continue;

        const key = `uploads/${finalName}/${relativePath}`;
        const contentType = mime.getType(relativePath) || 'application/octet-stream';

        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: key,
          Body: content,
          ContentType: contentType,
          CacheControl: 'public, max-age=864000, immutable',
        });

        await s3.send(command);
        console.log('Uploaded:', path);
      } catch (error) {
        console.error('Upload failed for', path, error);
        throw new Error(`Upload failed for ${path}: ${error}`);
      }
    }

    for (const [fn, content] of Object.entries(mediazip)) {
      try {
        console.log('Uploading:', fn);

        const key = `uploads/${finalName}/${fn}`;
        const contentType = mime.getType(fn) || 'application/octet-stream';

        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: key,
          Body: content,
          ContentType: contentType,
          CacheControl: 'public, max-age=864000, immutable',
        });

        await s3.send(command);
      } catch (error) {
        console.error('Upload failed for', fn, error);
        throw new Error(`Upload failed for ${fn}: ${error}`);
      }
    }

    await db.insert(projectsTable).values([{
      projectName: finalName,
      url: `http://${finalName}.nodebox.vinitngr.xyz`,
      description: formData.get('description') as string | undefined,
      githubUrl: formData.get('githubUrl') as string | undefined,
      buildTime: Math.round(Number(formData.get('buildtime')) || -1),
      devTime: Math.round(Number(formData.get('devtime')) || -1),
      email: session.user!.email,
    }]);


    return NextResponse.json(
      {
        success: true,
        finalName,
        cdnUrl: `https://d25121adlvheae.cloudfront.net/uploads/${finalName}/index.html`,
        url: `https://${finalName}.vinitngr.xyz`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if(err instanceof NeonDbError) return new Response(`error insertng in DATABASE ${err.message}`, { status: 500 });
    console.error("Upload error:", err);
    return new Response(`Upload failed: ${err.message || "Internal error"}`, {
      status: 500,
    });
  }
}
