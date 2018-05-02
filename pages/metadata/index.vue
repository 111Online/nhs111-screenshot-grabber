<template>
  <div id="wrapper" class="browse measure">
    <div class="callout callout--alert" v-if="error">
      <h2>There's been a problem</h2>
      <p>{{ error }}</p>
    </div>
    <h1>Metadata</h1>
    <table>
      <thead>
        <tr>
          <th @click="toggleID">ID {{ sortIDToggle !== null ? ( sortIDToggle ? '▲' : '▼') : '' }}</th>
          <th @click="toggleDate">Date {{ sortDateToggle !== null ? ( sortDateToggle ? '▲' : '▼' ) : '' }}</th>
          <th @click="toggleName">Name {{ sortNameToggle !== null ? ( sortNameToggle ? '▲' : '▼' ) : '' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pageItems"><td><a :href="`/metadata/${item.id}`">{{item.id}}</a></td><td>{{date(item.date)}}</td><td>{{item.name}}</td></tr>
      </tbody>
    </table>
    <div class="pagination">
      <button v-bind:disabled="!(pageSize < items.length && currentPage > 1)" type="button" class="button--secondary" @click="currentPage--">Previous</button>
      <span>{{ currentPage }} out of {{ pageCount }}</span>
      <button v-bind:disabled="!(items.length - pageSize * currentPage > 0)" class="button--secondary" type="button" @click="currentPage++">Next</button>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      error: '',
      items: [],
      pageSize: 8,
      currentPage: 1,
      sortIDToggle: null,
      sortNameToggle: null,
      sortDateToggle: null
    }
  },
  mounted () {
    axios.get(`/api/screenshots/metadata`)
      .then((response) => {
        this.items = response.data
        this.sortDateToggle = false
        this.sortByDate()
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
  computed: {
    pageItems: function () {
      return this.items.slice(((this.currentPage - 1) * this.pageSize), (this.currentPage * this.pageSize))
    },
    pageCount: function () {
      var count = Math.ceil(this.items.length / this.pageSize)
      if (count > 0) return count
      else return count + 1
    }
  },
  methods: {
    date: function (date) {
      return new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    toggleID: function () {
      if (this.sortIDToggle !== null) this.sortIDToggle = !this.sortIDToggle
      else this.sortIDToggle = true
      this.sortNameToggle = null
      this.sortDateToggle = null
      this.sortByID()
    },
    toggleName: function () {
      if (this.sortNameToggle !== null) this.sortNameToggle = !this.sortNameToggle
      else this.sortNameToggle = true
      this.sortIDToggle = null
      this.sortDateToggle = null
      this.sortByName()
    },
    toggleDate: function () {
      if (this.sortDateToggle !== null) this.sortDateToggle = !this.sortDateToggle
      else this.sortDateToggle = true
      this.sortIDToggle = null
      this.sortNameToggle = null
      this.sortByDate()
    },
    sortByID: function () {
      this.items.sort((a, b) => {
        if (!this.sortIDToggle) return a.id < b.id
        else return a.id > b.id
      })
    },
    sortByName: function () {
      this.items.sort((a, b) => {
        if (!this.sortNameToggle) return a.name < b.name
        else return a.name > b.name
      })
    },
    sortByDate: function () {
      this.items.sort((a, b) => {
        if (!this.sortDateToggle) return a.date < b.date
        else return a.date > b.date
      })
    }
  }
}
</script>

<style>
  table th {
    cursor: pointer;
    user-select: none;
  }

  .pagination {
    display: flex;
    width: 100%;
  }

  .pagination span {
    flex: 2;
    text-align: center;
    margin: auto;
  }

  .pagination *+* {
    margin-top: 0;
  }
</style>