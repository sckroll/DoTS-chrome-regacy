<template>
  <div>
    <p>{{ defaultText }}</p>
      <v-btn color="success">까꿍</v-btn>
  </div>

</template>

<script>
export default {
  name: 'HelloWorld',
  mounted () {
    browser.runtime.sendMessage({})
  },
  computed: {
    defaultText () {
      return browser.i18n.getMessage('extName')
    }
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
