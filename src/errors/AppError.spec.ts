import { describe, it, expect } from "vitest";
import { AppError } from "./AppError";

describe("AppError", () => {
  it("should create an error with default values", () => {
    const error = new AppError("Something went wrong");

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(400); // default
    expect(error.severity).toBe("low"); // default
    expect(error.sendSupportEmail).toBe(false); // default
  });

  it("should create an error with custom statusCode", () => {
    const error = new AppError("Unauthorized", 401);

    expect(error.statusCode).toBe(401);
  });

  it("should create an error with custom severity", () => {
    const error = new AppError("Critical error", 500, "high");

    expect(error.severity).toBe("high");
  });

  it("should create an error with sendSupportEmail true", () => {
    const error = new AppError("Notify support", 500, "medium", true);

    expect(error.sendSupportEmail).toBe(true);
  });

  it("should have the correct message and all properties together", () => {
    const error = new AppError("Full error", 503, "high", true);

    expect(error).toMatchObject({
      message: "Full error",
      statusCode: 503,
      severity: "high",
      sendSupportEmail: true,
    });
  });
});
