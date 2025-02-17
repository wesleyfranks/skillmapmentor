import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.mjs'],
  },
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'], // Exclude from bundle
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        manualChunks: {
          pdfjs: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.mjs'],
        },
      },
    },
  },
}));
