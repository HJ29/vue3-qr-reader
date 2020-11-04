<template>
  <div>
    <div class="mb">
      Qr Stream
    </div>
    <div class="center">
      <qr-stream @decode="onDecode" class="mb stream">
        <div style="color: red;" class="frame"></div>
      </qr-stream>
    </div>
    <div class="result">
      Result: {{data}}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { QrStream } from '../../../src/main'

export default defineComponent({
  name: 'QrStreamExample',
  components: {
    QrStream
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

<style scoped>
.stream {
  height: 300px;
  width: 300px;
}
.frame {
  border-style: solid;
  border-width: 2px;
  border-color: red;
  height: 200px;
  width: 200px;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  margin: auto;
}
</style>