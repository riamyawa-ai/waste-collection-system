// API routes placeholder
// API routes will be added as needed throughout the project

import { APP_NAME } from "@/constants";

export async function GET() {
  return Response.json({
    message: `${APP_NAME} API`,
    version: "1.0.0",
    status: "ok"
  });
}
