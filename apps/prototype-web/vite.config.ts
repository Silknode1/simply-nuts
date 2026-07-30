import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite ignores $PORT by default. Honouring it lets the tooling assign a free
// port instead of everyone fighting over 5173 — an orphaned dev server from a
// previous session used to block startup entirely. When a port IS assigned,
// strictPort makes a collision fail loudly rather than silently drifting to
// another port the launcher isn't watching.
const assignedPort = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: assignedPort ?? 5173,
    strictPort: assignedPort !== undefined
  }
});
