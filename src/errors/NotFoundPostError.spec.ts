import { describe, it, expect } from "vitest";
import { NotFoundPostError } from "./NotFoundPostError";

describe("NotFoundPostError", () => {
  it("should be an instance of AppError", () => {
    const error = new NotFoundPostError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NotFoundPostError);
  });

  it("should have the correct default message", () => {
    const error = new NotFoundPostError();
    expect(error.message).toBe("Blog post not found");
  });

  it("should have the correct default status code", () => {
    const error = new NotFoundPostError();
    expect(error.statusCode).toBe(404);
  });

  it("should have the default severity as 'low'", () => {
    const error = new NotFoundPostError();
    expect(error.severity).toBe("low");
  });

  it("should have sendSupportEmail as false by default", () => {
    const error = new NotFoundPostError();
    expect(error.sendSupportEmail).toBe(false);
  });
});
