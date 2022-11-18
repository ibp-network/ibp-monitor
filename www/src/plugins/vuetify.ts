import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

function componentToHex (c: any) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

function rgb2hex (r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

const opts = {
  theme: {
    themes: {
      light: {
        primary: colors.red.darken1, // #E53935
        secondary: colors.red.lighten4, // #FFCDD2
        accent: colors.indigo.base, // #3F51B5
        // warning: colors.deepOrange.accent3,
        warning: rgb2hex(236, 89, 46)
      }
    }
  }
}

export default new Vuetify(opts)
