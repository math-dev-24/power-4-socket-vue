import { createApp } from 'vue'
import socket from "./plugins/socket"
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.config.globalProperties.$socket = socket;
app.mount('#app');