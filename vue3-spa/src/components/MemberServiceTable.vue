<template>
  <div>
    {{ services }}
    <ServiceTable :columns="columns" :services="filteredServices"></ServiceTable>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import ServiceTable from './ServiceTable.vue'
import { IMember, IService } from './types'

export default defineComponent({
  name: 'ServiceTable',
  components: { ServiceTable },
  props: {
    member: {
      type: Object as PropType<IMember>,
      required: true,
    },
    columns: {
      type: Array,
      default() {
        return ['memberId', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  computed: {
    ...mapState('service', { services: 'list' }),
    filteredServices() {
      console.debug(this.member, this.services)
      return this.services.filter((f: IService) => f.level_required <= this.member.current_level)
    },
  },
  created() {
    console.debug('MemberServiceTable.vue created', this.services)
  },
})
</script>
