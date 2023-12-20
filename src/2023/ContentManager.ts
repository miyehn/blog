import jQuery from "jquery";

export type PostInfo = {
	date: string,
	title: string,
	path: string,
	tags: string[],
};

export type CategoryInfo = {
	category: string,
	count: number
};

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

	asyncGetAbout(cb: (content: string)=>void) {
		const url = this.blogInfo.domainName + "/mrblog-content/about";
		this.#networkManager.asyncFetch(url, data =>{
			cb(data);
		});
	}

	asyncGetCategoriesInfo(cb: (list: CategoryInfo[])=>void) {
		const url = this.blogInfo.domainName + "/mrblog-content/index/tags";
		this.#networkManager.asyncFetch(url, data =>{
			const parsed: {tag: string, num: number}[] = JSON.parse(data);
			const mapped: CategoryInfo[] = parsed.map(tag => {return {category: tag.tag, count: tag.num}});
			cb(mapped);
		});
	}

	asyncGetPost(permalink: string, cb: (info: PostInfo, content: string)=>void) {
		const url = this.blogInfo.domainName + "/mrblog-content/blogposts/" + permalink;
		this.#networkManager.asyncFetch(url, data =>{
			let parsed = JSON.parse(data);
			cb({
				title: parsed.title,
				tags: parsed.tags,
				date: parsed.date,
				path: permalink
			}, parsed.content);
		});
	}

	// this call assumes globalStartIdx is valid. If numPosts is too large, it'll simply finish at the last available fetch
	asyncGetPostsInfo(props: {
		globalStartIdx: number,
		numPosts: number,
		category?: string,
		cb: (data: PostInfo[], finished: boolean, totalNumPosts: number)=>void
	})
	{

		if (props.numPosts <= 0) {
			console.log("there's nothing to fetch.");
			props.cb([], true, -1);
			return;
		}

		let result: PostInfo[] = [];
		const cm = this;
		let recursiveHelper = function(globalStartIdx: number, numPosts: number, cb: (data: PostInfo[], finished: boolean, totalNumPosts: number)=>void) {

			const currentChunkIndex = Math.floor(globalStartIdx / cm.blogInfo.chunkSize);
			const currentChunkStartIdx = currentChunkIndex * cm.blogInfo.chunkSize;
			const postsInCurrentChunk = Math.min(numPosts, currentChunkStartIdx + cm.blogInfo.chunkSize - globalStartIdx);
			// construct url
			let url = cm.blogInfo.domainName + "/mrblog-content/index/" + cm.#magicword;
			if (props.category !== undefined) {
				// HACK: using tags as categories for now:
				if (props.category.slice(0, 4) === "tag_") {
					url += props.category + "_";
				} else {
					url += "category_" + props.category + "_";
				}
			}
			url += currentChunkIndex.toString();

			console.log("fetching " + postsInCurrentChunk + " posts from chunk " + currentChunkIndex);

			cm.#networkManager.asyncFetch(url, data=>{
				const parsed = JSON.parse(data);
				const start = globalStartIdx - currentChunkStartIdx;
				const end = start + postsInCurrentChunk;
				result = result.concat(parsed.content.slice(start, end));

				const totalNumChunks = Math.floor((parsed.count + cm.blogInfo.chunkSize - 1) / cm.blogInfo.chunkSize);
				if (numPosts - postsInCurrentChunk > 0 && currentChunkIndex + 1 < totalNumChunks) {
					// recurse, if current chunk didn't contain everything asked for and there are more chunks to fetch
					cb(result, false, parsed.count);
					recursiveHelper(globalStartIdx + postsInCurrentChunk, numPosts - postsInCurrentChunk, cb);
				} else {
					// finished
					cb(result, true, parsed.count);
				}
			}, (jqXHR, textStatus, errorThrown) => {
				console.log("failed fetching from url: " + url);
				if (jqXHR.status === 404) { // likely due to wrong magicword
					cm.#magicword = "";
				}
				cb(result, true, -1);
			});
		}
		recursiveHelper(props.globalStartIdx, props.numPosts, props.cb);
	}
}

export const contentManager = new ContentManager();