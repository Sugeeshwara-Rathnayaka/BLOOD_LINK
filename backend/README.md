# 🩸 Blood-Link Backend

This is the backend API for the Blood-Link platform, built with Node.js, Express, and MongoDB using a modern Domain-Driven Design (DDD) architecture.

## 🚀 Available Scripts

In the project directory, you can run the following commands. These scripts act as the control panel for the entire engineering team and the CI/CD pipeline.

### `npm run dev`
Runs the app in the development mode using `nodemon`. The server will automatically restart if you make edits.

### `npm start` (The Production Engine)
Starts the server using the native `node` command. **You must never run nodemon in production** because it consumes too much memory watching for file changes. This script is used by live servers (like AWS, Render, or DigitalOcean) for maximum performance.

### `npm run lint` & `npm run lint:fix` (The Code Police)
Runs ESLint to scan the code for bugs, bad practices, and unused variables without even running the app. In our CI/CD pipeline, if the linting fails, the code is blocked from merging.

### `npm run format` (The Beautifier)
Runs Prettier to ensure every developer on the team uses the exact same spacing, quotes, and indentation. Running this makes the codebase look perfectly uniform.

### `npm run test` (The QA Department)
Runs the automated testing suite using Jest. Industry projects require automated testing to ensure new features don't break existing ones.
* Use `npm run test:watch` to keep tests running while you code.
* Use `npm run test:coverage` to generate an HTML report showing exactly what percentage of the code has been tested. *(Note: The `--experimental-vm-modules` flag is used because this project uses modern ES Modules).*

### `npm run seed` (The Database Welder)
Since this app relies on static data (like the 25 districts, or a master list of hospitals), this script instantly wipes and fills the database with dummy data so new developers can start testing immediately.