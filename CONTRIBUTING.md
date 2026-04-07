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

## 🔁 1. The Daily Save Loop (Top Priority)
*You use these commands multiple times a day when finishing an API controller or Mongoose model.*

```bash
git checkout -b feature/my-new-feature    # Create and switch to new branch
# ... write code ...
git status                                # Check what files you changed
git add .                                 # Stage all your backend/frontend changes
git commit -m "feat: description of work" # Save the snapshot with a good prefix (feat:, fix:, chore:)
git pull origin main                      # ALWAYS pull the latest main before you push!
git push origin feature/my-new-feature    # Push your code to the cloud

git checkout main                         # Switch back to the main branch
```

## 🚑 2. The "Oops!" Fixes (Most Used Rescues)
*You used these recently when a commit message had a typo or missed a file.*

```bash
git commit --amend -m "the fully corrected message here" # Fix a typo in the commit message you JUST made
git add forgotten-file.js
git commit --amend --no-edit                             # Add a file you forgot to your last commit
git push origin <branch-name> --force                    # Push to GitHub AFTER you amended a commit (Overrides the cloud)
```

## 📦 3. Stashing (Holding your place)
*If you are halfway through a controller, but suddenly need to switch branches to fix a bug, use this instead of making a messy half-finished commit.*

```bash
git stash       # Hide your unsaved changes temporarily
# (Switch branches, do your work, come back to this branch)
git stash pop   # Bring your hidden changes back to your screen
```

## 🔬 4. Viewing History
*When you need to remember what you did yesterday.*

```bash
git log --oneline  # View a simple, clean list of your past commits
git diff           # See the exact lines of code you changed before committing
```

## 🛠️ 5. Initial Setup & Advanced
*Things you rarely need, but should keep on hand.*

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"  # Set your global username/email
git clone <url>                                  # Clone a repository from scratch
git restore .                                    # Throw away ALL unsaved local changes in your working directory (Dangerous!)
```