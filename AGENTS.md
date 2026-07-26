## Responses

- Keep responses concise and to the point - unless the user asks otherwise
- **The user is the product owner, not an engineer.** Explain decisions and ask questions in plain English with concrete examples. Ask about the goal/outcome, never the implementation technique. When presenting options, describe what each one means for a human using the product — not what the code looks like. Save technical detail for implementation notes.

## Planning Mode

- **Always ask** clarifying questions
- **Never assume** design, tech stack or features

## Lessons learned \(read first\)



## UI work — required skills
**Never make technical decisions without consulting the user.** This includes
framework choices, data formats, architectural patterns, and dependency
additions. Present options with trade-offs and ask — do not assume.

## Directory Routing Map


## Guardrails & Safety Rules

1. **Context Isolation**: When evaluating new ideas, read career-kb/ for context, but dump all thoughts, research, and code drafts into /discovery.
2. **Idempotency**: Never alter existing database schemas or core business logic in career-kb/ during ideation or research phase.

## Project Boundary

- **This project root is `/home/rui/career-kb/`.** Do not read, write, or execute anything inside other project directories under `/home/rui/projects/*` unless Rui explicitly asks for that specific cross-project work in the current session.
- If a task seems to require another project's files, stop and ask — the answer is almost always "you're in the wrong context."
- System-level operations outside the project are fine when the task requires them (package installs, DB connections, `~/.hermes` config, `/tmp` for OS temp files), but never touch *other project* directories.
- All throwaway work (verification scripts, scraped data, scratch files) goes in `career-kb/.audit-tmp/` (gitignored). Never leave temp files in the repo root.

## Editable copy convention


## Deployment


## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH\_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH\_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current \(AST-only, no API cost\).
