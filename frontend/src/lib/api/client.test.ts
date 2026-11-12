import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/server";
import { ApiProblem, request } from "./client";
import { API_V1 } from "./config";

describe("request", () => {
  it("returns parsed JSON for successful responses", async () => {
    server.use(http.get(`${API_V1}/health`, () => HttpResponse.json({ status: "ok" })));

    await expect(request<{ status: string }>("/health")).resolves.toEqual({ status: "ok" });
  });

  it("returns undefined for an empty 204 response", async () => {
    server.use(http.delete(`${API_V1}/posts/1`, () => new HttpResponse(null, { status: 204 })));

    await expect(request<void>("/posts/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("turns an RFC 9457 response into a typed problem", async () => {
    server.use(
      http.post(`${API_V1}/posts`, () =>
        HttpResponse.json(
          {
            type: "about:blank",
            title: "Validation failed",
            status: 400,
            detail: "Check the highlighted fields.",
            instance: "urn:uuid:request-1",
            requestId: "request-1",
            fieldErrors: { title: "Enter a title." },
          },
          { status: 400, headers: { "Content-Type": "application/problem+json" } },
        ),
      ),
    );

    const error = await request("/posts", { method: "POST", body: {} }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiProblem);
    expect(error).toMatchObject({
      status: 400,
      title: "Validation failed",
      detail: "Check the highlighted fields.",
      requestId: "request-1",
      fieldErrors: { title: "Enter a title." },
    });
  });

  it("reports a clear problem when the network is unavailable", async () => {
    server.use(http.get(`${API_V1}/posts`, () => HttpResponse.error()));

    await expect(request("/posts")).rejects.toMatchObject({
      status: 0,
      title: "Cannot reach the service",
    });
  });
});
