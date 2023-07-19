<script setup lang="ts">
import {computed, onMounted} from "vue";
import Menu from "./components/Menu.vue"
import {LinkItem} from "./store/link-item";
import {LinkStore} from "./store/link-store";
import { StoreManager } from "./store/store-manager";


const linkStore = new LinkStore();

onMounted(async () => {
  await linkStore.init();
  linkStore.enableAutoRefresh();
});

const deleteLink = async (link: LinkItem) => {
  await linkStore.deleteLink(link);
  await StoreManager.init();
  await StoreManager.syncFromStorage();
}

const domainLinks = computed(() => {
  const groupLinks = groupBy(linkStore.allLinks.value, (link: LinkItem) => link.hostname);
  return Object.values(groupLinks);
});

const groupBy = <T>(array: readonly T[], prop: (v: T) => string) => {
  return array.reduce((groups: { [key: string]: T[] }, item) => {
    const val = prop(item);
    groups[val] = groups[val] ?? [];
    groups[val].push(item);
    return groups
  }, {})
}
</script>

<template>
  <div class="container is-widescreen has-background-dark" style="height: 100vh">
    <Menu
        :domainLinks="domainLinks"
        @delete="deleteLink"
    ></Menu>
  </div>
</template>

<style>
@import 'bulma/css/bulma.css';

/* Hide scrollbar */
::-webkit-scrollbar {
  display: none;
}

</style>
