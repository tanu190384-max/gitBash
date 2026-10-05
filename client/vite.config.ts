import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig, loadEnv } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Semantic palette. Every colour is an HSL triple defined as a CSS variable in
 * `src/index.css`, so the same token resolves correctly in both themes and a
 * single definition drives Tailwind, shadcn/ui and hand-written CSS.
 */
const semantic = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, here, '');
  // Proxy target for the dev server; VITE_API_URL still wins at runtime.
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:5000';

  return {
    plugins: [react()],

    resolve: {
      alias: { '@': path.resolve(here, 'src') },
    },

    css: {
      // Tailwind is configured inline rather than in tailwind.config.js so the
      // build has one source of truth. Extract it to a config file unchanged if
      // a tool ever needs to read it standalone.
      postcss: {
        plugins: [
          tailwindcss({
            darkMode: 'class',
            content: ['./index.html', './src/**/*.{ts,tsx}'],
            theme: {
              container: {
                center: true,
                padding: { DEFAULT: '1rem', lg: '2rem' },
                screens: { '2xl': '1400px' },
              },
              extend: {
                colors: {
                  border: semantic('border'),
                  input: semantic('input'),
                  ring: semantic('ring'),
                  background: semantic('background'),
                  foreground: semantic('foreground'),
                  primary: {
                    DEFAULT: semantic('primary'),
                    foreground: semantic('primary-foreground'),
                  },
                  secondary: {
                    DEFAULT: semantic('secondary'),
                    foreground: semantic('secondary-foreground'),
                  },
                  muted: {
                    DEFAULT: semantic('muted'),
                    foreground: semantic('muted-foreground'),
                  },
                  accent: {
                    DEFAULT: semantic('accent'),
                    foreground: semantic('accent-foreground'),
                  },
                  card: {
                    DEFAULT: semantic('card'),
                    foreground: semantic('card-foreground'),
                  },
                  popover: {
                    DEFAULT: semantic('popover'),
                    foreground: semantic('popover-foreground'),
                  },
                  destructive: {
                    DEFAULT: semantic('destructive'),
                    foreground: semantic('destructive-foreground'),
                  },
                  // Emergency state colours. Deliberately distinct from
                  // `destructive`, which is reserved for irreversible actions —
                  // a HIGH incident is not a dangerous button.
                  severity: {
                    low: semantic('severity-low'),
                    moderate: semantic('severity-moderate'),
                    high: semantic('severity-high'),
                    critical: semantic('severity-critical'),
                  },
                },
                borderRadius: {
                  lg: 'var(--radius)',
                  md: 'calc(var(--radius) - 2px)',
                  sm: 'calc(var(--radius) - 4px)',
                },
                fontFamily: {
                  sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                },
                keyframes: {
                  'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                  },
                  'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                  },
                  'fade-up': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                  },
                  'pulse-ring': {
                    '0%': { opacity: '0.6', transform: 'scale(0.9)' },
                    '70%': { opacity: '0', transform: 'scale(1.6)' },
                    '100%': { opacity: '0', transform: 'scale(1.6)' },
                  },
                },
                animation: {
                  'accordion-down': 'accordion-down 0.2s ease-out',
                  'accordion-up': 'accordion-up 0.2s ease-out',
                  'fade-up': 'fade-up 0.4s ease-out both',
                  'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                },
              },
            },
            plugins: [],
          }),
          autoprefixer(),
        ],
      },
    },

    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        // Lets the client call /api and /uploads on its own origin in dev,
        // which keeps cookie auth working without CORS exceptions.
        '/api': { target: apiOrigin, changeOrigin: true },
        '/uploads': { target: apiOrigin, changeOrigin: true },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Keep the heavy, rarely-changing libraries in their own chunks so a
          // UI tweak does not invalidate the whole bundle.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            map: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  };
});
