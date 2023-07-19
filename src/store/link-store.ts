import {LinkItem} from "./link-item";
import {LinkStorage} from "./link-storage";
import {MockLinkStorage} from "./mock-link-storage";
import {Ref, ref} from "vue";

export class LinkStore {
  private static _allLinks: Ref<LinkItem[]> = ref([]);
  private linkStorage = this.createStorage();

  private createStorage() {
    const isLocal = location.href === 'http://127.0.0.1:5173/';
    return isLocal ? new MockLinkStorage() : new LinkStorage();
  }

  private async refresh() {
    LinkStore._allLinks.value.splice(0);
    LinkStore._allLinks.value.push(...await this.linkStorage.getItem());
  }

  public get(url: string): LinkItem | null {
    const filtered_links = LinkStore._allLinks.value.filter(link => link.url === url)
    if (filtered_links.length >= 1) {
      return filtered_links[0];
    }
    return null;
  }

  public get allLinks(): Ref<LinkItem[]> {
    return LinkStore._allLinks;
  }

  public init(): Promise<void> {
    return this.refresh();
  }

  public async add(linkItem: LinkItem): Promise<LinkItem> {
    // 同時に呼ばれるとバグる
    const registLink = this.get(linkItem.url);
    if (registLink !== null) {
      // 登録済み
      return Promise.resolve(registLink);
    }

    const links = LinkStore._allLinks.value.concat([linkItem]);
    await this.linkStorage.setItem(links);
    // await this.linkStorage.show();
    await this.refresh();
    return Promise.resolve(linkItem);
  }

  public deleteLink(targetLink: LinkItem) {
    const links = Array.from(LinkStore._allLinks.value);
    const index = LinkStore._allLinks.value.findIndex(link => link.url === targetLink.url);
    links.splice(index, 1);
    return this.linkStorage.setItem(links);
  }

  public enableAutoRefresh() {
    this.linkStorage.setChangeFunc(() => this.refresh());
  }

  public async clear() {
    return this.linkStorage.setItem([]);
  }
}
