import {createRouter,createWebHashHistory} from 'vue-router'
const routes = [
    {
        path:'/',
        redirect:'/login'
    },
    {
        path:'/login',
        component:()=>import('../components/Login.vue')
    },
    {
        path:'/home',
        component:()=>import('../components/Home.vue')
    },
]
const router = createRouter({
    history:createWebHashHistory(),
    routes
})
export default router