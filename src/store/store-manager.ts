import { BookmarkStore } from "./bookmark-store";
import { LinkStore } from "./link-store";

export class StoreManager {
    private static readonly linkStore = new LinkStore();
    private static readonly bookmarkStore = new BookmarkStore();

    public static async init() {
        await StoreManager.linkStore.init();
        await StoreManager.bookmarkStore.init();
    }

    public static async syncFromStorage() {
        await StoreManager.bookmarkStore.clear();

        const allLinks = StoreManager.linkStore.allLinks.value;
        console.log(allLinks);
        
        for (const link of allLinks) {
            await StoreManager.bookmarkStore.add(link);
        }
    }

    public static async syncFromBookmark() {
        await StoreManager.linkStore.clear();

        const allLinks = await StoreManager.bookmarkStore.getAllLinks();
        for (const link of allLinks) {
            await StoreManager.linkStore.add(link);
        }
    }
}
