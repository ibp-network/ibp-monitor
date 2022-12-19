<template>

  <nav class="navbar is-dark is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <img src="/image/IBP2.png" width="28" height="28">
        <p class="subtitle">
          IBP Dashboard
        </p>
      </router-link>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="toggleNavBar()">
        <!-- <div v-show="!isActive">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </div>
        <span v-show="isActive" class="icon">
          <i class="mdi-close"></i>
        </span> -->
        <div class="menu-btn" :class="isActive?'open':''">
          <div class="menu-btn__burger"></div>
        </div>
      </a>
    </div>
    <div id="navbarBasicExample" class="navbar-menu" :class="isActive?'is-active':''">
      <div class="navbar-start">
        <a class="navbar-item" @click="navTo('/service')">
          Services
        </a>
        <a class="navbar-item" @click="navTo('/monitor')">
          Monitors
        </a>
        <a class="navbar-item" @click="navTo('/healthCheck')">
          Checks
        </a>
        <!-- <a class="navbar-item" @click="navTo('/sign')">
          Message
        </a> -->
      </div>

      <div class="navbar-end">
        <div class="navbar-item has-text-right is-family-code">
          <small><small>
            ui: {{packageVersion}} <br>
            api: {{ apiVersion }}
          </small></small>
        </div>
      </div>
    </div>
  </nav>

</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapState(['packageVersion', 'apiVersion'])
  },
  data () {
    return {
      isActive: false
    }
  },
  methods: {
    toggleNavBar () {
      this.isActive = !this.isActive
    },
    navTo (route: string) {
      this.isActive = false
      // console.debug(this.$route)
      if (this.$route.path !== route) {
        this.$router.push(route)
      }
    }
  }
})
</script>

<style scoped>
.menu-btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all .5s ease-in-out;
  /* border: 3px solid #fff; */
}
.menu-btn__burger {
  width: 24px;
  height: 1px;
  background: #fff;
  border-radius: 1px;
  /* box-shadow: 0 2px 5px rgba(255,101,47,.2); */
  transition: all .3s ease-in-out;
}
.menu-btn__burger::before,
.menu-btn__burger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 1px;
  background: #fff;
  border-radius: 1px;
  /* box-shadow: 0 2px 5px rgba(255,101,47,.2); */
  transition: all .3s ease-in-out;
}
.menu-btn__burger::before {
  transform: translateY(-9px);
}
.menu-btn__burger::after {
  /* transform: rotate(-45px); */
  transform: translateY(9px);
}
/* ANIMATION */
.menu-btn.open .menu-btn__burger {
  transform: translateX(50px);
  background: transparent;
  box-shadow: none;
}
.menu-btn.open .menu-btn__burger::before {
  transform: rotate(45deg) translate(-35px, 35px);
}
.menu-btn.open .menu-btn__burger::after {
  transform: rotate(-45deg) translate(-35px, -35px);
}
</style>
