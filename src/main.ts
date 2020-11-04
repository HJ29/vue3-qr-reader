import { App, Plugin } from 'vue';
import QrStream from './components/QrStream.vue'
import QrDropzone from './components/QrDropzone.vue'
import QrCapture from './components/QrCapture.vue'

const install = (app: App) => {
  app.component('qr-stream', QrStream);
  app.component('qr-dropzone', QrDropzone);
  app.component('qr-capture', QrCapture);
}

export {
  QrStream,
  QrDropzone,
  QrCapture
}

const plugin = {
  install
}
export default plugin as unknown as Plugin;