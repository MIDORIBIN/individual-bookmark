import { LinkItem } from "./link-item";
import { LinkDB } from "./link-db";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;


export class BookmarkStore {
    private static readonly ROOT_DIR_NAME = 'Individual Bookmark';
    private static readonly OTHER_BOOKMARK_ID = 2;

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

    private static async deleteAll(root_dir_id: number) {
        await chrome.bookmarks.removeTree(String(root_dir_id));
    }

    private static async add(root_dir_id: number, linkItem: LinkItem): Promise<BookmarkTreeNode> {
        const hostnameDirId = await BookmarkStore.getDirId(root_dir_id, linkItem.hostname);

        return chrome.bookmarks.create({
            title: linkItem.title,
            url: linkItem.url,
            parentId: String(hostnameDirId),
        });
    }

    private static async getAllLinks(root_dir_id: number): Promise<LinkItem[]> {
        const dirs = await this.getAllBookmark(String(root_dir_id));

        console.log(dirs);
        const nestItems = await Promise.all(dirs.map(dir => this.getAllBookmark(dir.id)));
        console.log(nestItems);

        const items = nestItems.flat();
        return items.map(this.toLinkItem);
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

    private static async getAllBookmark(parentDirId: string): Promise<BookmarkTreeNode[]> {
        console.log(parentDirId);

        return await chrome.bookmarks.getChildren(parentDirId);
    }

    public static async syncFromDB() {
        console.log('syncFromDB');
        const root_dir_id = await this.getDirId(BookmarkStore.OTHER_BOOKMARK_ID, BookmarkStore.ROOT_DIR_NAME);
        this.deleteAll(root_dir_id);

        const new_root_dir_id = await this.getDirId(BookmarkStore.OTHER_BOOKMARK_ID, BookmarkStore.ROOT_DIR_NAME);
        const links = await LinkDB.getAll();
        for (const link of links) {
            await this.add(new_root_dir_id, link);
        }
    }

    public static async syncToDB() {
        await LinkDB.deleteAll();

        const root_dir_id = await this.getDirId(BookmarkStore.OTHER_BOOKMARK_ID, BookmarkStore.ROOT_DIR_NAME);
        console.log('root_dir_id', root_dir_id);
        const links = await this.getAllLinks(root_dir_id)
        console.log('links', links);
        for (const link of links) {
            await LinkDB.add(link);
        }
    }
}
