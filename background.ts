import { BookmarkStore } from "./src/store/bookmark-store";
import { LinkItem } from "./src/store/link-item";
import { LinkDB } from "./src/store/link-db";


// インストール時
chrome.runtime.onInstalled.addListener(async () => {
  console.log('start onInstalled');
  await BookmarkStore.syncToDB();
  console.log('end onInstalled');
});

// 起動時
const onStart = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('on start');
  LinkDB.addOnChanged(() => BookmarkStore.syncFromDB());
  LinkDB.addOnChanged(() => updateBadge());
}
onStart();

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
  await LinkDB.add(link);
}

// ページ遷移時
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    return;
  }
  console.log('start onUpdated');
  updateBadge(tab.url, tabId)
  console.log('end onUpdated');
});

// バッチの更新処理
const updateBadge = async (url?: string, tabId?: number) => {
  if (url === undefined || tabId === undefined) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url || '';
    const tabId = tab.id || -1;
    await refreshBadge(url, tabId);
  } else {
    await refreshBadge(url, tabId);
  }
}

const refreshBadge = async (url: string, tabId: number) => {
  const link = await LinkDB.get(url);
  const badgeText = link === undefined ? '' : '✓';
  await chrome.action.setBadgeText({ text: badgeText, tabId });
}
