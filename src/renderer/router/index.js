import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },
  //
  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: 'Example', icon: 'example' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: 'Table', icon: 'table' }
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' }
  //     }
  //   ]
  // },
  //
  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' }
  //     }
  //   ]
  // },
  {
    path: '/writing',
    component: Layout,
    children: [
      {
        path: 'novel',
        name: 'Novel',
        component: () => import('@/views/writing/novel/index'),
        meta: { title: '作品管理', icon: 'form' }
      },
      {
        path: 'chapter',
        name: 'Chapter',
        component: () => import('@/views/writing/chapter/index'),
        meta: { title: '章节管理', icon: 'form' , },
        hidden: true
      },
      {
          path: 'addRaw',
          name: 'AddRaw',
          component: () => import('@/views/writing/panel/addRaw'),
          meta: { title: '导入原文', icon: 'form' , },
          hidden: true
      },
      {
          path: 'viewRaw',
          name: 'ViewRaw',
          component: () => import('@/views/writing/panel/viewRaw'),
          meta: { title: '查看原文', icon: 'form' , },
          hidden: true
      },
      {
        path: 'viewTrans',
        name: 'ViewTrans',
        component: () => import('@/views/writing/panel/viewTrans'),
        meta: { title: '译文预览', icon: 'form' , },
        hidden: true
       },
      {
          path: 'work',
          name: 'Work',
          component: () => import('@/views/writing/panel/work'),
          meta: { title: '翻译工作台', icon: 'form' , },
          hidden: true
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]



export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

