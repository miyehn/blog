import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {CategoryFolderNode, CategoryInfo, CategoryTree, contentManager, PostInfo} from "./ContentManager";
import {Route, Link, BrowserRouter} from "react-router-dom";
import {Expandable, Markdown} from "./Utils"

import {TiSocialInstagram as Ins} from "react-icons/ti";
import {FaTumblrSquare as Tumblr, FaTwitterSquare as Twitter, FaWeibo as Weibo} from "react-icons/fa";
import {GrGithub as Github} from "react-icons/gr";
import {IoMdMail as Mail} from "react-icons/io";
import {Clickable} from "./Utils";
import {useParams} from "react-router";

type StateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function Logo() {
	return  <img style={{
		display: "block",
		position: "relative",
		margin: "auto",
		marginTop: 20,
		height: 72,
	}} src={require("./avatar.png")} alt={"avatar"}/>
}

// using raw <a> tags here so that hovering over these elements show the url
function Social() {
	let mailto = "mailto" + contentManager.blogInfo.email;
	let handles = contentManager.blogInfo.socialHandles.filter(s=>{
		return s.url.trim().length > 0
	});

	let toIcon = function(s: string) {
		if (s==="instagram") {
			return <Ins id="instagram" className="socialIcon clickable hoverHighlight" size={26} />
		} else if (s==="weibo") {
			return <Weibo className="socialIcon clickable hoverHighlight" size={22} />
		} else if (s==="tumblr") {
			return <Tumblr className="socialIcon clickable hoverHighlight" size={22} />
		} else if (s==="github") {
			return <Github className="socialIcon clickable hoverHighlight" size={22} />
		} else if (s==="twitter") {
			return <Twitter className="socialIcon clickable hoverHighlight" size={22} />
		}
	}

	return(
		<div style={{
			marginTop: 30,
			marginBottom: 50,
			textAlign: "center",
			verticalAlign: "middle"
		}}>
			{handles.map(item=>
				<a key={item.platform} href={item.url}> {toIcon(item.platform)} </a>
			)}

			<br/>

			<a className="clickable hoverHighlight" href={mailto}>
				<Mail id="mail" size={18} /> {contentManager.blogInfo.email}
			</a>
		</div>
	)
}

function AboutContent() {
	const [content, setContent] = useState("loading..");
	useEffect(()=>{
		contentManager.asyncGetAbout(newContent=>{setContent(newContent);});
	}, []);
	return <Markdown content={content}/>;
}

export function AboutPage() {
	return <div className="noScrollBar" style={{
		height: "100%",
		overflow: "scroll",
		overscrollBehaviorY: "contain",
	}}>
		<Logo/>
		<Social/>
		<AboutContent/>
	</div>
}

export function ArrowButton(props: {
	expanded: boolean
}) {
	let pageName = localStorage.getItem("directoryPageName");
	if (pageName === null) pageName = "about";

	const cachedCategory = localStorage.getItem("lastRenderedCategory");
	let linkPath = "/";
	if (!props.expanded) {
		linkPath += pageName;
		if (pageName === "archive" && cachedCategory !== null) {
			linkPath += "/" + cachedCategory;
		}
	}

	const style: CSSProperties = {
		position: "relative",
		width: 30,
		height: 30,
		left: -15,
		textAlign: "center",
		margin: "auto",
		cursor: "pointer"
	};

	const btn = <Link to={linkPath}><Clickable style={style} content={props.expanded ? "<<" : ">>"}/></Link>

	return <div style={{
		position: "absolute",
		top: 20,
		left: props.expanded ? undefined : 30,
		right: props.expanded ? 0 : undefined,
	}}>{btn}</div>
}

function DateString(props: {
	date: string,
	linkPath?: string
}) {
	if (props.date.length === 0) {
		return <div>Unknown</div>;
	}
	let convertOptions: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};
	const dateStr = props.date==='pinned' ?
		'Pinned' : (new Date(Date.parse(props.date))).toLocaleString('en-US', convertOptions);
	const visualContent = <span className="date">{dateStr}</span>;
	if (props.linkPath) return <Link to={props.linkPath}>{visualContent}</Link>
	else return visualContent;
}

type PostRenderer = (props: {info: PostInfo, content: string, container: React.RefObject<HTMLDivElement>}) => any;

export const TimelinePostRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string,
	container: React.RefObject<HTMLDivElement>
}) {
	const [collapsed, setCollapsed] = useState(props.info.collapsed);

	const postRef = useRef<HTMLDivElement>(null);

	const expandIconText = props.info.categories.length > 0 ? props.info.categories[0] : "x";
	const expandIcon = <div
		className={"expand-post-icon"}
		onClick={e=>{
			setCollapsed(false);
		}}
	>{expandIconText}</div>

	if (collapsed) {
		return expandIcon;
	} else {
		const categoryTags: React.ReactNode[] = props.info.categories.map(c => {
			return <Link key={c} to={"/archive/" + c}><div className={"category-tag"}>{c}</div></Link>;
		});
		return <div className="timeline-post" ref={postRef}>
			<DateString date={props.info.date} linkPath={"/post/" + props.info.path}/>
			<div className="foldable">
				<div className="left-fold-handle" onClick={e=>{
					if (postRef.current !== null && props.container.current !== null) {
						let postTop = postRef.current.offsetTop;
						let visibleTop = props.container.current.scrollTop;
						if (postTop < visibleTop) {
							props.container.current.scrollTo({
								top: postTop - 80,
								behavior: "smooth"
							});
						}
					}
					setCollapsed(true);
				}}/>
				<div className="right-fold-content">
					<Markdown content={props.content}/>
					<div className={"category-tags-container"}>{categoryTags}</div>
				</div>
			</div>
		</div>
	}
}

export const SinglePostRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string,
}) {
	const categoryTags: React.ReactNode[] = props.info.categories.map(c => {
		return <Link key={c} to={"/archive/" + c}><div className={"category-tag"}>{c}</div></Link>;
	});
	return <div
		style={{position: "relative", marginBottom: 40}}
	>
		<DateString date={props.info.date} linkPath={"/post/" + props.info.path}/>
		<Markdown content={props.content}/>
		<div className={"category-tags-container"}>{categoryTags}</div>
	</div>
}

export const PostExcerptRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string,
	container: React.RefObject<HTMLDivElement>
}) {
	let renderContent = "";
	if (props.info.title.length > 0) {
		renderContent += "**" + props.info.title + "** | ";
	}
	renderContent += props.content;
	const linkPath = "/post/" + props.info.path;

	const [collapsed, setCollapsed] = useState(true);
	const postRef = useRef<HTMLDivElement>(null);

	let content = collapsed ?
		<div >
			<DateString date={props.info.date} linkPath={linkPath}/>
			<div style={{cursor: "pointer"}} onClick={()=>{setCollapsed(false)}}>
				<Markdown className={"cssTruncate"} inline content={renderContent}/>
			</div>
		</div> :
		<div>
			<DateString date={props.info.date} linkPath={linkPath}/>
			<div className="foldable">
				<div className="left-fold-handle" onClick={e=>{
					if (postRef.current !== null && props.container.current !== null) {
						let postTop = postRef.current.offsetTop;
						let visibleTop = props.container.current.scrollTop;
						if (postTop < visibleTop) {
							props.container.current.scrollTo({
								top: postTop,
								behavior: "smooth"
							});
						}
					}
					setCollapsed(true);
				}}/>
				<Markdown content={renderContent} className="right-fold-content"/>
			</div>
		</div>;

	return <div ref={postRef} style={{
		 position: "relative",
		 marginBottom: 12,
	}}>
		{content}
	</div>

}

// wrapper to make sure content is properly fetched
export function Post(props: {permalink: string, info?: PostInfo, container:React.RefObject<HTMLDivElement>, renderer: PostRenderer}) {
	const [info, setInfo]: StateType<PostInfo> = useState(props.info ?? {
		date: "",
		title: "",
		path: props.permalink,
		categories: [],
		collapsed: false
	});
	const [content, setContent]: StateType<string> = useState("loading...");
	useEffect(()=>{
		contentManager.asyncGetPost(info.path, (info, content) => {
			setInfo(info);
			setContent(content);
		});
	}, []);
	return props.renderer({
		info: info,
		content: content,
		container: props.container
	});
}

// NOTE: when loading content upwards, it's hard to handle scrollTop without causing layout shift (many times)..
// so for now let's just disable that by ensuring scrollMinIndex === startIndex
export function ContentStream(props: {
	startIndex: number,
	initialCount: number,
	increment: number,
	scrollMinIndex: number,
	scrollMaxIndex: number,
	verticalMargin: number,
	renderFn: (posts: PostInfo[]) => React.ReactNode,
	container: React.RefObject<HTMLDivElement>,
	category?: string,
	style?: CSSProperties
}) {
	console.assert(props.startIndex === props.scrollMinIndex);

	const [startPostIndex, setStartPostIndex] = useState(props.startIndex);
	const [scrollMaxIndex, setScrollMaxIndex] = useState(props.scrollMaxIndex);
	const [fetching, setFetching] = useState(false);

	const initialPosts: PostInfo[] = [];
	const [posts, setPosts]: StateType<PostInfo[]> = useState(initialPosts);

	const asyncGetPosts = function(startIdx: number, count: number) {
		setFetching(true);
		contentManager.asyncGetPostsInfo({
			globalStartIdx: startIdx,
			numPosts: count,
			category: props.category,
			cb: (arr, finished, totalNumPosts)=>{
				 if (finished) {
					 setStartPostIndex(startIdx);
					 setPosts(arr);
					 if (totalNumPosts >= 0) setScrollMaxIndex(i => Math.min(i, totalNumPosts));
					 setFetching(false);
				 }
			}
		});
	};

	// initial range
	useEffect(()=>{
		let numInitialPosts = Math.min(props.scrollMaxIndex - props.startIndex, props.initialCount);
		asyncGetPosts(props.startIndex, numInitialPosts);
	}, []);

	useEffect(()=>{
		if (props.container.current) {
			props.container.current.scrollTop = 0;
		}
		let numInitialPosts = Math.min(props.scrollMaxIndex - props.startIndex, props.initialCount);
		asyncGetPosts(props.startIndex, numInitialPosts);
	}, [props.category]);

	//console.log(`min ${props.scrollMinIndex}, start ${startPostIndex}, max ${scrollMaxIndex}, total ${posts.length}`);

	let style: CSSProperties = {...{
		position: "relative",
		height: "100%",
		overflow: "scroll",
		overscrollBehaviorY: "contain",
	}, ...props.style};

	return <div
		ref={props.container}
		className={"forceScrollable noScrollBar"}
		style={style}
		onWheel={e=>{
			if (fetching) {
				console.log("skip..");
			} else {
				let clientHeight = props.container.current?.clientHeight ?? 0;
				let scrollTop = props.container.current?.scrollTop ?? 0;
				let scrollHeight = props.container.current?.scrollHeight ?? 0;
				if (e.deltaY > 0
					&& scrollTop + clientHeight >= scrollHeight - 5/* arbitrary */ // scroll reached bottom
					&& posts.length < (scrollMaxIndex - startPostIndex) // there are more posts to fetch (after)
				) {
					let numPostsAfter = Math.min(posts.length + props.increment, scrollMaxIndex) - posts.length;
					asyncGetPosts(startPostIndex, posts.length + numPostsAfter);
				}
				else if (e.deltaY < 0
					&& scrollTop === 0
					&& startPostIndex > props.scrollMinIndex
				) {
					let numPostsBefore = startPostIndex - Math.max(props.scrollMinIndex, startPostIndex - props.increment);
					asyncGetPosts(startPostIndex - numPostsBefore, posts.length + numPostsBefore);
				}
			}
		}}
	>
		{props.renderFn(posts)}
	</div>;
}

export function Error404() {
	return <div>blah 404</div>;
}

export function SinglePostPage(props: { permalink: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	if (props.permalink !== undefined) {
		return <div ref={containerRef} style={{
			padding: "20px",
		}}><Post container={containerRef} permalink={props.permalink} renderer={SinglePostRenderer}/></div>
	} else {
		return <Error404/>;
	}
}

function CategoryEntry(props: {
	title: React.ReactNode,
	category: string
}) {
	return <Link to={"/archive/" + props.category}><Clickable content={<div style={{position: "relative"}}>
		<div style={{
		}}>
			{props.title}
		</div>
	</div>}/></Link>
}

function TimelineWithEvents() {
	const [events, setEvents] : StateType<{time: Date, event: string}[]> = useState([] as {time: Date, event: string}[]);
	const streamRef = useRef<HTMLDivElement>(null);
	useEffect(()=>{
		contentManager.asyncGetTimelineEvents((evts: {time: Date, event: string}[]) => {
			setEvents(evts);
		});
	}, []);
	const renderFn = (posts: PostInfo[]) => {
		let evtItr = 0;
		let postItr = 0;
		let result: React.ReactNode[] = [];
		const addPost = (i: number) => {
			result.push(<Post container={streamRef} key={i} info={posts[postItr]} permalink={posts[postItr].path} renderer={PostExcerptRenderer}/>);
			postItr++;
		}
		const addEvt = (i: number) => {
			result.push(<div key={i} className={"event-title-container"}>
				<div className={"event-title-text"}>{events[evtItr].event}</div>
				<div className={"event-title-time"}>{events[evtItr].time.toDateString()}</div>
			</div>);
			evtItr++;
		}
		for (let i = 0; i < posts.length + events.length; i++) {
			if (evtItr === events.length) {
				addPost(i);
			} else if (postItr === posts.length) {
				addEvt(i);
			}
			else {

				const nextEvtTime = events[evtItr].time.getTime();
				const nextPostTime = posts[postItr].date==='pinned' ? Infinity : Date.parse(posts[postItr].date);

				if (nextEvtTime > nextPostTime) {
					addEvt(i);
				} else {
					addPost(i);
				}

			}
		}

		return result;
	};
	return <ContentStream
		category={""}
		startIndex={0}
		initialCount={20}
		increment={10}
		scrollMinIndex={0}
		scrollMaxIndex={Infinity}
		verticalMargin={0}
		container={streamRef}
		renderFn={renderFn}/>
}

export function ArchivePage(props: {category: string}) {

	const initialCategories: CategoryFolderNode = {isFolder: true, name: "", path: "", children: []} as CategoryFolderNode;
	const [categoryTree, setCategoryTree]: StateType<CategoryFolderNode> = useState(initialCategories);

	const streamRef = useRef<HTMLDivElement>(null);

	useEffect(()=>{
		contentManager.asyncGetCategoryTree(tree => {
			setCategoryTree(tree);
		});
	}, []);

	localStorage.setItem("lastRenderedCategory", props.category);

	const constructCategoryTree: (tree: CategoryTree) => React.ReactNode = (tree: CategoryTree) => {
		const children: React.ReactNode = tree.isFolder ? tree.children.map(child => {
			return constructCategoryTree(child);
		}) : undefined;

		if (tree.isFolder) {
			return <Expandable
				key={tree.path + " (folder)"}
				title={"category: " + tree.path}
				titleNode={tree.name}
				content={children}
			/>
		} else {
			return <CategoryEntry
				key={tree.node.categoryPath}
				title={tree.node.categoryName + " (" + tree.node.count + ")"}
				category={tree.node.categoryPath}
			/>;
		}
	};

	const contentColumn = (props.category.length > 0) ? <ContentStream
		category={props.category}
		startIndex={0}
		initialCount={20}
		increment={10}
		scrollMinIndex={0}
		scrollMaxIndex={Infinity}
		verticalMargin={0}
		container={streamRef}
		renderFn={posts => posts.map(p=>
			<Post container={streamRef} key={p.path} info={p} permalink={p.path} renderer={PostExcerptRenderer}/>
		)}/> : <TimelineWithEvents/>

	return <div style={{display: "flex", flexDirection: "row", height: "100%"}}>
		<div style={{flex: 0, flexBasis: Math.min(180, window.innerWidth * 0.2), height: "100%", overflow: "scroll", paddingRight: 10}}>
			<CategoryEntry title={"Timeline (All)"} category={""}/>
			<hr style={{
				height: 1,
				margin: "1.25em 0",
				backgroundColor: "grey"
			}}/>
			{categoryTree.children.map(child => constructCategoryTree(child))}
		</div>
		<div style={{flex: 1, height: "100%", overflow: "scroll"}}>
			{contentColumn}
		</div>
	</div>
}

export function FriendsPage() {
	return <div className={"friends"}>
		<p>也拜访下赛博邻居们吧！</p>
		<p>本人虽为技术从业者，博客却一点都不技术，不知道路过的看官感兴趣哪类，就大致这么分一下：</p>
		<br/>
		<h3>偏技术</h3>
		<p>
			<a className="clickable" href="https://sumygg.com/">SumyBlog</a>
			<a className="clickable" href="https://blog.gadore.top">千里之豪</a>
		</p>
		<br/>
		<h3>偏个人</h3>
		<p>
			<a className="clickable" href="https://mantyke.icu/">小球飞鱼</a>
			<a className="clickable" href="https://nachtzug.xyz/">Nachtzug</a>
			<a className="clickable" href="https://blog.dlzhang.com/">班班的碎碎念</a>
			<a className="clickable" href="https://blog.fivest.one/">fivestone</a>
			<a className="clickable" href="https://mengru.space">mengru</a>
			<a className="clickable" href="https://www.sardinefish.com">SardineFish</a>
			<a className="clickable" href="https://ayu.land/">甜鱼</a>
			<a className="clickable" href="https://nikukikai.art/">肉機械</a>
		</p>
		<br/>
		<h3>一年多没更新了！敲打！</h3>
		<p>
			<a className="clickable" href="https://ablustrund.com/">Ablustrund</a>
		</p>
	</div>
}