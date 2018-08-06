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
          <th @click="toggleScheduledDate">Scheduled Date {{ sortScheduledDateToggle !== null ? ( sortScheduledDateToggle ? '▲' : '▼' ) : '' }}</th>
          <th @click="toggleName">Name {{ sortNameToggle !== null ? ( sortNameToggle ? '▲' : '▼' ) : '' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pageItems" :key="item.id" :class="{ strike: item.cancelled }" ><td><a :href="`/metadata/${item.id}`">{{item.id}}</a></td><td>{{date(item.date)}}</td><td>{{  date(item.schedule) === date(item.date) ? '' : date(item.schedule) }}</td><td>{{item.name}}</td></tr>
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
      sortDateToggle: null,
      sortScheduledDateToggle: null
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
      if (this.items.length === undefined) return [this.items]
      return this.items.slice(((this.currentPage - 1) * this.pageSize), (this.currentPage * this.pageSize))
    },
    pageCount: function () {
      if (this.items.length === undefined) return 1
      var count = Math.ceil(this.items.length / this.pageSize)
      if (count > 0) return count
      else return count + 1
    }
  },
  methods: {
    date: function (date) {
      var dateObj = this.getValidDate(date)
      if (dateObj == null) return ''
      else return dateObj.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    getValidDate: function (date) {
      if (date == null || date === '') return null
      var dateObj = new Date(date)
      if (Number.isNaN(dateObj.valueOf())) {
        // Invalid date, may have been passed through as number so try that
        dateObj = new Date(Number(date))
        if (Number.isNaN(dateObj.valueOf())) return null
      }
      return dateObj
    },
    toggleID: function () {
      if (this.sortIDToggle !== null) this.sortIDToggle = !this.sortIDToggle
      else this.sortIDToggle = true
      this.sortNameToggle = null
      this.sortDateToggle = null
      this.sortScheduledDateToggle = null
      this.sortByID()
    },
    toggleName: function () {
      if (this.sortNameToggle !== null) this.sortNameToggle = !this.sortNameToggle
      else this.sortNameToggle = true
      this.sortIDToggle = null
      this.sortDateToggle = null
      this.sortScheduledDateToggle = null
      this.sortByName()
    },
    toggleDate: function () {
      if (this.sortDateToggle !== null) this.sortDateToggle = !this.sortDateToggle
      else this.sortDateToggle = true
      this.sortIDToggle = null
      this.sortNameToggle = null
      this.sortScheduledDateToggle = null
      this.sortByDate()
    },
    toggleScheduledDate: function () {
      if (this.sortScheduledDateToggle !== null) this.sortScheduledDateToggle = !this.sortScheduledDateToggle
      else this.sortScheduledDateToggle = true
      this.sortIDToggle = null
      this.sortNameToggle = null
      this.sortDateToggle = null
      this.sortByScheduledDate()
    },
    sortByID: function () {
      this.items.sort((a, b) => {
        if (!this.sortIDToggle) return a.id < b.id ? 1 : -1
        else return a.id > b.id ? 1 : -1
      })
    },
    sortByName: function () {
      this.items.sort((a, b) => {
        if (!this.sortNameToggle) return a.name < b.name ? 1 : -1
        else return a.name > b.name ? 1 : -1
      })
    },
    sortByDate: function () {
      this.items.sort((a, b) => {
        if (!this.sortDateToggle) return new Date(a.date) < new Date(b.date) ? 1 : -1
        else return new Date(a.date) > new Date(b.date) ? 1 : -1
      })
    },
    sortByScheduledDate: function () {
      this.items.sort((a, b) => {
        // It should be expected that many items will not have a scheduled date
        // so this ensures blank rows are always at the bottom
        var dateA = this.getValidDate(a.schedule)
        var dateB = this.getValidDate(b.schedule)
        if (a.schedule === a.date) dateA = null
        if (b.schedule === b.date) dateB = null
        if (!dateA && !dateB) return 0
        if (!dateA || !dateB) {
          if (!dateA) return 1
          if (!dateB) return -1
        }

        var result = null
        if (!this.sortScheduledDateToggle) result = dateA < dateB ? 1 : -1
        else result = dateA > dateB ? 1 : -1
        return result
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

  .strike {
    text-decoration: line-through;
    color: #969696;
  }
</style>