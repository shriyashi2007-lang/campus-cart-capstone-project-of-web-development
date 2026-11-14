import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], resolve: { alias: { 'lucide-react': '/src/lucide-react.jsx' } }, server: { proxy: { '/api': 'http://localhost:5000' } } });
