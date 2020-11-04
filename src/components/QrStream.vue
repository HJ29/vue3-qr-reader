<template>
  <div class="qr-stream-wrapper">
    <!--
    Note, the following DOM elements are not styled with z-index.
    If z-index is not defined, elements are stacked in the order they appear in the DOM.
    The first element is at the very bottom and subsequent elements are added on top.
    -->
    <video
      ref="video"
      v-show="shouldScan"
      class="qr-stream-camera"
      autoplay
      muted
      playsinline
    ></video>
    <canvas
      ref="pauseFrame"
      v-show="!shouldScan"
      class="qr-stream-camera"
    ></canvas>
    <canvas ref="trackingLayer" class="qr-stream-overlay"></canvas>
    <div class="qr-stream-overlay">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { keepScanning } from "../misc/scanner.js";
import { thinSquare } from "../misc/track-func.js";
import Camera from "../misc/camera.js";
import Worker from "../worker/jsqr.js";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  watch,
  PropType,
} from "vue";
import useCommonApi from "../use/commonApi";

enum CameraType {
  auto = "auto",
  rear = "rear",
  off = "off",
  front = "front",
}

export default defineComponent({
  name: "QrStream",
  props: {
    camera: {
      type: String as PropType<CameraType>,
      default: "auto",
    },
    torch: {
      type: Boolean,
      default: false,
    },
    track: {
      type: [Function, Boolean],
      default: true,
    },
    worker: {
      type: Function,
      default: Worker,
    },
  },
  setup(props, { emit }) {
    const CommonApi = useCommonApi(emit);
    const state = reactive({
      cameraInstance: null,
      destroyed: false,
      stopScanning: () => {
        //
      },
      video: null,
      trackingLayer: null,
      pauseFrame: null,

      shouldStream: computed(() => {
        return state.destroyed === false && props.camera !== CameraType.off;
      }),
      shouldScan: computed(() => {
        return state.shouldStream === true && state.cameraInstance !== null;
      }),
      /**
       * Minimum delay in milliseconds between frames to be scanned. Don't scan
       * so often when visual tracking is disabled to improve performance.
       */
      scanInterval: computed(() => {
        if (props.track === false) {
          return 500;
        } else {
          return 40; // ~ 25fps
        }
      }),
      trackRepaintFunction: computed(() => {
        if (props.track === true) {
          return thinSquare({ color: "#ff0000" });
        } else if (props.track === false) {
          return undefined;
        } else {
          return props.track;
        }
      }),
    });
    watch(
      () => state.shouldStream,
      (shouldStream) => {
        if (!shouldStream) {
          const frame = state.cameraInstance.captureFrame();
          paintPauseFrame(frame);
        }
      }
    );
    watch(
      () => state.shouldScan,
      (shouldScan) => {
        if (shouldScan) {
          clearPauseFrame();
          clearTrackingLayer();
          startScanning();
        } else {
          state.stopScanning();
        }
      }
    );
    watch(
      () => props.torch,
      () => {
        init();
      }
    );
    watch(
      () => props.camera,
      () => {
        init();
      }
    );
    function init() {
      const promise = (async () => {
        beforeResetCamera();
        if (props.camera === "off") {
          state.cameraInstance = null;

          return {
            capabilities: {},
          };
        } else {
          state.cameraInstance = await Camera(state.video, {
            camera: props.camera,
            torch: props.torch,
          });

          const capabilities = state.cameraInstance.getCapabilities();

          // if the component is destroyed before `cameraInstance` resolves a
          // `beforeDestroy` hook has no chance to clear the remaining camera
          // stream.
          if (state.destroyed) {
            state.cameraInstance.stop();
          }

          return {
            capabilities,
          };
        }
      })();
      emit("init", promise);
    }
    onMounted(() => {
      init();
    });
    onUnmounted(() => {
      beforeResetCamera();
      state.stopScanning();
      state.destroyed = true;
    });
    function startScanning() {
      const detectHandler = (result) => {
        CommonApi.onDetect(Promise.resolve(result));
      };

      state.stopScanning = keepScanning(props.worker, state.cameraInstance, {
        detectHandler,
        locateHandler: onLocate,
        minDelay: state.scanInterval,
      });
    }
    function beforeResetCamera() {
      if (state.cameraInstance !== null) {
        state.cameraInstance.stop();
        state.cameraInstance = null;
      }
    }
    function onLocate(location) {
      if (state.trackRepaintFunction === undefined || location === null) {
        clearTrackingLayer();
      } else {
        repaintTrackingLayer(location);
      }
    }
    function repaintTrackingLayer(location) {
      const video = state.video;
      const canvas = state.trackingLayer;
      const ctx = canvas.getContext("2d");

      // The visually occupied area of the video element.
      // Because the component is responsive and fills the available space,
      // this can be more or less than the actual resolution of the camera.
      const displayWidth = video.offsetWidth;
      const displayHeight = video.offsetHeight;

      // The actual resolution of the camera.
      // These values are fixed no matter the screen size.
      const resolutionWidth = video.videoWidth;
      const resolutionHeight = video.videoHeight;

      // Dimensions of the video element as if there would be no
      //   object-fit: cover;
      // Thus, the ratio is the same as the cameras resolution but it's
      // scaled down to the size of the visually occupied area.
      const largerRatio = Math.max(
        displayWidth / resolutionWidth,
        displayHeight / resolutionHeight
      );
      const uncutWidth = resolutionWidth * largerRatio;
      const uncutHeight = resolutionHeight * largerRatio;

      const xScalar = uncutWidth / resolutionWidth;
      const yScalar = uncutHeight / resolutionHeight;
      const xOffset = (displayWidth - uncutWidth) / 2;
      const yOffset = (displayHeight - uncutHeight) / 2;

      const coordinatesAdjusted = {};
      for (const key in location) {
        coordinatesAdjusted[key] = {
          x: Math.floor(location[key].x * xScalar + xOffset),
          y: Math.floor(location[key].y * yScalar + yOffset),
        };
      }

      window.requestAnimationFrame(() => {
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        state.trackRepaintFunction(coordinatesAdjusted, ctx);
      });
    }
    function clearTrackingLayer() {
      const canvas = state.trackingLayer;
      const ctx = canvas.getContext("2d");

      window.requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }
    function paintPauseFrame(imageData) {
      const canvas = state.pauseFrame;
      const ctx = canvas.getContext("2d");

      window.requestAnimationFrame(() => {
        canvas.width = imageData.width;
        canvas.height = imageData.height;

        ctx.putImageData(imageData, 0, 0);
      });
    }
    function clearPauseFrame() {
      const canvas = state.pauseFrame;
      const ctx = canvas.getContext("2d");

      window.requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }
    return {
      ...toRefs(state),
      init,
    };
  },
});
</script>

<style lang="css" scoped>
.qr-stream-wrapper {
  width: 100%;
  height: 100%;

  position: relative;
  z-index: 0;
}

.qr-stream-overlay {
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0;
  left: 0;
}

.qr-stream-camera {
  width: 100%;
  height: 100%;

  display: block;
  object-fit: cover;
}
</style>
