<template>
  <div id="wrapper" class="browse measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>

    <a class="button" :href="`/api/screenshots/${id}/zip`">Download all</a>
    <div class="callout callout--info">
      <p>
        Created: {{ date }}<br>
        Scheduled: {{ schedule || "straight away" }}<br>
        Complete: {{ ((1 - (remaining / total_count)) * 100).toFixed(0) }}%
        <template v-if="error_count"><br>Errors: {{error_count}} failures.</template>
      </p>
    </div> 

    <div v-for="postcode in Object.keys(screenshots)">
      <h2>{{postcode}} <span class="count">({{screenshots[postcode].length}})</span></h2>
      <ul class="gallery">
        <li v-for="filename in screenshots[postcode]" class="gallery__item">
          <a :href="`/screenshots/${id}/${postcode}/${filename}`">
            <img :src="`/screenshots/${id}/${postcode}/${filename}`" class="gallery__screenshot">
            <p>{{removeExt(filename)}}</p>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      date: null,
      schedule: null,
      screenshots: [],
      total_count: 0,
      remaining: 0,
      error_count: 0,
      error: '',
      data_interval: null
    }
  },
  mounted () {
    this.getData()
  },
  head () {
    return {
      title: 'Browse - NHS 111 Screenshot Grabber'
    }
  },
  methods: {
    removeExt: (filename) => {
      return filename.split('.')[0]
    },
    getData: function () {
      axios.get(`/api/screenshots/${this.$route.params.id}`)
        .then((response) => {
          this.date = response.data.date
          this.schedule = response.data.schedule
          this.screenshots = response.data.screenshots
          this.total_count = response.data.total_count
          this.error_count = response.data.error_count
          this.remaining = response.data.remaining
          if (!this.remaining && this.data_interval) clearInterval(this.data_interval)
          else if (this.remaining > 0 && !this.data_interval) this.data_interval = setInterval(this.getData, 2000)
        })
        .catch((e) => {
          this.error = e.response.statusText
        })
    }
  },
  computed: {
    id: function () {
      return this.$route.params.id
    }
  }
}
</script>

<style>

  .gallery {
    list-style: none;
    display: grid;
    grid-gap: 20px;
    padding: 0;
  }

  @media (min-width: 450px) {
    .gallery {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 600px) {
    .gallery {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  .gallery__item {

  }

  .gallery__screenshot {
    height: 350px;
    width: 100%;

    object-position: top;
    object-fit: cover;
  }


  .page-section .gallery li + li {
    margin: initial;
  }
</style>
