<template>
  <v-app>
    <v-app-bar app color="blue darken-4">
      <v-toolbar-title class="headline">
        <span
          class="font-weight-medium white--text"
        >DoTS</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-avatar v-if="user.email" :color="user.color" style="cursor: pointer;" v-ripple @click="dotsTab">
        <span class="subtitle-1 white--text">{{ user.lastName.charAt(0) }}</span>
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
            <v-btn color="success" tile large @click="tagPage">현재 페이지에 태그 표시</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-4" tile large dark @click="saveMemo">메모 저장</v-btn>
          </v-layout>
        </v-flex>
        <v-flex v-else xl12>
          <p class="headline mt-12">로그인이 필요합니다.</p>
          <v-layout class="text-center">
            <v-spacer></v-spacer>
            <v-btn color="blue darken-4" tile large dark @click="dotsTab">로그인</v-btn>
            <v-spacer></v-spacer>
          </v-layout>
          <div class="subtitle-1 mt-12">
            <span>만약 로그인 후에도 이 화면이 나타난다면</span>
            <br>
            <span>DoTS 웹 페이지를 새로고침해주세요.</span>
          </div>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import jwtDecode from 'jwt-decode';
import axios from 'axios'

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
      BASE_URL: process.env.NODE_ENV === 'production' ? 'https://dots-00.appspot.com' : 'http://localhost:8080'
    }
  },
  created() {
    const token = localStorage.getItem('userToken')
    
    if (!token) {
      this.signout()
    } else {
      const decoded = jwtDecode(token)

      this.user.firstName = decoded.first_name
      this.user.lastName = decoded.last_name
      this.user.email = decoded.email
      this.user.color = decoded.color
    }
  },
  methods: {
    signout () {
      this.$store.commit('deleteToken')
    },
    dotsTab () {
      window.open(`${this.BASE_URL}/login`);
      // window.open('https://dots-00.appspot.com/login');
    },
    tagPage () {
      var userEmail = this.user.email

      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        axios.post(`${this.BASE_URL}/data/tag-or-memo`, {
          projectName: localStorage.getItem("currProject"),
          currURL: tabs[0].url,
          email: userEmail
        })
        .then((result) => {
          if (result.data.error) throw new Error(result.data.error)

          alert('현재 페이지에 태그를 표시하였습니다.')
        }).catch((err) => {
          alert(err)
        });
      });
    },
    saveMemo () {
      var userEmail = this.user.email
      var newMemo = this.memo

      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        axios.post(`${this.BASE_URL}/data/tag-or-memo`, {
          projectName: localStorage.getItem("currProject"),
          currURL: tabs[0].url,
          email: userEmail,
          memo: newMemo
        })
        .then((result) => {
          if (result.data.error) throw new Error(result.data.error)

          alert('메모를 등록하였습니다.')
        }).catch((err) => {
          alert(err)
        });
      });
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
