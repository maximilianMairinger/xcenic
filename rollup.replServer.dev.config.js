import { merge } from "webpack-merge"
import commonMod from "./rollup.replServer.common.config"


export default merge(commonMod, {
  watch: {
    include: ['replServer/src/**', "server/src/setup.ts", "app/lib/**"],
    exclude: 'node_modules/**'
  }
})
