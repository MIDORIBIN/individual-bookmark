import {LinkItem} from "./link-item";

export class LinkStorage {
  private static readonly KEY_NAME = 'db'

  public async getItem(): Promise<LinkItem[]> {
    const items = await chrome.storage.local.get(LinkStorage.KEY_NAME)
    return items[LinkStorage.KEY_NAME] || []
  }

  public setItem(links: LinkItem[]): Promise<void> {
    return chrome.storage.local.set({[LinkStorage.KEY_NAME]: links});
  }

  public setChangeFunc(func: () => void) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[LinkStorage.KEY_NAME]) {
        func();
      }
    });
  }

  public async show() {
    const items = await this.getItem();
    console.table(items);
  }
}
