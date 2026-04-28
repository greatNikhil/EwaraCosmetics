import { NextResponse } from "next/server";

export const successResponse = (
  message: string,
  data?: Record<string, unknown>,
  status = 200
) =>
  NextResponse.json(
    {
      success: true,
      message,
      ...(data ? { data } : {}),
    },
    { status }
  );

export const errorResponse = (
  message: string,
  status = 400,
  data?: Record<string, unknown>
) =>
  NextResponse.json(
    {
      success: false,
      message,
      ...(data ? { data } : {}),
    },
    { status }
  );
