<template>
  <div>
    <v-container fluid class="pa-0 ma-0">
      <v-toolbar>
        <v-btn icon><v-icon size="small">mdi-radar</v-icon></v-btn>
        <v-toolbar-title>System Status</v-toolbar-title>
      </v-toolbar>
    </v-container>

    <div class="status-container">
      <div class="status-inner">
        <div v-for="(service, key) in services" :key="key">
          <div class="service">
            <div class="service-name">
              <img :src="service.chain.logoUrl" v-if="service.chain.logoUrl" />
              <div>{{ service.chain.name }}</div>
            </div>
            <div class="service-status-container">
              <div class="service-status-slot" v-for="hourTimestamp in getHourTimestamps()">
                <template v-for="member in members">
                  <div
                    v-if="member.membershipLevelId >= service.membershipLevelId"
                    :class="`member-service-status ${getServiceHourMemberStatus(
                      service.id,
                      hourTimestamp,
                      member.id
                    )}`"
                    v-tooltip="getTooltipMarkup(service.id, hourTimestamp, member.id)"
                  ></div>
                </template>
              </div>
            </div>
          </div>
          <div class="service-separator" v-if="key + 1 != services.length"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import 'floating-vue/dist/style.css'

export default defineComponent({
  name: 'StatusC',
  components: {},
  setup() {
    const store = useStore()
    return { store }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('status', ['services']),
    ...mapState('status', ['members']),
    ...mapState('status', ['status']),
  },
  methods: {
    getHourTimestamps(): number[] {
      const timestamps: number[] = []
      for (let hourIndex = 47; hourIndex >= 0; hourIndex--) {
        let hour = new Date(new Date().getTime() - hourIndex * 60 * 60 * 1000)
        hour.setMinutes(0)
        hour.setSeconds(0)
        hour.setMilliseconds(0)
        timestamps.push(hour.getTime())
      }
      return timestamps
    },
    getServiceHourMemberStatus(serviceId: string, hourTimestamp: number, memberId: string): string {
      let serviceStatus = this.status[serviceId]
      if (serviceStatus) {
        let hourStatus = serviceStatus[hourTimestamp]
        if (hourStatus) {
          let memberStatus = hourStatus[memberId]
          if (memberStatus) {
            return memberStatus.status
          }
        }
      }
      return 'no-data'
    },
    getTooltipMarkup(serviceId: string, hourTimestamp: number, memberId: string): string {
      let member = this.members.find((member: any) => member.id == memberId)
      let startDate = new Date(hourTimestamp)
      let endDate = new Date(hourTimestamp + 60 * 60 * 1000)
      let serviceStatus = this.status[serviceId]
      let text = '<div class="tooltip">'
      let dateText = ''
      if (startDate.getDay() != new Date().getDay()) {
        dateText += this.formatDateHour(startDate)
      } else {
        dateText += this.formatHour(startDate)
      }
      if (endDate.getDay() != startDate.getDay()) {
        dateText += ` - ${this.formatDateHour(endDate)}`
      } else {
        dateText += ` - ${this.formatHour(endDate)}`
      }
      text += `<div>${dateText}</div>`
      text += `<div>${member.name}</div>`
      if (serviceStatus) {
        let hourStatus = serviceStatus[hourTimestamp]
        if (hourStatus) {
          let memberStatus = hourStatus[memberId]
          if (memberStatus) {
            text += `<div class="tooltip-row"><div class="status-indicator success"></div><div>${memberStatus.success}</div></div>`
            text += `<div class="tooltip-row"><div class="status-indicator warning"></div><div>${memberStatus.warning}</div></div>`
            text += `<div class="tooltip-row"><div class="status-indicator error"></div><div>${memberStatus.error}</div></div>`
            text += '</div>'
            return text
          }
        }
      }
      text += `<div>No data</div>`
      text += `</div>`
      return text
    },
    formatDateHour(date: Date): string {
      return new Intl.DateTimeFormat('en-uk', {
        day: 'numeric',
        month: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(date)
    },
    formatHour(date: Date): string {
      return new Intl.DateTimeFormat('en-uk', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(date)
    },
  },
  mounted() {
    this.store.dispatch('status/getData')
  },
  created() {},
})
</script>

<style lang="css">
.status-container {
  display: flex;
  justify-content: center;
  margin: 32px 0px 32px 0px;
}

.status-inner {
  display: flex;
  flex-flow: column nowrap;
  border-width: 1px;
  border-color: #00000044;
  border-style: solid;
  border-radius: 8px;
}

.status-inner .service {
  padding: 16px 24px 20px 24px;
}

.status-inner .service-name {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: #000000;
  gap: 6px;
}

.status-inner .service-name img {
  width: 14px;
  height: 14px;
  border-radius: 10px;
}

.status-inner .service-status-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.status-inner .service-status-slot {
  display: flex;
  flex-flow: column nowrap;
  gap: 3px;
}

.status-inner .member-service-status {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.status-inner .no-data {
  background-color: lightgray;
}

.success {
  background-color: green;
}

.warning {
  background-color: #ffbf00;
}

.error {
  background-color: red;
}

.status-inner .service-separator {
  height: 1px;
  background-color: #00000044;
}

.v-popper__inner {
  font-size: 12px;
}

.v-popper__arrow-container {
  display: none;
}

.tooltip {
  display: flex;
  flex-flow: column nowrap;
}

.tooltip-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 6px;
}

.tooltip-row .status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 5px;
}
</style>
