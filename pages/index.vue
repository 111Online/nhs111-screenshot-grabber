<template>
  <div id="wrapper" class="home measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>

    <form action="post" v-on:submit.prevent="submit">

      <label for="name">Name<p class="form-hint">Please enter your name</p></label>
      <input type="text" id="name" required v-model="name">

      <label for="postcodes">Postcodes <span class="count">({{postcodes_count}})</span><p class="form-hint">Please enter each postcode on a separate line</p></label>
      <textarea v-model="postcodes" cols="20" id="postcodes" name="postcodes" required placeholder="Postcodes" rows="5" class="feedback-input" style="resize: auto;"></textarea>
    

      <label for="auth-user">Authorisation <p class="form-hint">Please enter the provider site username and password.</p></label>
      <input id="auth-user" name="auth-user" class="form-textbox" required v-model="auth_user" placeholder="Username">
      <input type="password" id="auth-password" name="auth-password" required class="form-textbox" v-model="auth_password" placeholder="Password">
        
      <details>
        <summary><span class="details__arrow"></span> DoS</summary>
        <div>
          <label for="dos">DoS <p class="form-hint">Please choose which DoS to use</p></label>
          <select id="dos" v-model="dos">
            <option value="live">Live</option>
            <option value="uat">UAT</option>
          </select>
        </div>
      </details>

      <details>
        <summary><span class="details__arrow"></span> Dx Codes</summary>
        <div>
          <label for="custom_dx">Custom Dx codes <span class="count">({{dxcount}})</span><p class="form-hint">Please check all Dx codes that you want to screenshot</p></label>
          <button class="button--link" type="button" v-on:click="dx_select_all">Select all</button> 
          <button class="button--link" style="margin-left: 15px" type="button" v-on:click="dx_select_none">Select none</button>

          <div class="grid grid-dxcodes">
            <template v-for="(dx, i) in dxcodes">
              <div><input type="checkbox" :value="dx" :checked="dxcustom[i]" v-on:click="dxcustom[i] = !dxcustom[i]; dx_count()" :id="dx"><label :for="dx">{{dx}}</label></div>
            </template>
          </div>
        </div>
      </details>

      <!-- <label for="custom_urls">Custom URLs <span class="count">({{urls_count}})</span><p class="form-hint">Please enter each url on a separate line as [title] space [url], the title will be the name of the file</p></label>
      <textarea v-model="urls" cols="20" id="custom_urls" name="urls" placeholder="URLs" rows="5" class="feedback-input" style="resize: auto;"></textarea> -->

      <details>
        <summary><span class="details__arrow"></span> Schedule</summary>
        <div>
          <label for="schedule-date">Schedule <span class="count">(optional)</span><p class="form-hint">Please enter a future date and time to schedule the tool to run. Leave empty to run it immediately.</p></label>
          <input type="date" id="schedule-date" class="form-textbox" v-model="schedule_date" name="schedule-date">
          <input type="time" id="schedule-time" class="form-textbox" v-model="schedule_time" name="schedule-time">
          <p v-if="schedule">Scheduled for: {{ schedule_format }}</p>
        </div>
      </details>

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
      dxcodes: ['Dx02', 'Dx03', 'Dx05', 'Dx06', 'Dx07', 'Dx08', 'Dx11', 'Dx118', 'Dx12', 'Dx13', 'Dx14', 'Dx15', 'Dx17', 'Dx18', 'Dx19', 'Dx20', 'Dx21', 'Dx22', 'Dx28', 'Dx30', 'Dx31', 'Dx50', 'Dx60', 'Dx89', 'Dx92', 'Dx94'],
      dxcustom: [],
      dxcount: 0,
      postcodes: '',
      error: '',
      name: '',
      schedule_date: '',
      schedule_time: '',
      auth_user: '',
      auth_password: '',
      dos: 'uat'
    }
  },
  head () {
    return {
      title: 'Home - NHS 111 Screenshot Grabber'
    }
  },
  mounted () {
    this.dx_select_all()
  },
  computed: {
    postcodes_count: function () {
      return this.postcodes ? this.postcodes.split(require('os').EOL).filter(Boolean).length : 0
    },
    urls_count: function () {
      return this.urls ? this.urls.split(require('os').EOL).filter(Boolean).length : 0
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
      let postcodes = this.postcodes.split(require('os').EOL).filter(Boolean)
      let urls = this.urls.split(require('os').EOL).filter(Boolean)

      let urlobj = {}
      for (let i in urls) {
        let url = urls[i].split(' ')
        urlobj[url[0]] = url[1]
        i += 1
      }

      let dxobj = []
      for (let i = 0; i < this.dxcodes.length; i++) {
        if (this.dxcustom[i]) dxobj.push(this.dxcodes[i])
      }

      axios.post('/api/screenshot', {
        postcodes,
        urls: urlobj,
        name: this.name,
        schedule: this.schedule,
        auth: { username: this.auth_user, password: this.auth_password },
        dos: this.dos,
        dxcodes: dxobj
      })
        .then((response) => {
          this.$router.push(`/browse/${response.data.id}`)
        })
        .catch((e) => {
          this.error = e.response.statusText
        })
    },
    dx_count: function () {
      this.dxcount = this.dxcustom ? this.dxcustom.filter(Boolean).length : 0
    },
    dx_select_all: function (e) {
      this.dxcustom = []
      for (var i = 0; i < this.dxcodes.length; i++) {
        this.dxcustom[i] = true
      }
      this.dx_count()
    },
    dx_select_none: function (e) {
      this.dxcustom = []
      for (var i = 0; i < this.dxcodes.length; i++) {
        this.dxcustom[i] = false
      }
      this.dx_count()
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

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 32px;
  }

  .grid *+* {
    margin-top: 0;
    margin-bottom: 16px;
  }

  @media (min-width: 400px) {
    .grid {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  @media (min-width: 600px) {
    .grid {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }
  
  .grid-dxcodes div {
    position: relative;
  }
</style>
