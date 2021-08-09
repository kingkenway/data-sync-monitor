<template>
  <div id="inner-nav" class="w3-bar w3-margin-bottom">

    <div class="">
        <router-link :to="{ name: 'Accounts' }" class="w3-bar-item">MY ACCOUNTS</router-link>
        <router-link :to="{ name: 'Logs' }" class="w3-bar-item">ACTIVITY LOGS</router-link>
        <router-link :to="{ name: 'Settings' }" class="w3-bar-item">SETTINGS</router-link>
    </div>

    <div class="w3-right">
        <div class="w3-right-align" v-if="isLoggedIn">
            <router-link :to="{ name: 'profile' }" class="w3-bar-item">
                Hi, {{user.email}}
            </router-link>
            <router-link :to="{ name: 'Logout' }" class="w3-bar-item w3-black w3-text-white">Logout</router-link>
        </div>

    </div>
      

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'InnerNavbar',
  computed: mapGetters('auth', ['user', 'isLoggedIn']),
}
</script>

<style>
#inner-nav {
  padding: 15px;
  color: black;
  margin-top: 30px;
}
#inner-nav a {
  font-weight: bold;
  text-decoration: none;
}

#inner-nav a.router-link-exact-active {
    border-bottom: 1px solid black;
}
</style>