import { describe, it, expect } from "vitest";
import { SubscriptionNotFoundError } from "./SubscriptionNotFoundError";

describe("SubscriptionNotFoundError", () => {
  it("should be an instance of AppError", () => {
    const error = new SubscriptionNotFoundError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SubscriptionNotFoundError);
  });

  it("should have the correct default message", () => {
    const error = new SubscriptionNotFoundError();
    expect(error.message).toBe("Inscrição à newsletter não localizada");
  });

  it("should have the correct default status code", () => {
    const error = new SubscriptionNotFoundError();
    expect(error.statusCode).toBe(400);
  });

  it("should have the default severity as 'low'", () => {
    const error = new SubscriptionNotFoundError();
    expect(error.severity).toBe("low");
  });

  it("should have sendSupportEmail as false by default", () => {
    const error = new SubscriptionNotFoundError();
    expect(error.sendSupportEmail).toBe(false);
  });
});
