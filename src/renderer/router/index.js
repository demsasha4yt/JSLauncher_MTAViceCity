import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'init-page',
      component: require('@/components/InitPage').default
    },
    {
      path: '/main',
      name: 'main-page',
      component: require('@/components/MainPage').default
    },
    {
      path: '/settings',
      name: 'settings-window',
      component: require('@/components/SettingsWindow').default
    },
    {
      path: '/notfound',
      name: 'notfound-window',
      component: require('@/components/NotFound').default
    },
    {
      path: '/havegta',
      name: 'havegta-window',
      component: require('@/components/HaveGta').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
