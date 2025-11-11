import logger from "../common/logger"
import config from "../config"

import OpenAI from "openai"

/**
 * 调用大模型
 * @param {String} prompt 提示词
 * @returns {Promise<import("../beans").LLMResult>}
 */
export const callLLM = async (prompt, sysMessage=[])=>{
    //检查参数是否配置
    const { llmBaseUrl, llmApiKey, llmModelId, llmTemperature, llmMaxToken } =  config.app
    if(!(llmApiKey && llmBaseUrl && llmModelId)){
        logger.error(`检测到配置文件中的 config.app.llmBaseUrl/llmApiKey/llmModelId 缺失，请填写后调用...`)
        throw `未配置LLM，请联系管理员`
    }

    const ai = new OpenAI({ apiKey: llmApiKey, baseURL: llmBaseUrl })
    logger.debug(`构建 openai 客户端/${llmBaseUrl} ...`)

    let messages = sysMessage.map(content=>({ role:'system', content}))
    messages.push({ role:'user', content: prompt })
    if(global.isDebug){
        for(let m of messages)
            logger.debug(`[提示词] ${m.role}\t${m.content}`)
    }

    let used = Date.now()

    logger.debug(`开始调用大模型（提示词${messages.length}个）...`)

    const resp = await ai.chat.completions.create({
        model: llmModelId,
        messages,
        temperature: llmTemperature,
        max_completion_tokens: llmMaxToken
    })

    used = Date.now() - used
    let content = resp.choices[0].message.content
    logger.debug(`大模型返回内容，耗时${used}ms...`)
    global.isDebug && console.debug(content)

    let token = null
    if(resp.usage){
        token += resp.usage.prompt_tokens
        token += resp.usage.completion_tokens
    }

    return { content, used, token }
}