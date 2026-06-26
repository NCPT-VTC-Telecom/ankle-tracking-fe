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
                // Isolated Features structure
                shared: path.resolve(__dirname, './src/shared'),
                features: path.resolve(__dirname, './src/features'),
                // App-level (giữ ở src root)
                assets: path.resolve(__dirname, './src/assets'),
                routes: path.resolve(__dirname, './src/routes'),
                data: path.resolve(__dirname, './src/data'),
                config: path.resolve(__dirname, './src/config.ts'),
                settings: path.resolve(__dirname, './src/settings.ts'),
                styles: path.resolve(__dirname, './src/styles'),
                // Alias cũ repoint sang vị trí mới (an toàn — import đã rewrite sang shared/features)
                components: path.resolve(__dirname, './src/shared/components'),
                contexts: path.resolve(__dirname, './src/shared/contexts'),
                hooks: path.resolve(__dirname, './src/shared/hooks'),
                layout: path.resolve(__dirname, './src/shared/components/layout'),
                'menu-items': path.resolve(__dirname, './src/shared/menu-items'),
                sections: path.resolve(__dirname, './src/features/auth/sections'),
                store: path.resolve(__dirname, './src/shared/store'),
                themes: path.resolve(__dirname, './src/shared/themes'),
                types: path.resolve(__dirname, './src/shared/types'),
                utils: path.resolve(__dirname, './src/shared/utils'),
                api: path.resolve(__dirname, './src/shared/api')
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
