<script setup lang="ts">
import {LinkItem} from "../store/link-item";

const props = defineProps<{
  link: LinkItem;
}>();
const emit = defineEmits<{
  delete: [link: LinkItem];
}>();

const transPage = () => {
  chrome.tabs.create({url: props.link.url});
}
const deleteLink = () => {
  emit('delete', props.link);
}
</script>

<template>
  <li>
    <a class="has-text-link-light" @click="transPage">
      <span class="icon"><i class="fas fa-file"></i></span>
      <span>{{link.title}}</span>
      <button class="button is-pulled-right is-small" @click.stop="deleteLink">
        <span class="icon is-small">
          <i class="fas fa-trash"></i>
        </span>
      </button>
    </a>
  </li>
</template>

<style scoped>
</style>
