<script lang="ts" setup>
const { trait } = defineProps(['trait'])
</script>

<template>
	<span>
		<button @click="trait.value = trait.value--">-</button>
		{{ trait.value }}
		<button @click="trait.value = trait.value ++">+</button>
	</span>
</template>
