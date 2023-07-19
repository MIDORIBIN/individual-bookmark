import {LinkItem} from "./src/store/link-item";
import {LinkStore} from "./src/store/link-store";
import {StoreManager} from "./src/store/store-manager";


// インストール時
chrome.runtime.onInstalled.addListener(async () => {
  console.log('start onInstalled');
  await StoreManager.init();
  await StoreManager.syncFromBookmark();
  console.log('end onInstalled');
});

// 右上ボタン
chrome.action.onClicked.addListener(async () => {
  console.log('start onClicked');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const title = tab.title as string;
  const url = tab.url as string;
  await clickButton(title, url);
  console.log('end onClicked');
});

const clickButton = async (title: string, url: string) => {
  const link: LinkItem = {
    title: title,
    url: url,
    hostname: new URL(url).hostname,
    index: 0,
  };
  const linkStore = new LinkStore();
  await linkStore.init();
  await linkStore.add(link);
  await StoreManager.syncFromStorage();
}

// ページ遷移時
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('start onUpdated');
  if (changeInfo.status !== 'complete') {
    return;
  }
  const url = tab.url ? tab.url : '';
  const linkStore = new LinkStore();
  const link = linkStore.get(url);

  if (link === null) {
    await chrome.action.setBadgeText({text: '', tabId});
  } else {
    await chrome.action.setBadgeText({text: '○', tabId});
  }
  console.log('end onUpdated');
});
