import { register } from "node:module";
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

// 拦截模块解析的钩子
async function resolve(specifier, context, defaultResolve) {
    // specifier 是导入路径（如 "./a"）
    // context 包含父模块路径等信息
    const { parentURL } = context;

    // 仅处理相对路径（以 ./ 或 ../ 开头），避免影响第三方模块
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
        // 将父模块的 URL 转为文件路径
        const parentPath = fileURLToPath(parentURL);
        const parentDir = dirname(parentPath);
        // 拼接可能的文件路径（尝试添加 .js）
        const candidatePath = join(parentDir, specifier + '.js');

        // 如果带 .js 的文件存在，则修改 specifier 为带后缀的路径
        if (existsSync(candidatePath)) {
            specifier += '.js';
        }
        // 如果 index.js 文件存在
        else if(existsSync(join(parentDir, specifier, "index.js"))){
            specifier += '/index.js'
        }
    }

    // 调用默认解析逻辑
    return defaultResolve(specifier, context, defaultResolve);
}

// 注册当前模块为 loader
register(new URL(import.meta.url), { parentURL: import.meta.url });
export { resolve };