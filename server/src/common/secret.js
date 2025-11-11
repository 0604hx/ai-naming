import crypto from 'sm-crypto'
import jwt from 'jsonwebtoken'

/**
 * SM4加密（类似 AES）
 * @param {String} text
 * @param {String} key
 * @returns {String}
 */
export const sm4Encrypt = (text, key)=> crypto.sm4.encrypt(text, key)

/**
 *
 * @param {String} text
 * @param {String} key
 * @returns {String}
 */
export const sm4Decrypt = (text, key)=> crypto.sm4.decrypt(text, key)

/**
 *
 * @param {String} seed
 * @returns {String}
 */
export const createSm4Key = (seed)=> crypto.sm3(seed||`${Date.now()}`).substring(8, 40)

export const sm3 = text=> crypto.sm3(text)

export const stringToBase64 = o=> Buffer.from(typeof(o)=='string'?o:JSON.stringify(o)).toString('base64')

export const base64ToString = text=> Buffer.from(text, 'base64').toString('utf-8')

/**
 * options 可设置 expiresIn 配置过期
 * @param {*} playload
 * @param {String} key
 * @param {jwt.SignOptions} options
 * @returns {String}
 */
export const createJwtToken = (playload, key, options={})=> jwt.sign(playload, key, options)

export const verifyJwtToken = (token, key)=> jwt.verify(token, key)
