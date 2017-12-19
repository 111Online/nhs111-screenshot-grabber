<template>
  <div id="wrapper" class="home measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>

    <form action="post" v-on:submit.prevent="submit">

      <label for="name">Name<p class="form-hint">Please enter your name</p></label>
      <input type="text" id="name" v-model="name">

      <label for="postcodes">Postcodes <span class="count">({{postcodes_count}})</span><p class="form-hint">Please enter each postcode on a separate line</p></label>
      <textarea v-model="postcodes" cols="20" id="postcodes" name="postcodes" placeholder="Postcodes" rows="5" class="feedback-input" style="resize: auto;"></textarea>
    
      <label for="urls">URLs <span class="count">({{urls_count}})</span><p class="form-hint">Please enter each url on a separate line as [title] space [url], the title will be the name of the file</p></label>
      <textarea v-model="urls" cols="20" id="urls" name="urls" placeholder="URLs" rows="5" class="feedback-input" style="resize: auto;"></textarea>
      
      <label for="auth-user">Authorisation <span class="count">(optional)</span><p class="form-hint">URLs are sometimes password protected, if that is the case please enter the username and password.</p></label>
      <input id="auth-user" name="auth-user" class="form-textbox" v-model="auth_user" placeholder="Username">
      <input type="password" id="auth-password" name="auth-password" class="form-textbox" v-model="auth_password" placeholder="Password">

      <label for="schedule-date">Schedule <span class="count">(optional)</span><p class="form-hint">Please enter a future date and time to schedule the tool to run. Leave empty to run it immediately.</p></label>
      <input type="date" id="schedule-date" class="form-textbox" v-model="schedule_date" name="schedule-date">
      <input type="time" id="schedule-time" class="form-textbox" v-model="schedule_time" name="schedule-time">
      <p v-if="schedule">Scheduled for: {{ schedule_format }}</p>


      <button type="submit" class="button--next">Next</button>
      <input type="hidden" name="schedule" v-model="schedule">

    </form>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      urls: '',
      postcodes: '',
      error: '',
      name: '',
      schedule_date: '',
      schedule_time: '',
      auth_user: '',
      auth_password: ''
    }
  },
  head () {
    return {
      title: 'Home - NHS 111 Screenshot Grabber'
    }
  },
  computed: {
    postcodes_count: function () {
      return this.postcodes ? this.postcodes.split(require('os').EOL).length : 0
    },
    urls_count: function () {
      return this.urls ? this.urls.split(require('os').EOL).length : 0
    },
    schedule: function () {
      let date = new Date(this.schedule_date + 'T' + this.schedule_time)
      let now = new Date()
      if (date > now) {
        return date
      }
      return ''
    },
    schedule_format: function () {
      return new Date(this.schedule).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  },
  methods: {
    submit: function (e) {
      this.error = ''
      let postcodes = this.postcodes.split(require('os').EOL)
      let urls = this.urls.split(require('os').EOL)

      let urlobj = {}
      for (let i in urls) {
        let url = urls[i].split(' ')
        urlobj[url[0]] = url[1]
        i += 1
      }

      axios.post('/api/screenshot', { postcodes, urls: urlobj, name: this.name, schedule: this.schedule, auth: { username: this.auth_user, password: this.auth_password } })
        .then((response) => {
          this.$router.push(`/browse/${response.data.id}`)
        })
        .catch((e) => {
          this.error = e.response.statusText
        })
    }
  }
}
</script>

<style>
  .count + p {
    margin-top: 0;
  }

  textarea.feedback-input  {
    border: 2px solid #005eb8;
  }
</style>
