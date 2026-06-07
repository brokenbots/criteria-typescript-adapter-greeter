import { describe, expect, test, beforeAll } from "bun:test";
import { TestHost } from "@criteria/adapter-sdk/testing";
import { adapterConfig } from "../src/adapter.js";
import { spawn } from "child_process";

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

  test("emits manifest via --emit-manifest", async () => {
    const child = spawn("./out/adapter", ["--emit-manifest"], {
      cwd: process.cwd(),
      env: { ...process.env, CRITERIA_PLUGIN: "" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout!.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr!.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    const exitCode = await new Promise<number>((resolve) => {
      child.on("exit", resolve);
    });
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    expect(stdout).toContain("name: greeter");
    expect(stdout).toContain("version: 0.5.0");
    expect(stdout).toContain("sdk_protocol_version: 2");
  });

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
      expect(result.reason).toBe("Hello, team!");
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
      expect(result.reason).toBe("Hi world.");
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
      expect(result.reason).toBe("Hello, world!");
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
      expect(result.reason).toBe("Hello, team!");
    } finally {
      await host.stop();
    }
  });
});
