import { NextRequest } from "next/server";

export async function GET() {
  return new Response("Hello World from /api/upload/");
}


export async function POST(req : NextRequest) {
  const formData : FormData = await req.formData();

}
