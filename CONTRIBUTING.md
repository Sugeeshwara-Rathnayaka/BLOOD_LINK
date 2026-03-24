# 🤝 Contributing to Blood-Link

Welcome to the Blood-Link backend repository! To keep our codebase clean, readable, and highly professional, we strictly follow the **Conventional Commits** standard for all changes.

---

## 🌳 Branching Strategy
We use a **Feature Branch** workflow. The `main` branch is for stable, production-ready code only.

1. **Never push directly to `main`.**
2. **Create a branch** for every new task:
   - `feature/your-feature-name` (e.g., `feature/donor-login`)
   - `fix/your-fix-name` (e.g., `fix/date-validation`)
3. **Open a Pull Request (PR)** to merge your branch into `main`.
4. **CI/CD Check:** Your PR will only be merged if the GitHub Actions "Build & Test" pipeline passes (Green ✅).

---

## 📝 Commit Message Guidelines

Every time you save code to this repository, your commit message must use one of the following prefixes to categorize the work.

### 🌟 The Core Types

- **`feat:` (Feature)**
  - **Use when:** You are adding brand new functionality to the API.
  - _Example:_ `feat: add GET API to fetch all upcoming campaigns`
- **`fix:` (Bug Fix)**
  - **Use when:** You are repairing broken code or resolving a crash.
  - _Example:_ `fix: resolve crash when hospital admin rejects a campaign without comments`
- **`chore:` (Chores & Maintenance)**
  - **Use when:** You are updating configurations, installing new npm packages, or modifying the CI/CD pipeline.
  - _Example:_ `chore: install jest and configure testing suite`

### 🛠️ The Clean Code Types

- **`docs:` (Documentation)**
  - **Use when:** You are only changing text in Markdown files or adding code comments.
  - _Example:_ `docs: add contributing guidelines and commit standards`
- **`style:` (Formatting)**
  - **Use when:** You are fixing spaces, indentations, or formatting (usually via Prettier). No logic changes.
  - _Example:_ `style: format all controllers using prettier`
- **`refactor:` (Restructuring)**
  - **Use when:** You are rewriting code to make it cleaner or faster, but it still does the exact same thing.
  - _Example:_ `refactor: move error handler from campaign model into global middleware`
- **`test:` (Testing)**
  - **Use when:** You are adding or fixing Jest test files.
  - _Example:_ `test: add unit test for hospital approval logic`

---

_Note: By strictly following these rules, our CI/CD pipeline can automatically generate accurate Release Notes when we deploy a new version to production!_


---

## 🚀 Workflow for Contributors

### Using Terminal:
```bash
git checkout -b feature/my-new-feature   # Create and switch to new branch
# ... write code ...
git add .
git commit -m "feat: description of work"
git push origin feature/my-new-feature