import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import db from '../../../datastore/index'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        let user = db.get("users").find({ username: username, password: userInfo.password}).value();
        if(user){
            setToken(user.token)
            commit('SET_TOKEN', user.token)
            resolve()
        }else{
          reject();
        }
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        let user = db.get("users").find({ token: state.token}).value();
        if(user){
            if (user.roles && user.roles.length > 0) { // 验证返回的roles是否是一个非空数组
                commit('SET_ROLES', user.roles)
            } else {
                reject('getInfo: roles must be a non-null array !')
            }
            commit('SET_NAME', user.name)
            commit('SET_AVATAR', user.avatar)
            resolve(user)
        }else{
          reject()
        }

      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        removeToken()
        commit('SET_TOKEN', '')
        resolve()
      })
    }
  }
}

export default user
