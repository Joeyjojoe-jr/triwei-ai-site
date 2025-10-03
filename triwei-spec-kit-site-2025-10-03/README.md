# TriWei.ai — Site + Spec Kit starter

Minimal React + Tailwind static site with GitHub Pages deploy. Includes Spec Kit scaffolding and the master prompt in `/spec/SPEC.md`.

## Quick start
1. Upload these files to a **new GitHub repo**.
2. In repo Settings → Pages:
   - Source: **GitHub Actions**.
   - The provided workflow will build and deploy on push.
3. Set your custom domain to `tri.wei.ai` (CNAME included).

## Local dev
```bash
npm i
npm run dev
```

## Spec‑Driven work in VS Code
Install prerequisites: Python 3.11+, Git, and **uv**.

```bash
# macOS/Linux or Windows (inside WSL)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai copilot
specify check
```

Open VS Code with GitHub Copilot or your agent. Use these commands in the chat:
- `/constitution` — create project principles
- `/specify` — loads `/spec/SPEC.md` and builds the spec
- `/clarify`
- `/plan`
- `/tasks`
- `/analyze`
- `/implement`

See `/spec/AGENT_FLOW.md` for a scripted session.

## Structure
- `src/` React components and sections
- `content/` episode and blog data
- `.spec/` agent scripts and helper notes
- `.github/workflows/deploy.yml` GitHub Pages pipeline

## License
MIT
