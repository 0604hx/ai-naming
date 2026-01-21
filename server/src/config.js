import { readFileSync, existsSync, statSync, watch } from 'node:fs'
import { debounce, merge } from 'lodash-es'
import logger from './common/logger.js'
import  { CONFIG_FILE, C } from './fields.js'

const configFile = CONFIG_FILE

const config = {
    port: 10002,
    cors: !global.isPro ?? false,
    dataDir: "data",        //附近保存路径
    /**
     * 静态资源处理
     *
     * nginx 处理
     *
        # 让 Nginx 直接托管 /h5 （示例） 下的文件
        location /h5/ {
            root /path/to/www;
            try_files $uri $uri/ /h5/index.html;

            # 缓存 1 天
            expires 1d;

            # 自动生成 ETag
            etag on;

            # 推荐加上 gzip 支持
            gzip on;
            gzip_types text/plain text/css application/javascript application/json image/svg+xml;
        }
     */
    wwwEnable: true,        //是否启用静态资源，如果前置 nginx，建议关闭此功能（nginx 性能更高更稳定）
    wwwDir: "h5",           //静态资源目录
    wwwPrefix: "/h5",       //静态资源前缀，默认 /，注意结尾无需填写 /
    wwwCache: 86400,        //静态资源缓存，单位 秒，默认1天
    wwwEtag: true,          //是否启用 etag 实体标签，用于判断缓存更新
    /**
     * 服务地址前缀，留空则使用请求的地址，通常用于页面跳转
     * 示例 http://localhost:10002/
     * 要以 / 结尾噢
     */
    server: "",

    pageViewEnable: true,   //是否启用 PV 统计

    app:{
        trialSize: 5,           //试用积分，设置<=0时将不启用
        trialPreDay: 10,        //每天最多允许试用数，超过则提示今日试用名额已用完，设置<=0则无限制

        couponLen: 6,           //积分券ID长度
        couponQuota: 10,        //默认积分券额度
        showScore: true,        //是否回显名称得分，配置为 false 则结果不会返回 score 值
        useMock: false,         //取名时是否启用随机数据（用于功能演示，避免调用大模型产生费用）
        markLimit: 100,         //用户查看收藏的名字数量上限

        /**
         * 模块主题配色，如果在 module.yaml 中没有指定颜色，则从该配置中顺位赋值
         * 方便统一更换配色😄
         *
         * 初版配色："#BBDEFB","#D1C4E9","#FFCDD2"
         */
        // modColors:["#8A75AF","#D47A92","#CAE4E2","#D1C5A5","#CF9EA0","#E6D1D5","#9FB7BD"],
        // 2025-12-05
        // modColors:["#B3DEF7","#D2E7D3","#F6E0D8","#BFE1E5","#E3EACB","#E8EBEC","#E6D9EB"],
        modColors:["#0091D8","#E73649","#EE7D09","#F8BD00","#96C535","#00A496","#D45F9D"],
        modColorDark: 0,       //暗色处理，0为原色，100为纯黑

        /**
         * 大模型配置参数，参考 openAI SDK
         */
        llmModelId: null,
        llmBaseUrl: "",
        llmApiKey:  "",
        llmTemperature: 0.7,
        llmMaxToken: 500,

        //通用提示词（添加在末尾），需要与解析程序配套😄
        prompt: `返回{{limit}}个结果（每行一个），格式为：姓名 评分 解析，示例：李白 100 “白”有纯洁、明亮之意,寓意人格高洁。如果无法给出评分则写0！`
    },
    img: {
        toWebp: true,       //是否转换为 webp 格式
        exts: ["JPG","PNG","JPEG"],
        quality: 60,        //webp 质量（0到100）
    },
    db: {
        prefix: "",
        type: "sqlite3",
        file:"naming.db"
    },
    secret: {
        autoInit: true,
        adminAccount: "admin",
        pwdRetryMax: 3,
        sm4Key: "6e8fdcf1f6823938af8a09b878fa77f3",
        jwtKey: "0a9c89fa6304f4764be94ae9cda1ecbd",
        jwtExpire: process.env.NODE_ENV === 'production'? "12h" : "365d",
        // 携带 JWT 的请求头名称，请填写小写
        header: "nua",

        /**
         * 特权配置，用于执行特殊操作
         * 请通过 server.js --config 生成
         */
        presHeader: "president",
        presKey: "",
        presPwd: ""
    },
    http: {
        // /common/** 资源的缓存时间，设置小于等于0则不推荐缓存头
        commonExpire: 3600
    },
    sys :{
        log: true,              //是否记录操作日志
        logMax: 360,            //日志存活天数
    }
}


const loadConfig = ()=> {
    let fileCfg = JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }))
    merge(config, fileCfg)
    return fileCfg
}

//仅当生产模式才监听配置文件的变动
if(existsSync(configFile) && statSync(configFile).isFile()){
    let fileCfg = loadConfig()
    //开启监听
    const onConfigChange = debounce(()=>{
        logger.info("监听到配置文件变化 :)", configFile)
        loadConfig()
    }, 1000)

    //仅当生产模式才监听配置文件的变动
    if(global.isPro || process.env.NODE_ENV=='production')
        watch(configFile, onConfigChange)

    global.isDebug && logger.debug(`从${configFile}中读取配置文件`, fileCfg)
}

export default config
