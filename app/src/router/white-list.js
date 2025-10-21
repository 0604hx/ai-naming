const OPEN_ON_LOGIN = false

/** 免登录白名单（匹配路由 path） */
const whiteListByPath = ['/pages-sub/login/index'];

/** 需要登录的白名单 匹配路由 path） 如：['/sub-pages/detail/index'] */
const loginList = [];

/** 判断是否在白名单 */
export const isWhiteList = (to) => {
    if (OPEN_ON_LOGIN)
        return whiteListByPath.indexOf(to) !== -1;
    else
        return loginList.indexOf(to) === -1;
};
