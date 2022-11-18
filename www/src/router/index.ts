import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Members from '../components/Members.vue'
import MembershipHobbyist from '../components/MembershipHobbyist.vue'
import MembershipProfessional from '../components/MembershipProfessional.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/members',
    name: 'members',
    component: Members
  },
  {
    path: '/rules/professional',
    name: 'MembershipProfessional',
    component: MembershipProfessional
  },
  {
    path: '/rules/hobbyist',
    name: 'MembershipHobbyist',
    component: MembershipHobbyist
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
