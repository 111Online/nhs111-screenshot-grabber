<template>
  <div id="wrapper" class="browse measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>
    <h1>Metadata</h1>
    <ul>
      <li v-for="id in ids"><a :href="`/metadata/${id}`">{{id}}</a></li>
    </ul>

  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      error: '',
      ids: []
    }
  },
  mounted () {
    axios.get(`/api/screenshots/metadata`)
      .then((response) => {
        this.ids = response.data
      })
      .catch((e) => {
        this.error = e.response.statusText
      })
  },
  head () {
    return {
      title: 'Metadata - NHS 111 Screenshot Grabber'
    }
  },
  methods: {
  },
  computed: {
    id: function () {
      return this.$route.params.id
    },
    date: function () {
      return new Date(this.metadata.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>