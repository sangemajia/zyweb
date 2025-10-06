<template>
  <t-input v-model="modelValue" :label="label" :placeholder="placeholder" class="input" :class="inputClass">
    <template #suffix>
      <t-button class="button w-btn" theme="default" @click="handleClick">
        {{ buttonText }}
      </t-button>
    </template>
  </t-input>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'click']);

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleClick = () => {
  emit('click');
};
</script>
