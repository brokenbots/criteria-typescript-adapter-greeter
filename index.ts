import { serve } from "@criteria/adapter-sdk";
import { adapterConfig } from "./src/adapter.js";

function emitYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean") return obj ? "true" : "false";
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}[]`;
    return obj
      .map((item) => {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const keys = Object.keys(item);
          if (keys.length === 0) return `${pad}- {}`;
          const first = keys[0];
          const rest = keys.slice(1);
          const firstVal = emitYaml((item as Record<string, unknown>)[first], 0);
          let lines = `${pad}- ${first}: ${firstVal}`;
          for (const k of rest) {
            lines += `\n${pad}  ${k}: ${emitYaml((item as Record<string, unknown>)[k], 0)}`;
          }
          return lines;
        }
        return `${pad}- ${emitYaml(item, 0)}`;
      })
      .join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${pad}{}`;
    return entries
      .map(([k, v]) => {
        if (v !== null && typeof v === "object") {
          return `${pad}${k}:\n${emitYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${emitYaml(v, 0)}`;
      })
      .join("\n");
  }
  return String(obj);
}

if (process.argv.includes("--emit-manifest")) {
  const manifest = {
    schema_version: 1,
    name: adapterConfig.name,
    version: adapterConfig.version,
    description: adapterConfig.description,
    source_url: adapterConfig.source_url,
    capabilities: adapterConfig.capabilities ?? [],
    platforms: (adapterConfig.platforms ?? []).map((p: string) => {
      const [os, arch] = p.split("/");
      return { os, arch };
    }),
    sdk_protocol_version: 2,
    config_schema: adapterConfig.config_schema,
    input_schema: adapterConfig.input_schema,
    output_schema: adapterConfig.output_schema,
    secrets: adapterConfig.secrets ?? [],
    permissions: adapterConfig.permissions ?? [],
  };
  console.log(emitYaml(manifest));
  process.exit(0);
}

serve(adapterConfig);
