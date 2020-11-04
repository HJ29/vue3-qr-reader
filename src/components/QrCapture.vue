<template>
  <input
    @change="onChangeInput"
    type="file"
    name="image"
    accept="image/*"
    capture="environment"
    multiple
  />
</template>

<script lang="ts">
import { scan } from "../misc/scanner.js";
import { imageDataFromFile } from "../misc/image-data.js";
import Worker from "../worker/jsqr.js";
import useCommonApi from '../use/commonApi';

export default {
  name: "QrCapture",
  props: {
    worker: {
      type: Function,
      default: Worker
    }
  },
  setup(props, {emit}) {
    const CommonApi = useCommonApi(emit)
    function onChangeInput(event) {
      const files = [...event.target.files];
      const resultPromises = files.map(processFile);
      resultPromises.forEach(CommonApi.onDetect);
    }
    async function processFile(file) {
      const imageData = await imageDataFromFile(file);
      const scanResult = await scan(props.worker, imageData);
      return scanResult;
    }
    return {
      onChangeInput
    }
  },
};
</script>
