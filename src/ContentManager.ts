export type PostInfo = {
	date: string,
	title: string,
	path: string,
	categories: string[],
	collapsed: boolean
};

export type CategoryInfo = {
	categoryName: string,
	categoryPath: string,
	count: number
};

export type CategoryFolderNode = {
	isFolder: true,
	name: string,
	path: string,
	children: CategoryTree[]
};
type CategoryContentNode = {
	isFolder: false,
	node: CategoryInfo
}

export type CategoryTree = CategoryFolderNode | CategoryContentNode;

export type CategoryNode = {
	name: string,
	path: string,
	count: number,
	children: CategoryNode[]
};

class NetworkManager {
	#fetchCache = new Map<string, string>();
	asyncFetch(
		url: string,
		callback: (data: string) => void,
		errorCallback?: (err: any)=>void)
	{
		const cachedContent = this.#fetchCache.get(url);
		if (cachedContent) {
			callback(cachedContent);
			return;
		}
		fetch(url)
			.then(async (resp) => {
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				const text = await resp.text();
				callback(text);
				this.#fetchCache.set(url, text);
			})
			.catch((err) => {
				if (errorCallback) errorCallback(err);
			});

	}
}

class ContentManager {
	#networkManager: NetworkManager;
	#magicword: string;
	blogInfo = {
		chunkSize: 100,
		domainName: import.meta.env.VITE_APP_DOMAIN,//process.env.REACT_APP_DOMAIN,
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
		initialNumPosts: 20,
		postsPerPage: 10,
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

	asyncGetTimelineEvents(cb: (evts: {time: Date, event: string}[]) => void) {
		const url = this.blogInfo.domainName + "/mrblog-content/timeline";
		this.#networkManager.asyncFetch(url, data => {
			const parsed = JSON.parse(data).map((date: any)=>{ return {
				time: Date.parse(date.t),
				event: date.d
			} }).sort((a: {time: number, event: string}, b: {time: number, event: string}) => {
				return b.time - a.time
			}).map((evt: {time: number, event: string}) => { return {
				time: new Date(evt.time),
				event: evt.event
			} });
			cb(parsed);
		});
	}

	asyncGetCategoryTree(cb: (T: CategoryNode)=>void) {
		const url = this.blogInfo.domainName + "/mrblog-content/index/categories";
		this.#networkManager.asyncFetch(url, data =>{
			const parsed: {category: string, num: number}[] = JSON.parse(data);

			const findCategoryNum = function(name: string) {
				for (let i = 0; i < parsed.length; i++) {
					if (parsed[i].category === name) return parsed[i].num;
				}
				return 0;
			}

			// construct tree here
			const tree: CategoryNode = {name: "", path: "", count: 0, children: []};
			parsed.forEach(cat => { // root level category (with full path)

				// this post's non-empty category nodes, from root to leaf:
				const nodes = cat.category.split('-').map(n => n.trim()).filter(n => n.length > 0);
				let currentParent: CategoryNode = tree;
				for (let i = 0; i < nodes.length; i++) {// go down the tree from tree root (depth=0)
					const cnode = nodes[i];

					let foundChild: CategoryNode | undefined = undefined;
					currentParent.children.forEach(child => {
						if (child.name === cnode) {
							foundChild = child;
						}
					});

					if (foundChild) {
						currentParent = foundChild;
					} else {
						const categoryName = nodes.slice(0, i+1).join('-');
						const newTreeNode: CategoryNode = {
							name: cnode,
							path: categoryName,
							count: findCategoryNum(categoryName),
							children: []
						};
						currentParent.children.push(newTreeNode);
						// next iter, if need to keep going
						if (i !== nodes.length - 1) currentParent = newTreeNode;
					}
				}
			});
			cb(tree);
		});
	}

	asyncGetPost(permalink: string, cb: (info: PostInfo, content: string)=>void) {
		const url = this.blogInfo.domainName + "/mrblog-content/blogposts/" + permalink;
		this.#networkManager.asyncFetch(url, data =>{
			let parsed = JSON.parse(data);
			cb({
				title: parsed.title,
				categories: parsed.categories,
				date: parsed.date,
				path: permalink,
				collapsed: false
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
			if (props.category !== undefined && props.category.length > 0) {
				 url += "category_" + props.category + "_";
			}
			url += currentChunkIndex.toString();

			//console.log("fetching " + postsInCurrentChunk + " posts from chunk " + currentChunkIndex);

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
			}, (err) => {
				console.log("failed fetching from url: " + url);
				console.log(err);
				/*
				if (jqXHR.status === 404) { // likely due to wrong magicword
					cm.#magicword = "";
				}
				 */
				cb(result, true, -1);
			});
		}
		recursiveHelper(props.globalStartIdx, props.numPosts, props.cb);
	}
}

export const contentManager = new ContentManager();