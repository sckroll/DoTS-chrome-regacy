<template>
  <v-app>
    <v-app-bar app color="blue darken-4">
      <v-toolbar-title class="headline">
        <span
          class="font-weight-medium white--text"
        >DoTS</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-menu offset-y v-if="this.token">
        <template v-slot:activator="{ on }">
          <v-avatar :color="user.color" v-on="on" style="cursor: pointer;" v-ripple>
            <span>{{ user.lastName.charAt(0) }}</span>
          </v-avatar>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :disabled="item.disabled"
            @click="item.action"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
      <v-avatar v-if="user.email" :color="user.color" style="cursor: pointer;" v-ripple>
        <span @click="dotsTab" class="subtitle-1 white--text">{{ user.lastName.charAt(0) }}</span>
      </v-avatar>
    </v-app-bar>

    <v-content>
      <br />
      <v-layout class="text-center ma-6">
        <v-flex v-if="user.email" xl12>
          <v-textarea
            v-model="memo"
            solo
            name="memo"
            label="메모"
            rows="10"
            no-resize
          ></v-textarea>
          <v-layout class="text-center">
            <v-btn color="success" tile large @click="setData">현재 페이지에 대해 마킹</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-4" tile large dark @click="getData">메모 저장</v-btn>
          </v-layout>
        </v-flex>
        <v-flex v-else xl12>
          <p class="headline">로그인이 필요합니다.</p>
          <v-layout class="text-center">
            <v-spacer></v-spacer>
            <v-btn color="blue darken-4" tile large dark @click="dotsTab">로그인</v-btn>
            <v-spacer></v-spacer>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import jwtDecode from 'jwt-decode';

export default {
  name: 'App',
  data() {
    return {
      memo: '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        color: ''
      },
      items: [
        {
          title: '계정 관리',
          action: '',
          disabled: true
        },
        {
          title: '로그아웃',
          action: this.signout,
          disabled: false
        }
      ]
    }
  },
  created() {
    const token = localStorage.getItem('userToken')
    if (!token) this.signout()

    const decoded = jwtDecode(token)

    this.user.firstName = decoded.first_name
    this.user.lastName = decoded.last_name
    this.user.email = decoded.email
    this.user.color = decoded.color
  },
  methods: {
    signout () {
      this.$store.commit('deleteToken')
    },
    dotsTab () {
      chrome.tabs.query({
          // 현재 탭의 인덱스 정보 획득
          currentWindow: true,
          active: true
        }, function(tabArray) {
        // 새 탭 생성
        chrome.tabs.create({
          index: tabArray[0].index + 1,
          url: 'http://localhost:8080/login'
          // url: 'http://dots-00.appspot.com/login'
        })
      })
    },
    setData () {

    },
    getData () {
      
    }
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
