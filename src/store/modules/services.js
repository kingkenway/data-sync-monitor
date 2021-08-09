import axios from "axios";
import router from '@/router'
import store from '@/store'
import { operatorValues } from '@/utils/utils'
import qs from 'qs';

const state = {
  accounts: [],
  logs: [],
  transactions: [],
};

const getters = {
    
};

const actions = {

  addAccount ({ commit }, data) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'POST',
        url: "accounts/add",
        data: data,
      }).then(response => {
          console.log('ADDED ACCOUNT DATA');
          commit('update_accounts_data', response.data.data)
          resolve(response)
        }, error => {
          reject(error)          
        })
    })
  },

  getAccounts ({ commit }, id) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'GET',
        url: `accounts`,
      }).then(response => {
            console.log(response.data.data);
            commit('load_accounts_data', response.data.data)
            resolve(response)
        }, error => {
            reject(error)
        })
    })
  },

  fetchAccountId ({ commit }, token) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'POST',
        url: `services/account-id`,
        data: {code:token}
      }).then(response => {
            console.log('in services...');
            console.log(response.data);
            resolve(response)
        }, error => {
            reject(error)
        })
    })
  },

  getLogs ({ commit }, id) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'GET',
        url: `logs`,
      }).then(response => {
            console.log(response.data.data);
            commit('load_logs_data', response.data.data)
            resolve(response)
        }, error => {
            reject(error)
        })
    })
  },

  getTransactions ({ commit }, groupId) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'GET',
        url: `transactions/${groupId}`,
      }).then(response => {
            console.log(response.data.data);
            commit('load_transaction_data', response.data.data)
            resolve(response)
        }, error => {
            reject(error)
        })
    })
  },

  initiateDataSync ({ commit }, accountId) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'GET',
        url: `services/sync/${accountId}`,
      }).then(response => {
            // console.log(response.data);
            resolve(response)
        }, error => {
            reject(error)
        })
    })
  },

  initiateReauthorisation ({ commit }, accountId) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'GET',
        url: `services/reauth/${accountId}`,
      }).then(response => {
            // console.log(response.data);
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
  },


  deleteServiceData ({ commit }) {
    commit('reset_data')
  },

};

const mutations = {
  load_accounts_data(state, data){
    state.accounts = data;
  },
  load_logs_data(state, data){
    state.logs = data;
  },
  load_transaction_data(state, data){
    state.transactions = data;
  },
  update_accounts_data(state, data){
    state.accounts.push(data);
  },
  update_account_reauth_status(state, accountId){
    state.accounts = state.accounts.map(x => (x.accountId === accountId ? { ...x, reauthRequired: true } : x));
  },
  set_shops(state, data){
    state.shops = data
  },
  clear_transaction_data(state){
    state.transactions = [];
  },
  reset_data(state){
    state.accounts = [];
    state.logs = [];
    state.transactions = [];
  }

//   set_approved_shop(state, data){
//     const slug = router.currentRoute.params.slug
//     const shopIndex = state.shops.findIndex((obj => obj.sub_domain == slug))
//     state.shops[shopIndex].is_active = true
//   },

};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}