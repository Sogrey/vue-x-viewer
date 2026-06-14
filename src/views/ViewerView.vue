<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CadViewer from '@/components/CadViewer.vue'

const fileUrl = ref('')
const fileFormat = ref<'dwg' | 'dxf' | 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl' | 'ifc' | 'pdf'>('dwg')
const viewerType = ref<'2d' | '3d'>('2d')
const isDragging = ref(false)
const isLoading = ref(false)
const loadProgress = ref(0)
const loadMessage = ref('')

const DEFAULT_FILE = '/vue-x-viewer/dwg/20260422-224703-27581.dwg'

const formatOptions = [
  { label: 'DWG', value: 'dwg' },
  { label: 'DXF', value: 'dxf' },
  { label: 'glTF', value: 'gltf' },
  { label: 'GLB', value: 'glb' },
  { label: 'OBJ', value: 'obj' },
  { label: 'FBX', value: 'fbx' },
  { label: 'STL', value: 'stl' },
  { label: 'IFC', value: 'ifc' },
  { label: 'PDF', value: 'pdf' },
]

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    loadFile(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    loadFile(file)
  }
}

const loadFile = (file: File) => {
  const blobUrl = URL.createObjectURL(file)
  fileUrl.value = blobUrl

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && formatOptions.some(opt => opt.value === ext)) {
    fileFormat.value = ext as typeof fileFormat.value
    viewerType.value = ['dwg', 'dxf', 'pdf'].includes(ext) ? '2d' : '3d'
  }
}

const handleLoad = () => {
  if (!fileUrl.value) {
    alert('Please enter a file URL or select a local file')
  }
}

const handleViewerLoading = (progress: number, message: string) => {
  loadProgress.value = progress
  loadMessage.value = message
}

const handleViewerLoaded = () => {
  isLoading.value = false
  loadProgress.value = 100
}

onMounted(() => {
  isLoading.value = true
  loadProgress.value = 0
  loadMessage.value = 'Loading viewer engine...'

  setTimeout(() => {
    loadMessage.value = 'Loading DWG parser...'
    loadProgress.value = 30
  }, 100)

  setTimeout(() => {
    loadMessage.value = 'Parsing drawing...'
    loadProgress.value = 60
    fileUrl.value = DEFAULT_FILE
  }, 500)
})
</script>

<template>
  <div class="viewer-page">
    <div class="controls">
      <div class="control-group">
        <label>File URL:</label>
        <input v-model="fileUrl" type="text" placeholder="Enter file URL or select local file" class="file-input" />
      </div>

      <div class="control-group">
        <label>Or Select File:</label>
        <input type="file" accept=".dwg,.dxf,.gltf,.glb,.obj,.fbx,.stl,.ifc,.pdf" @change="handleFileSelect"
          class="file-select" />
      </div>

      <div class="control-group">
        <label>Format:</label>
        <select v-model="fileFormat" class="format-select">
          <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>Viewer Type:</label>
        <select v-model="viewerType" class="type-select">
          <option value="2d">2D Viewer (DWG/DXF/PDF)</option>
          <option value="3d">3D Viewer (glTF/OBJ/FBX/STL/IFC)</option>
        </select>
      </div>

      <button @click="handleLoad" class="load-btn">Load File</button>
    </div>

    <div class="viewer-wrapper" :class="{ dragging: isDragging }" @dragover="handleDragOver"
      @dragleave="handleDragLeave" @drop="handleDrop">
      <CadViewer v-if="fileUrl" :file-url="fileUrl" :file-format="fileFormat" :type="viewerType"
        @loading="handleViewerLoading" @loaded="handleViewerLoaded" />
      <div v-else class="placeholder">
        <p>Drop file here or enter URL above</p>
        <p class="hint">Supported: DWG, DXF, glTF, GLB, OBJ, FBX, STL, IFC, PDF</p>
      </div>

      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-progress-bar">
            <div class="loading-progress" :style="{ width: loadProgress + '%' }"></div>
          </div>
          <p class="loading-message">{{ loadMessage }}</p>
          <p class="loading-percentage">{{ loadProgress }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer-page {
  display: flex;
  flex-direction: row;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  overflow: hidden;
}

.controls {
  width: 320px;
  min-width: 320px;
  padding: 24px;
  background: rgba(10, 14, 39, 0.95);
  border-right: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

.controls::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
}

.controls h2 {
  color: #00d4ff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 12px;
  font-weight: 500;
  color: #00d4ff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.file-select {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px dashed rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  font-size: 14px;
  color: #e0e0e0;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.file-select:hover {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.file-select::-webkit-file-upload-button {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #0a0e27;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
}

.file-input,
.format-select,
.type-select {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  font-size: 14px;
  color: #e0e0e0;
  outline: none;
  transition: all 0.3s ease;
}

.file-input:focus,
.format-select:focus,
.type-select:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.file-input::placeholder {
  color: rgba(224, 224, 224, 0.4);
}

.format-select option,
.type-select option {
  background: #0a0e27;
  color: #e0e0e0;
}

.load-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #0a0e27;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
}

.load-btn:active {
  transform: translateY(0);
}

.viewer-wrapper {
  flex: 1;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px dashed rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.viewer-wrapper:hover {
  border-color: rgba(0, 212, 255, 0.4);
}

.viewer-wrapper.dragging {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  box-shadow: inset 0 0 30px rgba(0, 212, 255, 0.2);
}

.viewer-wrapper::before {
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

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(224, 224, 224, 0.6);
  text-align: center;
}

.placeholder p {
  font-size: 16px;
  margin-bottom: 8px;
}

.placeholder .hint {
  font-size: 12px;
  color: rgba(0, 212, 255, 0.6);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 14, 39, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 212, 255, 0.2);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  margin: 0 auto 16px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0099cc);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.loading-message {
  color: #00d4ff;
  font-size: 14px;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.loading-percentage {
  color: rgba(224, 224, 224, 0.8);
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .viewer-page {
    flex-direction: column;
  }

  .controls {
    width: 100%;
    min-width: auto;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    max-height: 50vh;
  }

  .controls h2 {
    font-size: 16px;
  }

  .file-input,
  .file-select {
    width: 100%;
  }

  .format-select,
  .type-select {
    width: 100%;
  }

  .load-btn {
    width: 100%;
  }
}
</style>
