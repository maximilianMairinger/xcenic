import { merge } from "webpack-merge"
import commonMod from "./rollup.server.common.config"


export default merge(commonMod, {
  watch: {
    include: ['server/src/**', "app/lib/**"],
    exclude: 'node_modules/**'
  }
})