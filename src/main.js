import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import YmapPlugin from 'vue-yandex-maps'

Vue.config.productionTip = false
const ySettings = {
  apiKey: '5f289982-8150-4302-941b-b5c366133b8c',
  lang: 'ru_RU',
  coordorder: 'latlong',
  version: '2.1'
}

Vue.use(YmapPlugin, ySettings)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
