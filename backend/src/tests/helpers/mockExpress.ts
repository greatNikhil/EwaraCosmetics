import { Request, Response } from "express";

export const createMockRequest = (overrides: Partial<Request> = {}) =>
  ({
    headers: {},
    params: {},
    body: {},
    baseUrl: "",
    path: "",
    method: "GET",
    ip: "127.0.0.1",
    ...overrides,
  } as Request);

export const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this as unknown as Response;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this as unknown as Response;
    },
    json(payload: unknown) {
      this.body = payload;
      return this as unknown as Response;
    },
  };

  return response;
};
