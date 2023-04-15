import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Config from '@/components/Config.vue'
import Services from '@/components/Services.vue'
import Members from '@/components/Members.vue'
import Member from '@/components/Member.vue'
import Service from '@/components/Service.vue'
import Monitors from '@/components/Monitors.vue'
import Monitor from '@/components/Monitor.vue'
import Checks from '@/components/Checks.vue'
import Check from '@/components/Check.vue'
import Message from '@/components/Message.vue'

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/config',
      name: 'config',
      component: Config,
    },
    {
      path: '/member',
      name: 'Members',
      component: Members,
    },
    {
      path: '/member/:memberId',
      name: 'Member',
      component: Member,
    },
    {
      path: '/service',
      name: 'Services',
      component: Services,
    },
    {
      path: '/service/:serviceUrl',
      name: 'Service',
      component: Service,
      props: true,
    },
    {
      path: '/monitor',
      name: 'Monitors',
      component: Monitors,
    },
    {
      path: '/monitor/:monitorId',
      name: 'Monitor',
      component: Monitor,
      props: true,
    },
    {
      path: '/healthCheck',
      name: 'Checks',
      component: Checks,
    },
    {
      path: '/healthCheck/:id',
      name: 'Check',
      component: Check,
      props: true,
    },
    {
      path: '/sign',
      name: 'Sign',
      component: Message,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    },
  ],
})
