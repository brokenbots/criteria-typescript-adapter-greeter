# criteria-adapter-greeter (example)

A minimal "hello-world" [Criteria](https://github.com/brokenbots/criteria)
adapter (protocol v2), built on the
[TypeScript adapter SDK](https://github.com/brokenbots/criteria-typescript-adapter-sdk).
It composes a greeting and reports a single `greeted` outcome — the reference
example for building a TS adapter.

## Install

Published as a signed, multi-platform OCI artifact
(`linux/amd64`, `linux/arm64`, `darwin/arm64`). Pin and lock it:

```bash
criteria adapter lock <workflow-dir>
```

## Setup (adapter configuration)

```hcl
adapter "greeter" "hello" {
  source  = "ghcr.io/brokenbots/criteria-adapter-greeter"
  version = "0.5.x"
  config {
    recipient = "team"
  }
}
```

| Config key | Type | Required | Description |
|------------|------|----------|-------------|
| `recipient` | string | no | Who to greet (default: `world`). |

## Step inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `mood` | string | no | `happy` \| `sad` \| `neutral` — shapes the greeting (default: `happy`). |

```hcl
step "greet" {
  adapter = adapter.greeter.hello
  input { mood = "happy" }
  outcome "greeted" { next = state.done }
}
```

## Config overrides

`recipient` is session-scoped (adapter `config {}`); `mood` is the per-step
input. There are no keys that exist in both, so there is nothing to override per
step beyond `mood`.

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `reason` | string | The composed greeting. |

Outcome: always `greeted`.

## Build & test

```bash
bun install
bun test       # `pretest` compiles the binary first
bun run build  # single-platform build into out/
```

The SDK is consumed as a `file:` dependency, so check it out as a sibling
directory (`../criteria-typescript-adapter-sdk`) and build it first.

## Security & dependencies

See [SECURITY.md](SECURITY.md) and [docs/dependency-policy.md](docs/dependency-policy.md).
Reproduce the CI security checks locally:

```bash
bun run vuln-scan      # osv-scanner — blocking known-vulnerability gate (reads bun.lock)
bun run deps:outdated  # bun outdated — freshness report
```

## Publish (multi-platform)

Tagging `vX.Y.Z` cross-compiles `linux/amd64`, `linux/arm64`, and `darwin/arm64`
and publishes them as a single multi-platform, signed OCI artifact to
`ghcr.io/brokenbots/criteria-adapter-greeter:X.Y.Z` via
[`brokenbots/publish-adapter`](https://github.com/brokenbots/publish-adapter).

## License

Apache-2.0.
