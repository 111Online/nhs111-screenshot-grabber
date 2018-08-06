<template>
  <div id="wrapper" class="browse measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>
    <h1>Metadata for {{id}}</h1>
    <div class="panel panel-border-narrow">
        <h3>Name</h3>
        <p>{{metadata.name}}</p>
        
        <h3>Details</h3>
        <p>
          Created: {{ date }}<br>
          Scheduled: {{ schedule || "straight away" }} <button v-if="!metadata.start_time && !metadata.cancelled" class="button--link" style="margin-left: 10px; margin-top: 0;" @click="unschedule">unschedule</button>
          <template v-if="metadata.start_time"><br>Start time: {{ metadata.start_time }}</template>
          <template v-if="metadata.finish_time"><br>Finish time: {{ metadata.finish_time }}</template>
          <template v-if="remaining !== null"><br>Complete: {{ ((1 - (remaining / total_count)) * 100).toFixed(0) }}%</template>
          <template v-if="error_count"><br>Errors: {{error_count}} failures.</template>
        </p>

        <template v-if="metadata.dos">
          <h3>DoS</h3>
          <p>{{metadata.dos}}</p>
        </template>

        <div v-if="metadata.errors">
          <h3>Errors</h3>
          <ul style="color: #b10e1e;">
            <li v-for="postcode in Object.keys(metadata.errors)">
              <p>{{postcode}}</p>
              <ul>
                <li v-for="url in metadata.errors[postcode]">
                  {{url}}
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <h3>Postcodes</h3>
        <ul>
            <li v-for="postcode in metadata.postcodes">{{ postcode }}</li>
        </ul>

        <h3>URLs</h3>
        <ul>
            <li v-for="(url, name) in metadata.urls"> {{name}} - {{ url }}</li>
        </ul>
    </div>

    <a class="button" :href="`/browse/${id}`" style="margin-right: 15px;">Screenshots</a> 
    <a class="button--secondary button" href="/metadata/">Other Metadata</a>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      error: '',
      metadata: {},
      data_interval: null,
      total_count: 0,
      remaining: null,
      error_count: 0
    }
  },
  mounted () {
    this.getData()
    axios.get(`/api/screenshots/${this.id}/metadata`)
      .then((response) => {
        this.metadata = response.data
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
    getData: function () {
      axios.get(`/api/screenshots/${this.$route.params.id}/metadata`)
        .then((response) => {
          this.metadata = response.data
        })
        .catch((e) => {
          this.error = e.response.statusText
        })
    },
    unschedule: function () {
      axios.get(`/api/screenshots/${this.$route.params.id}/cancel`)
      this.getData()
    }
  },
  computed: {
    id: function () {
      return this.$route.params.id
    },
    date: function () {
      return new Date(this.metadata.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    schedule: function () {
      if (this.metadata.cancelled) return 'Cancelled (was ' + new Date(this.metadata.schedule).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ')'
      return this.metadata.schedule ? new Date(this.metadata.schedule).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
    }
  }
}
</script>