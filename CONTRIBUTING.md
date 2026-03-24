# 🤝 Contributing to Blood-Link

Welcome to the Blood-Link backend repository! To keep our codebase clean, readable, and highly professional, we strictly follow the **Conventional Commits** standard for all changes.

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
