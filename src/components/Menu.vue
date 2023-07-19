<script setup lang="ts">
import {LinkItem} from "../store/link-item";
import DomainDirectory from "./DomainDirectory.vue"
import {ref} from "vue";

defineProps<{
  domainLinks: LinkItem[][]
}>();

const emit = defineEmits<{
  delete: [link: LinkItem];
}>();

const selectedHostname = ref('');

const click = (hostname: string) => {
  selectedHostname.value = selectedHostname.value === hostname ? '' : hostname
}
const deleteLink = (link: LinkItem) => {
  emit('delete', link);
}

const isOpen = (links: LinkItem[]) => {
  return links[0].hostname === selectedHostname.value;
}

</script>

<template>
  <div class="menu has-text-left">
    <ul class="menu-list">
      <template v-for="links in domainLinks">
        <DomainDirectory
            :links="links"
            :open="isOpen(links)"
            @click="click"
            @delete="deleteLink"
        ></DomainDirectory>
      </template>
    </ul>
  </div>
</template>

<style scoped>
</style>
