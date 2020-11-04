# vue3-qr-reader
Vue 3 qr reader.

### Credit to: [vue-qrcode-reader](https://github.com/gruhn/vue-qrcode-reader)
refactor for vue 3.

### Demo
[Demo](https://hj29.github.io/vue3-qr-reader/)

[Demo Code](https://github.com/HJ29/vue3-qr-reader/tree/master/example/src/)

### Install
```bash
yarn add vue3-qr-reader
npm i --save vue3-qr-reader
```

### Register Global Component
```js
import { createApp } from 'vue';
import App from './App.vue'
import QrReader from 'vue3-qr-reader';

const app = createApp(App);
app.use(QrReader);
app.mount('#app')
```

### Register Local Component
```js
import { QrStream, QrCapture, QrDropzone } from 'vue3-qr-reader';

export default {
  components: {
    QrStream,
    QrCapture,
    QrDropzone
  },
};
```

## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
