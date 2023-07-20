import { Ref, ref } from "vue";
import { LinkItem } from "./link-item";
import { LinkDB } from "./link-db";

export class LinkRepository {
    private static ALL_LINKS: Ref<LinkItem[]> = ref([]);
    static {
        LinkDB.addOnChanged(() => this.refresh());
    }

    public static async refresh() {
        this.ALL_LINKS.value = [...await LinkDB.getAll()];
    }

    public static getAllLinks() {
        return this.ALL_LINKS;
    }
}
