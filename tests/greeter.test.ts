import { TestHost } from "@criteria/adapter-sdk/testing";

test("greets happily by default", async () => {
  const host = new TestHost({ binary: "./out/adapter-linux-amd64" });
  await host.openSession({ config: { recipient: "team" } });
  const result = await host.execute({ step: "greet", input: { mood: "happy" } });
  expect(result.outcome).toBe("greeted");
  expect(result.outputs.greeting).toBe("Hello, team!");
});
