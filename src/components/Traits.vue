<script lang="ts" setup>
import { useSelectedComponent } from '@/composables'
import Counter from './Counter.vue'

const components = { Counter }
const { grapes } = defineProps(['grapes'])
const selected = useSelectedComponent(grapes)
</script>

<template>
  <template v-for="trait in selected.component.traits" :key="trait">
    <div>
      {{ trait.label }}:
<!--      <component :is="components[trait.type]" :trait="trait" />-->
      <Counter :trait="trait"/>
    </div>
  </template>
</template>
