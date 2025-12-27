import { cssInterop } from 'nativewind'
// biome-ignore lint/style/noExportedImports: configure before export
import { Icon } from './icon'

cssInterop(Icon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: 'color',
      height: 'size',
      width: 'size'
    }
  }
})

export { Icon }
