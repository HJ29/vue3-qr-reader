<template>
  <div>
    <div class="mb">
      Qr Capture
    </div>
    <qr-capture @decode="onDecode" class="mb"></qr-capture>
    <div class="result">
      Result: {{data}}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { QrCapture } from '../../../dist/vue3-qr-reader.common'

export default defineComponent({
  name: 'QrCaptureExample',
  components: {
    QrCapture
  },
  setup() {
    const state = reactive({
      data: null
    })
    function onDecode(data) {
      state.data = data
    }
    return {
      ...toRefs(state),
      onDecode
    }
  }
});
</script>
