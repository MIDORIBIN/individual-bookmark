import { LinkItem } from "./link-item";
import { LinkDB } from "./link-db";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;


export class BookmarkStore {
    private static readonly ROOT_DIR_NAME = 'Individual Bookmark';
    private static readonly OTHER_BOOKMARK_ID = 2;

    private static async add(rootDirId: number, linkItem: LinkItem): Promise<BookmarkTreeNode> {
        const hostnameDirId = await this.getDirId(rootDirId, linkItem.hostname);

        return chrome.bookmarks.create({
            title: linkItem.title,
            url: linkItem.url,
            parentId: String(hostnameDirId),
        });
    }

    private static async getAll(rootDirId: number): Promise<LinkItem[]> {
        const dirs = await this.getAllBookmark(String(rootDirId));
        const nestItems = await Promise.all(dirs.map(dir => this.getAllBookmark(dir.id)));
        const items = nestItems.flat();
        return items.map(this.toLinkItem);
    }

    private static async getAllBookmark(parentDirId: string): Promise<BookmarkTreeNode[]> {
        return await chrome.bookmarks.getChildren(parentDirId);
    }

    private static async deleteAll(rootDirId: number) {
        await chrome.bookmarks.removeTree(String(rootDirId));
    }
    
    private static async getDirId(parentDirId: number, dirName: string) {
        const dirs = await chrome.bookmarks.getChildren(String(parentDirId));

        const dir = dirs.filter(bookmark => bookmark.title === dirName)[0];
        if (dir !== undefined) {
            return Number(dir.id);
        }

        const newDir = await this.createDir(parentDirId, dirName);
        return Number(newDir.id);
    }

    private static createDir(parentDirId: number, dirName: string) {
        return chrome.bookmarks.create({
            title: dirName,
            parentId: String(parentDirId),
        });
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

    public static async syncFromDB() {
        const rootDirId = await this.getDirId(this.OTHER_BOOKMARK_ID, this.ROOT_DIR_NAME);
        this.deleteAll(rootDirId);

        const newRootDirId = await this.getDirId(this.OTHER_BOOKMARK_ID, this.ROOT_DIR_NAME);
        const links = await LinkDB.getAll();
        for (const link of links) {
            await this.add(newRootDirId, link);
        }
    }

    public static async syncToDB() {
        await LinkDB.deleteAll();

        const rootDirId = await this.getDirId(this.OTHER_BOOKMARK_ID, this.ROOT_DIR_NAME);
        const links = await this.getAll(rootDirId)
        for (const link of links) {
            await LinkDB.add(link);
        }
    }
}
