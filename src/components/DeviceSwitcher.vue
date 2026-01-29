<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useDevices } from '@/composables'

const props = defineProps<{
  grapes: any
}>()
const deviceMgr = useDevices(props.grapes)
const getDeviceId = (device: any) => {
  if (typeof device === 'string') return device
  return device && typeof device.get === 'function' ? device.get('id') : device?.id
}

const getDeviceName = (device: any) =>
  device && typeof device.get === 'function' ? device.get('name') : device?.name

const getDeviceIcon = (device: any) => {
  const id = getDeviceId(device)
  const icons: Record<string, string> = {
    desktop: 'lucide:monitor',
    tablet: 'lucide:tablet',
    mobileLandscape: 'prime:cellphone',
    mobile: 'lucide:smartphone',
  }
  return icons[id] ?? 'mdi:devices'
}
</script>

<template>
  <div class="flex">
    <template v-for="device in deviceMgr.devices" :key="device.id">
      <button
        :class="{
          'bg-editor-btn-active':
            getDeviceId(device) === getDeviceId(deviceMgr.selected),
        }"
        @click="deviceMgr.select(device)"
        class="aspect-square w-8 flex items-center justify-center rounded text-white"
        :title="getDeviceName(device)"
        :aria-label="getDeviceName(device)"
      >
        <Icon :icon="getDeviceIcon(device)" />
      </button>
    </template>
  </div>
</template>
