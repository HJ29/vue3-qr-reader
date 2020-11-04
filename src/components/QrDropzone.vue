<template>
  <div
    @drop.prevent.stop="onDrop"
    @dragenter.prevent.stop="onDragOver(true)"
    @dragleave.prevent.stop="onDragOver(false)"
    @dragover.prevent.stop
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { scan } from "../misc/scanner.js";
import { imageDataFromFile, imageDataFromUrl } from "../misc/image-data.js";
import Worker from "../worker/jsqr.js";
import useCommonApi from '../use/commonApi';

export default {
  name: "QrDropzone",
  props: {
    worker: {
      type: Function,
      default: Worker
    }
  },
  setup(props, {emit}) {
    const CommonApi = useCommonApi(emit);
    function onDragOver(isDraggingOver) {
      emit("dragover", isDraggingOver);
    }
    function onDrop({ dataTransfer }) {
      onDragOver(false);
      const droppedFiles = [...dataTransfer.files];
      const droppedUrl = dataTransfer.getData("text/uri-list");
      droppedFiles.forEach(file => {
        CommonApi.onDetect(processFile(file));
      });
      if (droppedUrl !== "") {
        CommonApi.onDetect(processUrl(droppedUrl));
      }
    }
    async function processFile(file) {
      const imageData = await imageDataFromFile(file);
      const scanResult = await scan(props.worker, imageData);
      return scanResult;
    }
    async function processUrl(url) {
      const imageData = await imageDataFromUrl(url);
      const scanResult = await scan(props.worker, imageData);

      return scanResult;
    }
    return {
      onDrop,
      onDragOver
    }
  }
};
</script>
