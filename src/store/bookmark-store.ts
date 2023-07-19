import { LinkItem } from "./link-item";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export class BookmarkStore {
    private static readonly ROOT_DIR_NAME = 'Individual Bookmark';
    private static readonly OTHER_BOOKMARK_ID = 2;
    private rootDirId: number = -1;

    private static async getAllBookmark(parentDirId: string): Promise<BookmarkTreeNode[]> {
        return await chrome.bookmarks.getChildren(parentDirId);
    }

    private static async getDirId(parentDirId: number, dirName: string) {
        const dirs = await chrome.bookmarks.getChildren(String(parentDirId));
        
        const dir = dirs.filter(bookmark => bookmark.title === dirName)[0];
        
        if (dir !== undefined) {
            return Number(dir.id);
        }
        
        const newDir = await BookmarkStore.createDir(parentDirId, dirName);
        return Number(newDir.id);
    }

    private static toLinkItem(bookmark: BookmarkTreeNode): LinkItem {
        const url = bookmark.url as string;
        // todo index
        return {
            title: bookmark.title,
            url: url,
            hostname: new URL(url).hostname,
            index: 0,
        }
    }

    private static createDir(parentDirId: number, dirName: string) {
        return chrome.bookmarks.create({
            title: dirName,
            parentId: String(parentDirId),
        });
    }

    public async init() {
        this.rootDirId = await BookmarkStore.getDirId(BookmarkStore.OTHER_BOOKMARK_ID, BookmarkStore.ROOT_DIR_NAME);
    }

    public async getAllLinks(): Promise<LinkItem[]> {
        const dirs = await BookmarkStore.getAllBookmark(String(this.rootDirId))
        const nestItems = await Promise.all(dirs.map(dir => BookmarkStore.getAllBookmark(dir.id)));
        const items = nestItems.flat();
        return items.map(BookmarkStore.toLinkItem);
    }

    public async add(linkItem: LinkItem): Promise<BookmarkTreeNode> {
        const hostnameDirId = await BookmarkStore.getDirId(this.rootDirId, linkItem.hostname);
        
        return chrome.bookmarks.create({
            title: linkItem.title,
            url: linkItem.url,
            parentId: String(hostnameDirId),
        });
    }

    public async clear() {
        console.log(this.rootDirId);
        await chrome.bookmarks.removeTree(String(this.rootDirId));
        await this.init();
    }
}
