<template>
  <section class="section">
    <nav class="level">
      <div class="level-left">
        <nav class="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a href="/">Home</a></li>
            <li class="is-active"><a href="#" aria-current="page">Members</a></li>
          </ul>
        </nav>
      </div>
    </nav>
    <!-- <%- include(templateDir + '/monitorsTable.ejs', { monitors, columns: ['monitorId', 'services', 'createdAt'] }); -%>    -->
    <MemberTable
      :members="list"
      :columns="['name', 'region', 'current_level', 'level_timestamp', 'services', 'createdAt']"
    ></MemberTable>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import MemberTable from './MemberTable.vue'

export default defineComponent({
  name: 'MonitorsC',
  components: {
    MemberTable,
  },
  computed: {
    ...mapState('member', ['list']),
  },
  created() {
    this.$store.dispatch('member/getList')
  },
})
</script>
