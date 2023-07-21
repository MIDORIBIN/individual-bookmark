import { LinkItem } from "./link-item";


export class LinkDB {
    private static readonly KEY_NAME = 'db'

    private static async getItem(): Promise<LinkItem[]> {
        console.log('getItem');
        const items = await chrome.storage.local.get(this.KEY_NAME)
        return items[this.KEY_NAME] || []
    }

    private static setItem(links: LinkItem[]): Promise<void> {
        console.log('setItem', links);
        return chrome.storage.local.set({ [this.KEY_NAME]: links });
    }

    public static async add(targetLink: LinkItem): Promise<LinkItem> {
        const links = await this.getItem();
        const registryLink = links.filter(link => link.url === targetLink.url)[0];
        if (registryLink !== undefined) {
            return registryLink;
        }
        links.push(targetLink);
        await this.setItem(links);
        return targetLink;
    }

    public static async get(url: string): Promise<LinkItem | undefined> {
        const links = await this.getItem();
        return links.filter(link => link.url === url)[0];
    }

    public static async getAll(): Promise<LinkItem[]> {
        return this.getItem();
    }

    public static async delete(targetLink: LinkItem): Promise<LinkItem> {
        const links = await this.getItem();
        const deletedLinks = links.filter(link => link.url !== targetLink.url);

        await this.setItem(deletedLinks);
        return targetLink;
    }

    public static async deleteAll(): Promise<void> {
        return this.setItem([]);
    }

    public static addOnChanged(func: () => void) {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes[this.KEY_NAME]) {
                func();
            }
        });
    }
}
