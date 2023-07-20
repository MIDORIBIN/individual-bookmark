<script setup lang="ts">
import { computed, onMounted } from "vue";
import Menu from "./components/Menu.vue"
import { LinkItem } from "./store/link-item";
import { LinkRepository } from "./store/link-repository";
import { LinkDB } from "./store/link-db";


onMounted(async () => {
  LinkRepository.refresh();
});

const deleteLink = async (link: LinkItem) => {
  await LinkDB.delete(link)
}

const domainLinks = computed(() => {
  const groupLinks = groupBy(LinkRepository.getAllLinks().value, (link: LinkItem) => link.hostname);
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
    <Menu :domainLinks="domainLinks" @delete="deleteLink"></Menu>
  </div>
</template>

<style>
@import 'bulma/css/bulma.css';

/* Hide scrollbar */
::-webkit-scrollbar {
  display: none;
}
</style>
