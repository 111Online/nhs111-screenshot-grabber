<template>
  <div>
    <nhs-header/>
    <main class="page-section clearfix" id="content" role="main">
      <nuxt/>
    </main>
    <nhs-footer/>
  </div>
</template>

<script>
import NhsHeader from '~/components/Header.vue'
import NhsFooter from '~/components/Footer.vue'

export default {
  components: {
    NhsHeader, NhsFooter
  }
}
</script>

<style>
  .count {
    color: #425563;
    font-size: 16px;
    font-weight: 400;
  }
</style>
