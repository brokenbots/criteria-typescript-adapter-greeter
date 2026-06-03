import { serve } from "@criteria/adapter-sdk";

serve({
  name: "greeter",
  version: "2.0.0",
  description: "Minimal hello-world adapter.",
  source_url: "https://github.com/criteria-adapters/greeter",
  capabilities: [],
  platforms: ["linux/amd64", "linux/arm64", "darwin/arm64"],
  config_schema: { fields: { recipient: { type: "string", required: false, description: "Who to greet" } } },
  input_schema:  { fields: { mood: { type: "string", required: false, description: "happy|sad|neutral" } } },
  output_schema: { fields: { greeting: { type: "string", required: true, description: "The composed greeting" } } },
  secrets: [],
  permissions: [],
  async execute(req, helpers) {
    const recipient = req.config.recipient ?? "world";
    const mood = req.input.mood ?? "happy";
    const greeting = mood === "happy" ? `Hello, ${recipient}!` : `Hi ${recipient}.`;
    await helpers.outcomes.finalize("greeted", { greeting });
  },
});
