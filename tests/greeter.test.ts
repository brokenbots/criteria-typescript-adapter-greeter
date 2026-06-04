import { describe, expect, test, beforeAll } from "bun:test";
import { TestHost } from "@criteria/adapter-sdk/testing";
import { adapterConfig } from "../src/adapter.js";

describe("greeter adapter", () => {
  beforeAll(async () => {
    const build = Bun.spawn(["bun", "run", "build"], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await build.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(build.stderr).text();
      throw new Error(`Build failed: ${stderr}`);
    }
  }, 60000);

  test("greets happily by default (in-process)", async () => {
    const host = new TestHost({ config: adapterConfig });
    try {
      await host.openSession({ config: { recipient: "team" } });
      const result = await host.execute({
        stepName: "greet",
        input: { mood: "happy" },
        allowedOutcomes: ["greeted"],
      });
      expect(result.outcome).toBe("greeted");
    } finally {
      await host.stop();
    }
  });

  test("greets sadly when mood is sad (in-process)", async () => {
    const host = new TestHost({ config: adapterConfig });
    try {
      await host.openSession({ config: { recipient: "world" } });
      const result = await host.execute({
        stepName: "greet",
        input: { mood: "sad" },
        allowedOutcomes: ["greeted"],
      });
      expect(result.outcome).toBe("greeted");
    } finally {
      await host.stop();
    }
  });

  test("uses default recipient and mood (in-process)", async () => {
    const host = new TestHost({ config: adapterConfig });
    try {
      await host.openSession({ config: {} });
      const result = await host.execute({
        stepName: "greet",
        input: {},
        allowedOutcomes: ["greeted"],
      });
      expect(result.outcome).toBe("greeted");
    } finally {
      await host.stop();
    }
  });

  test("greets happily via compiled binary", async () => {
    const host = new TestHost({ binary: "./out/adapter" });
    try {
      await host.openSession({ config: { recipient: "team" } });
      const result = await host.execute({
        stepName: "greet",
        input: { mood: "happy" },
        allowedOutcomes: ["greeted"],
      });
      expect(result.outcome).toBe("greeted");
    } finally {
      await host.stop();
    }
  });
});
