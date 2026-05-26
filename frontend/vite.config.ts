/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    server: {
        allowedHosts: true,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Séparer les dépendances volumineuses en chunks distincts
                    if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
                        return 'pdf-viewer';
                    }
                    if (id.includes('@monaco-editor') || id.includes('tinymce')) {
                        return 'editor';
                    }
                    if (id.includes('primereact')) {
                        return 'prime-react';
                    }
                    if (id.includes('recharts')) {
                        return 'charts';
                    }
                    if (id.includes('@dnd-kit')) {
                        return 'dnd-kit';
                    }
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                            return 'vendor-core';
                        }
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
})
