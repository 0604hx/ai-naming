import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import Uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import legacy from '@vitejs/plugin-legacy'

import pkg from './package.json'

// https://vitejs.dev/config/
export default async ({ mode }) => {
    // docs: https://unocss.dev/
    const env = loadEnv(mode, path.resolve(process.cwd(), 'env'));
    const {
        VITE_APP_PORT,
        VITE_SERVER_BASEURL,
        VITE_DELETE_CONSOLE,
        VITE_SHOW_SOURCEMAP,
        VITE_PROXY_ENABLED,
        VITE_PROXY_PREFIX,
    } = env;

    return defineConfig({
        // 配置环境变量路径
        envDir: './env',
        // 配置别名
        resolve: {
            alias: {
                '@' :   path.join(process.cwd(), './src'),
                '@C':   path.join(process.cwd(), './src/components'),
                '@U':   path.join(process.cwd(), './src/utils'),
            },
        },
        define:{
            __APP_VERSION__ : JSON.stringify(pkg.version)
        },
        // 插件注意： Unixx需要在Uni()之前引入
        plugins: [
            process.env.UNI_PLATFORM === 'h5' &&
            legacy({
                targets: [
                    '> 0%',
                    'Chrome > 4',
                    'Android >= 4',
                    'IOS >= 7',
                    'not ie <= 6',
                    'Firefox ESR',
                ],
                renderLegacyChunks: true,
            }),
            // UniLayouts(),
            Uni(),
            AutoImport({
                imports: [
                    'vue',
                    'uni-app',
                    {
                        from: 'uni-mini-router',
                        imports: ['createRouter', 'useRouter', 'useRoute'],
                    },
                    {
                        from: 'wot-design-uni',
                        imports: ['useToast', 'useMessage', 'useNotify']
                    }
                ],
                eslintrc: { enabled: true, globalsPropValue: true },
                vueTemplate: true,
            })
        ],
        // 开发配置
        server: {
            host: 'localhost',
            hmr: true,
            port: Number.parseInt(VITE_APP_PORT, 10),
            // h5端配置跨域配置，配置文件.env进行开启关闭
            proxy: JSON.parse(VITE_PROXY_ENABLED)
                ? {
                    [VITE_PROXY_PREFIX]: {
                        target: VITE_SERVER_BASEURL,
                        changeOrigin: true,
                        rewrite: (path) => path.replace(new RegExp(`^${VITE_PROXY_PREFIX}`), ''),
                    },
                }
                : undefined,
        },
        // 构建配置
        build: {
            sourcemap: JSON.parse(VITE_SHOW_SOURCEMAP),
            target: 'es6',
            // 开发环境不用压缩
            minify: mode === 'development' ? false : 'terser',
            terserOptions: {
                compress: {
                    drop_console: JSON.parse(VITE_DELETE_CONSOLE),
                    drop_debugger: true,
                },
            },
        },
    });
};
