import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-utils';
          }
          if (id.includes('nicosWegPlaylist')) {
            return 'data-nicos-weg';
          }
          if (
            id.includes('germanAlphabetData') ||
            id.includes('germanNounDictionary') ||
            id.includes('germanPhoneticData') ||
            id.includes('germanGrammarConstants')
          ) {
            return 'data-german-linguistics';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
