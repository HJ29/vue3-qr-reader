export default function useCommonApi(emit) {
  async function onDetect(resultPromise) {
    emit("detect", resultPromise);
    try {
      const { content } = await resultPromise;
      if (content !== null) {
        emit("decode", content);
      }
    } catch (error) {
      // fail silently
    }
  }
  return {
    onDetect,
  };
}
