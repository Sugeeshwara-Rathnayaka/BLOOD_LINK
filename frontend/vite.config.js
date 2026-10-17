import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Replace 3000 with your preferred port
    strictPort: true, // Forces Vite to exit if the port is already busy
  },
});
