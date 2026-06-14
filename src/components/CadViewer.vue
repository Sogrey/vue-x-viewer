<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue'

interface ViewerInstance {
  dispose?: () => void
  destroy?: () => void
  loadModel: (options: { modelId: string; name: string; src: string }) => Promise<void>
  setFont?: (fontFiles: string[]) => Promise<void>
  goToHomeView?: () => void
  removeModel?: (modelId: string) => void
  getModels?: () => string[]
  clearScene?: () => void
}

const props = defineProps<{
  fileUrl?: string
  fileFormat?: 'dwg' | 'dxf' | 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl' | 'ifc' | 'pdf'
  type?: '2d' | '3d'
}>()

const emit = defineEmits<{
  (e: 'loading', progress: number, message: string): void
  (e: 'loaded'): void
}>()

const containerRef = ref<HTMLDivElement>()
const isLoading = ref(false)
const errorMessage = ref('')
const viewer = shallowRef<ViewerInstance | null>(null)
const containerId = ref('cad-viewer-container')
let loadTimeout: ReturnType<typeof setTimeout> | null = null
let currentModelId = ''
let currentViewerType = ''

const disposeViewer = () => {
  if (viewer.value) {
    try {
      if (viewer.value.dispose) {
        viewer.value.dispose()
      } else if (viewer.value.destroy) {
        viewer.value.destroy()
      }
    } catch (e) {
      console.warn('Error disposing viewer:', e)
    }
    viewer.value = null
    currentViewerType = ''
  }
}

const loadViewer = async () => {
  if (!containerRef.value || !props.fileUrl) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await nextTick()

    const is3d = props.type === '3d' || ['gltf', 'glb', 'obj', 'fbx', 'stl', 'ifc'].includes(props.fileFormat || '')
    const isPdf = props.fileFormat === 'pdf'
    const viewerType = is3d ? '3d' : (isPdf ? 'pdf' : '2d')

    // 如果格式变化，需要重建 viewer
    if (viewer.value && currentViewerType !== viewerType) {
      disposeViewer()
    }

    // 清除旧模型
    if (viewer.value && currentModelId) {
      try {
        if (viewer.value.removeModel) {
          viewer.value.removeModel(currentModelId)
        } else if (viewer.value.clearScene) {
          viewer.value.clearScene()
        }
      } catch (e) {
        console.warn('Error removing model:', e)
      }
    }

    // 第一次加载时创建 viewer
    if (!viewer.value) {
      emit('loading', 20, 'Initializing viewer...')

      const { Viewer2d, Viewer3d } = await import('@x-viewer/core')

      emit('loading', 30, 'Creating viewer container...')

      const viewerCfg = {
        containerId: containerId.value,
        language: 'zh',
        enableSpinner: true,
        enableProgressBar: true,
        enableLayoutBar: true,
      }

      if (is3d) {
        viewer.value = new Viewer3d({ containerId: containerId.value })
      } else {
        viewer.value = new Viewer2d(viewerCfg)

        emit('loading', 40, 'Loading fonts...')
        const fontFiles = [
          '/vue-x-viewer/libs/fonts/simplex.shx',
          '/vue-x-viewer/libs/fonts/hztxt.shx',
          '/vue-x-viewer/libs/fonts/arial.ttf',
          '/vue-x-viewer/libs/fonts/Microsoft_YaHei.ttf',
        ]
        await viewer.value.setFont(fontFiles)
      }

      currentViewerType = viewerType
    }

    emit('loading', 70, 'Loading model...')

    const fileName = props.fileUrl.split('/').pop() || 'file'
    const uniqueModelId = `model-${Date.now()}`
    currentModelId = uniqueModelId

    if (isPdf) {
      // PDF 暂不支持
      throw new Error('PDF 格式暂不支持，请使用 DWG 或 DXF 格式')
    } else {
      await viewer.value.loadModel({
        modelId: uniqueModelId,
        name: fileName,
        src: props.fileUrl,
      })
    }

    emit('loading', 90, 'Rendering...')

    if (viewer.value && viewer.value.goToHomeView) {
      viewer.value.goToHomeView()
    }

    emit('loading', 100, 'Completed')
    emit('loaded')

  } catch (error) {
    console.error('Failed to load model:', error)
    errorMessage.value = `加载失败: ${error instanceof Error ? error.message : '未知错误'}`
  } finally {
    isLoading.value = false
  }
}

const debouncedLoad = () => {
  if (loadTimeout) {
    clearTimeout(loadTimeout)
  }
  loadTimeout = setTimeout(loadViewer, 200)
}

onMounted(() => {
  debouncedLoad()
})

onUnmounted(() => {
  if (loadTimeout) {
    clearTimeout(loadTimeout)
  }
  disposeViewer()
})

watch(() => [props.fileUrl, props.fileFormat], () => {
  debouncedLoad()
})
</script>

<template>
  <div class="cad-viewer">
    <div ref="containerRef" class="viewer-container">
      <div :id="containerId" class="x-viewer-inner"></div>
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.cad-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.viewer-container {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.x-viewer-inner {
  width: 100%;
  height: 100%;
}

.viewer-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 50%);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay span {
  color: #00d4ff;
  font-size: 14px;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
  padding: 16px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  max-width: 80%;
}
</style>
