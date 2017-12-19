<template>
  <div id="wrapper" class="browse measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>

    <a class="button" :href="`/api/screenshots/${id}/zip`">Download all</a>

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
      screenshots: [],
      error: ''
    }
  },
  mounted () {
    axios.get(`/api/screenshots/${this.id}`)
      .then((response) => {
        this.screenshots = response.data
      })
      .catch((e) => {
        this.error = e.response.statusText
      })
  },
  head () {
    return {
      title: 'Browse - NHS 111 Screenshot Grabber'
    }
  },
  methods: {
    removeExt: (filename) => {
      return filename.split('.')[0]
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
