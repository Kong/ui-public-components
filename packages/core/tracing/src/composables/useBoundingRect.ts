import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const useBoundingRect = (elementRef: Ref<HTMLElement | null>) => {
  let resizeObserver: ResizeObserver

  const rect = ref<DOMRect | undefined>(undefined)

  onMounted(() => {
    const update = () => {
      rect.value = elementRef.value?.getBoundingClientRect()
    }
    resizeObserver = new ResizeObserver(update)
    update()
    if (elementRef.value) {
      resizeObserver.observe(elementRef.value)
    } else {
      console.error('element is null')
    }
  })

  onUnmounted(() => {
    resizeObserver.disconnect()
  })

  return rect
}

export default useBoundingRect
