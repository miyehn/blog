import jQuery from "jquery";

export type PostInfo = {
	date: string,
	title: string,
	path: string,
	tags: string[],
};

class Post {
	index: number;
	info: PostInfo;
	#bContentReady: boolean = false;
	#content: string = "abababa";
	constructor(index: number, info: PostInfo) {
		this.index = index;
		this.info = info;
	}
	asyncGetContent(cb: (content: string)=>void): string {
		if (this.#bContentReady) return this.#content;
		return "loading..";
	}
}

class NetworkManager {
	#fetchCache = new Map<string, string>();
	asyncFetch(
		url: string,
		callback: (data: string) => void,
		errorCallback?: (jqXHR:any, textStatus:any, errorThrown:any)=>void)
	{
		let cachedContent = this.#fetchCache.get(url);
		if (cachedContent) {
			callback(cachedContent);
			return;
		}
		jQuery.ajax({
			type: 'GET',
			url: url,
			success: (data: string)=>{
				callback(data);
				this.#fetchCache.set(url, data);
			},
			error: errorCallback,
			async: true
		});
	}
}

class ContentManager {
	#networkManager: NetworkManager;
	#magicword: string;
	blogInfo = {
		chunkSize: 100,
		domainName: process.env.REACT_APP_DOMAIN,
		email: "rainduym@gmail.com",
		socialHandles: [
			{
				"platform": "lofter",
				"url": ""
			}, {
				"platform": "instagram",
				"url": ""
			}, {
				"platform": "tumblr",
				"url": ""
			}, {
				"platform": "twitter",
				"url": "https://twitter.com/rain_dd"
			}, {
				"platform": "weibo",
				"url": "https://www.weibo.com/rainduym"
			}, {
				"platform": "github",
				"url": "https://github.com/miyehn"
			}
		],
		title: "槽",
		postsPerPage: 6
	}

	constructor() {
		this.#networkManager = new NetworkManager();
		this.#magicword = "";
	}

	asyncGetPosts(globalStartIdx: number, numPosts: number, cb: (data: PostInfo[], finished: boolean)=>void): void {

		if (numPosts <= 0) {
			console.log("there's nothing to fetch.");
			cb([], true);
			return;
		}

		let result: PostInfo[] = [];
		const cm = this;
		let recursiveHelper = function(globalStartIdx: number, numPosts: number, cb: (data: PostInfo[], finished: boolean)=>void) {
			// recursive:
			const currentChunkIndex = Math.floor(globalStartIdx / cm.blogInfo.chunkSize);
			const currentChunkStartIdx = currentChunkIndex * cm.blogInfo.chunkSize;
			const postsInCurrentChunk = Math.min(numPosts, currentChunkStartIdx + cm.blogInfo.chunkSize - globalStartIdx);
			const url = cm.blogInfo.domainName + "/mrblog-content/index/" + cm.#magicword + currentChunkIndex.toString();
			console.log("fetching " + postsInCurrentChunk + " posts from " + url);

			cm.#networkManager.asyncFetch(url, data=>{
				console.log("fetch succeeded.");
				const content = JSON.parse(data).content;
				const start = globalStartIdx - currentChunkStartIdx;
				const end = start + postsInCurrentChunk;
				result = result.concat(content.slice(start, end));

				// potentially recurse, if current chunk didn't contain everything asked for
				if (numPosts - postsInCurrentChunk > 0) {
					cb(result, false);
					recursiveHelper(globalStartIdx + postsInCurrentChunk, numPosts - postsInCurrentChunk, cb);
				} else {
					cb(result, true);
				}
			}, (jqXHR, textStatus, errorThrown) => {
				console.log("failed fetching from url: " + url);
				if (jqXHR.status === 404) {
					cm.#magicword = "";
				}
			});
		}
		recursiveHelper(globalStartIdx, numPosts, cb);
	}
}

export const contentManager = new ContentManager();