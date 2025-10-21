import { defineStore } from 'pinia'


const initUserState = {
    id: '',
    name: '',
    avatarUrl: '',
    gender: 0,
};

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: { ...initUserState },
        token: '',
    }),

    getters: {
        name: (state) => state.userInfo.name,
    },

    actions: {
        /** 设置用户信息 */
        setUserInfo(data) {
            this.userInfo = data;
        },

        /** 设置请求token */
        setToken(token) {
            this.token = token;
        },
    },

    unistorage: true,
});
