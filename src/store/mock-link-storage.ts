import {LinkItem} from "./link-item";

export class MockLinkStorage {
  private mockData = [
    {
      "hostname": "extensions",
      "index": 0,
      "title": "拡張機能",
      "url": "chrome://extensions/"
    },
    {
      "hostname": "qiita.com",
      "index": 0,
      "title": "Qiita",
      "url": "https://qiita.com/"
    },
    {
      "hostname": "qiita.com",
      "index": 0,
      "title": "[ChatGPT]2次元キャラと会話したかったので会話アプリを自作してみた - Qiita",
      "url": "https://qiita.com/daifukusan/items/de74f272e71dd87f853c"
    },
    {
      "hostname": "www.op.gg",
      "index": 0,
      "title": "MIDORIBI - Summoner Stats - League of Legends",
      "url": "https://www.op.gg/summoners/jp/midoribi"
    },
    {
      "hostname": "github.com",
      "index": 0,
      "title": "GitHub",
      "url": "https://github.com/"
    }
  ];
  private func: () => void = () => {};

  public async getItem(): Promise<LinkItem[]> {
    return this.mockData;
  }

  public setItem(links: LinkItem[]): Promise<void> {
    console.log('mock set item');
    this.mockData = links;
    this.func();
    return Promise.resolve();
  }

  public setChangeFunc(func: () => void) {
    this.func = func;
    return;
  }

  public clear() {
    this.mockData = [];
  }
  
  public async show() {
    console.table(this.mockData);
  }
}
