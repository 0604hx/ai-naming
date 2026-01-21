import { isWhiteList } from '@/router';

const navigateToInterceptor = {
    invoke({ url }) {
        const flag = isWhiteList(url);
        if (!flag) return uni.navigateTo({ url: '/sub-pages/login/index' });
        return flag;
    },
};

export const routeInterceptor = {
    install() {
        uni.addInterceptor('navigateTo', navigateToInterceptor);
        uni.addInterceptor('reLaunch', navigateToInterceptor);
        uni.addInterceptor('redirectTo', navigateToInterceptor);
    },
};
