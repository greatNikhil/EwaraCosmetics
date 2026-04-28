import { successResponse } from "../_lib/response";

export async function GET() {
  return successResponse("Frontend API running", { status: "ok" }, 200);
}
