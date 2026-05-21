import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react({
                jsxImportSource: '@emotion/react',
                babel: {
                    plugins: ['@emotion/babel-plugin']
                }
            }),
            svgr({
                svgrOptions: {
                    // svgr options
                }
            })
        ],
        resolve: {
            alias: {
                // Map absolute imports to src directory
                assets: path.resolve(__dirname, './src/assets'),
                components: path.resolve(__dirname, './src/components'),
                contexts: path.resolve(__dirname, './src/contexts'),
                hooks: path.resolve(__dirname, './src/hooks'),
                layout: path.resolve(__dirname, './src/layout'),
                'menu-items': path.resolve(__dirname, './src/menu-items'),
                pages: path.resolve(__dirname, './src/pages'),
                routes: path.resolve(__dirname, './src/routes'),
                sections: path.resolve(__dirname, './src/sections'),
                store: path.resolve(__dirname, './src/store'),
                themes: path.resolve(__dirname, './src/themes'),
                types: path.resolve(__dirname, './src/types'),
                utils: path.resolve(__dirname, './src/utils'),
                api: path.resolve(__dirname, './src/api'),
                data: path.resolve(__dirname, './src/data'),
                config: path.resolve(__dirname, './src/config.ts'),
                settings: path.resolve(__dirname, './src/settings.ts'),
                styles: path.resolve(__dirname, './src/styles')
            }
        },
        server: {
            port: 3000,
            open: true,
            proxy: {
                // Proxy /api/gosafe → gosafe.vtctelecom.com.vn in dev to avoid CORS
                '/api/gosafe': {
                    target: 'https://gosafe.vtctelecom.com.vn',
                    changeOrigin: true,
                    secure: true,
                },
            },
        },
        build: {
            outDir: 'build',
            sourcemap: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        'mui-vendor': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
                        'chart-vendor': ['react-apexcharts', '@fullcalendar/react']
                    }
                }
            }
        },
        define: {
            // Replace process.env with import.meta.env
            'process.env': env
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                '@mui/material',
                '@emotion/react',
                '@emotion/styled'
            ]
        }
    };
});
