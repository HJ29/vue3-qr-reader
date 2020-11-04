<template>
  <qr-stream-example class="pb"></qr-stream-example>
  <qr-capture-example class="pb"></qr-capture-example>
  <qr-dropzone-example class="pb"></qr-dropzone-example>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import QrCaptureExample from './examples/QrCapture.vue'
import QrStreamExample from './examples/QrStream.vue'
import QrDropzoneExample from './examples/QrDropzone.vue'

export default defineComponent({
  name: 'App',
  components: {
    QrCaptureExample,
    QrStreamExample,
    QrDropzoneExample
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.mb {
  margin-bottom: 10px;
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.result {
  width: 100%;
  text-align: left;
}
</style>
