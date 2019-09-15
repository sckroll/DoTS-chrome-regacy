import Vue from 'vue'
import App from './App.vue'
import store from "../store";
import vuetify from '../plugins/vuetify';
import '../plugins/axios';
import '@babel/polyfill'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  vuetify,
  render: h => h(App)
})
