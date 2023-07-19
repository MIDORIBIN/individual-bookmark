<script setup lang="ts">
import {LinkItem} from "../store/link-item";
import {computed} from "vue";
import URLItem from "./URLItem.vue";


const props = defineProps<{
  links: LinkItem[];
  open: boolean;
}>();
const emit = defineEmits<{
  click: [hostname: string];
  delete: [link: LinkItem];
}>();

const hostname = computed(() => props.links[0].hostname);

const click = () => {
  emit('click', hostname.value);
}
const deleteLink = (link: LinkItem) => {
  emit('delete', link);
}
</script>

<template>
  <li>
    <a class="has-text-link-light" @click="click">
      <span class="icon"><i class="fas fa-caret-right"></i></span>
      <figure class="image is-24x24 is-inline-block pt-1 mx-2">
        <img :src="`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=48&url=http://${links[0].hostname}`">
      </figure>
      <span>{{ hostname }}</span>
    </a>

    <ul v-if="open">
      <URLItem
          v-for="link in links"
          :link="link"
          @delete="deleteLink"
      ></URLItem>
    </ul>
  </li>
</template>

<style scoped>
</style>
