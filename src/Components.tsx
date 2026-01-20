import React, {type CSSProperties, type RefObject, useEffect, useRef, useState} from "react";
import {
	type CategoryNode,
	contentManager,
	type PostInfo
} from "./ContentManager";
import {Link, useParams} from "react-router-dom";
import {Expandable, Markdown, P5Canvas, useElementSize} from "./Utils"

import {TiSocialInstagram as Ins} from "react-icons/ti";
import {FaTumblrSquare as Tumblr, FaTwitterSquare as Twitter, FaWeibo as Weibo} from "react-icons/fa";
import {GrGithub as Github} from "react-icons/gr";
import {IoMdMail as Mail} from "react-icons/io";
import {Clickable} from "./Utils";
import logo from "./assets/logo.png";
import squareFilled from "./assets/square_filled.svg";
import squareEmpty from "./assets/square_empty.svg";
import arrowRight from "./assets/arrow_right.svg";
import arrowLeft from "./assets/arrow_left.svg";
import {BackgroundProps, getContentLeft, getContentWidth} from "./background.tsx";
import {useBlogContext} from "./main.tsx";
import {FaTags} from "react-icons/fa6";
import {p5_ExcerptCollapseHandle} from "./ExcerptCollapseHandle.tsx";

type StateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export function Logo() {
	return  <img id={"logo"} style={{
		display: "block",
		position: "relative",
		margin: "auto",
		marginTop: 20,
		height: 72,
	}} src={logo} alt={"avatar"}/>
}

// using raw <a> tags here so that hovering over these elements show the url
export function Social() {
	const mailto = "mailto" + contentManager.blogInfo.email;
	const handles = contentManager.blogInfo.socialHandles.filter(s=>{
		return s.url.trim().length > 0
	});

	const toIcon = function(s: string) {
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
			marginBottom: useBlogContext().isMobile ? 30 : 50,
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

export function AboutContent() {
	const [content, setContent] = useState("loading..");
	useEffect(()=>{
		contentManager.asyncGetAbout(newContent=>{setContent(newContent);});
	}, []);
	return <Markdown content={content}/>;
}

export function AboutPage() {
	return <div className="noScrollBar" style={{
		height: "100%",
		overflowY: "scroll",
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
		textAlign: "center",
		margin: "auto",
		cursor: "pointer"
	};

	const arrowSrc = props.expanded ? arrowLeft : arrowRight;

	const btn = <Link to={linkPath}><Clickable style={style} content={<img src={arrowSrc} alt={"arrow"}/>}/></Link>

	return <div style={{
		position: "absolute",
		top: 18,
		left: props.expanded ? undefined : 80,
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
	const visualContent = <span className={"date" + (props.linkPath ? " hoverHighlight" : "")} style={{marginRight: "1em"}}>{dateStr}</span>;
	if (props.linkPath) return <Link to={props.linkPath}>{visualContent}</Link>
	else return visualContent;
}

function InlineTitle(props: {
	title: string,
	onClick: () => void
}) {
	return <span onClick={props.onClick} style={{
		fontFamily: "myCabin",
		fontSize: 14,
		marginRight: 15,
		color: "#737373",
		cursor: "pointer"
	}}>{props.title}</span>
}

function InlineCategories(props: {
	categories: string[],
}) {
	const isMobile = useBlogContext().isMobile;
	return <span style={{
		fontFamily: "myCabin",
		fontSize: 14,
	}}>
		{props.categories.length > 0 ? <FaTags style={{
			marginRight: "0.25em",
			position: "relative",
			top: 2,
			color: "#737373"
		}}/> : undefined}
		{props.categories.map((c, index) => {
			const tag = <span className={isMobile ? "date" : "hoverHighlight date"}>
				{c}
				{index===props.categories.length - 1 ? undefined : ", "}
			</span>
			if (isMobile) {
				return <span key={c + "-mobile"}>{tag}</span>;
			} else {
				return <Link key={c} to={"/archive/" + c}>{tag}</Link>;
			}
		})}
	</span>;
}

type PostRenderer = (props: {info: PostInfo, content: string, container: React.RefObject<HTMLDivElement | null>}) => React.JSX.Element;

function LeftFoldToggle(props: {
	filled: boolean,
	horizontalLine: boolean,
	onClick: () => void;
}) {
	const topOffset = 6;
	const leftOffset = 6;
	return <div className="left-fold-handle" onClick={e => {
		props.onClick();
	}}>
		<img style={{
			position: "relative",
			top: topOffset,
			left: leftOffset,
		}} src={props.filled ? squareFilled : squareEmpty} alt={"square"}></img>
		{
			false && <div style={{
				position: "absolute",
				top: topOffset + 14,
				height: "calc(100% - 12px)",
				width: leftOffset + 8.5,
				//outline: "1px solid yellow",
				borderRight: "1px dashed #fff",
			}}/>
		}
		{
			props.horizontalLine && <>
				<div style={{
					position: "absolute",
					top: topOffset + 8,
					left: leftOffset + 15,
					width: 96 - 18 - leftOffset,
					borderTop: "1px dashed #737373",
				}}/>
				<div style={{
				position: "absolute",
				top: topOffset + 8,
				left: leftOffset - 118,
				width: 120,
				borderTop: "1px dashed #fff",
			}}/></>
		}
	</div>
}

export const TimelinePostRenderer: PostRenderer = function (props: {
	info: PostInfo,
	content: string,
	container: React.RefObject<HTMLDivElement | null>
}) {
	const [collapsed, setCollapsed] = useState(props.info.collapsed);
	const mobile = useBlogContext().isMobile;

	const postRef = useRef<HTMLDivElement>(null);

	if (collapsed && !mobile) {
		return <div className={"foldable"} style={{
			position: "relative",
			minHeight: 32,
			marginLeft: 140
		}}>
			<LeftFoldToggle
				filled={true}
				horizontalLine={props.info.title.length > 0 || props.info.categories.length > 0}
				onClick={()=>setCollapsed(false)}/>
			<div className="right-fold-content">
				{props.info.title.length > 0 && <InlineTitle onClick={()=>setCollapsed(false)} title={props.info.title}/>}
				<InlineCategories categories={props.info.categories}/>
			</div>
		</div>;
	} else {
		return <div className="foldable" ref={postRef} style={{
			position: "relative",
			minHeight: 32,
			marginLeft: mobile ? 0 : 140
		}}>
			{!mobile && <LeftFoldToggle filled={false} horizontalLine={true} onClick={()=>{
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
			}}/>}
			<div className="right-fold-content" style={{paddingBottom: 40}}>
				<DateString date={props.info.date} linkPath={"/post/" + props.info.path}/>
				<InlineCategories categories={props.info.categories}/>
				{props.info.title.length ? <h1 className="post-title" style={{
					margin: "5px 0 15px 0",
				}}>{props.info.title}</h1> : undefined}
				<Markdown content={props.content}/>
			</div>
		</div>
	}
}

export const SinglePostRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string,
}) {
	return <div
		style={{position: "relative", marginBottom: 40}}
	>
		<DateString date={props.info.date}/>
		<InlineCategories categories={props.info.categories}/>
		{props.info.title.length ? <h1 className="post-title" style={{
			margin: "5px 0 15px 0"
		}}>{props.info.title}</h1> : undefined}
		<Markdown content={props.content}/>
	</div>
}

function ExpandedPostExcerpt(props: {
	setCollapsed: (b: boolean) => void,
	postRef: RefObject<HTMLDivElement | null>,
	container: RefObject<HTMLDivElement | null>,
	renderContent: string
}) {
	const [containerRef, size] = useElementSize<HTMLDivElement>();

	return <div ref={containerRef} className="foldable" style={{
		position: "relative",
	}}>
		<div style={{
			flex: 0,
			cursor: "pointer",
			flexBasis: 18,
		}} onClick={e=>{
			if (props.postRef.current !== null && props.container.current !== null) {
				let postTop = props.postRef.current.offsetTop;
				let visibleTop = props.container.current.scrollTop;
				if (postTop < visibleTop) {
					props.container.current.scrollTo({
						top: postTop,
						behavior: "smooth"
					});
				}
			}
			props.setCollapsed(true);
		}}/>
		<P5Canvas style={{
			position: "absolute",
			top: 0,
			left: 0,
			zIndex: -99,
			pointerEvents: "none"
		}} width={8} height={size.height} trueDpr={true} p5setup={p5_ExcerptCollapseHandle}/>
		<Markdown content={props.renderContent} className="right-fold-content"/>
	</div>
}

export const PostExcerptRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string,
	container: React.RefObject<HTMLDivElement | null>
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
		<div>
			<div style={{
				lineHeight: "0.96em",
			}}>
				<DateString date={props.info.date} linkPath={linkPath}/>
				<InlineCategories categories={props.info.categories}/>
			</div>
			<div style={{cursor: "pointer"}} onClick={()=>{setCollapsed(false)}}>
				<Markdown className={"cssTruncate"} inline content={renderContent}/>
			</div>
		</div> :
		<div>
			<div style={{
				lineHeight: "0.96em",
			}}>
				<DateString date={props.info.date} linkPath={linkPath}/>
				<InlineCategories categories={props.info.categories}/>
			</div>
			<ExpandedPostExcerpt
				setCollapsed={setCollapsed}
				postRef={postRef}
				container={props.container}
				renderContent={renderContent}/>
		</div>;

	return <div ref={postRef} style={{
		 position: "relative",
		 marginBottom: 12,
	}}>
		{content}
	</div>

}

// wrapper to make sure content is properly fetched
export function Post(props: {permalink: string, info?: PostInfo, container:React.RefObject<HTMLDivElement | null>, renderer: PostRenderer}) {
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
	container: React.RefObject<HTMLDivElement | null>,
	category?: string,
	style?: CSSProperties,
	prefix?: React.ReactNode
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

	//console.log(props.container.current);
	//console.log(`min ${props.scrollMinIndex}, startPostIndex ${startPostIndex}, scrollMaxIndex ${scrollMaxIndex}, total ${posts.length}`);

	let style: CSSProperties = {...{
		position: "relative",
		height: "100%",
		overflow: "scroll",
		overscrollBehaviorY: "contain",
	}, ...props.style};

	return <div
		ref={props.container}
		className={"noScrollBar"}
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
					//console.log(`get more: clientHeight=${clientHeight} scrollTop=${scrollTop} scrollHeight=${scrollHeight}`);
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
		{props.prefix}
		<div>
			{props.renderFn(posts)}
		</div>
	</div>;
}

export function Error404() {
	return <div>blah 404</div>;
}

export function SinglePostPage(props: {
	type: "desktop" | "mobile"
}) {
	const params = useParams();
	const containerRef = useRef<HTMLDivElement>(null);
	if (containerRef && params.permalink !== undefined) {
		const style: CSSProperties = {
			padding: "20px",
		};
		if (props.type === "desktop") {
			style.position = "relative";
			style.width = getContentWidth();
			style.left = getContentLeft();
			style.paddingLeft = 86;
			style.paddingRight = 0;
			style.boxSizing = "border-box";
		}
		return <div ref={containerRef} style={style}><Post container={containerRef} permalink={params.permalink} renderer={SinglePostRenderer}/></div>
	} else {
		return <Error404/>;
	}
}

function CategoryEntry(props: {
	style?: CSSProperties
	title: React.ReactNode,
	category: string,
}) {
	return <div style={props.style}><Link to={"/archive/" + props.category}>
		{props.title}
	</Link></div>
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

	const initialCategories: CategoryNode = {name: "", path: "", count: 0, children: []} as CategoryNode;
	const [categoryTree, setCategoryTree]: StateType<CategoryNode> = useState(initialCategories);

	const streamRef = useRef<HTMLDivElement>(null);

	useEffect(()=>{
		contentManager.asyncGetCategoryTree(tree => {
			setCategoryTree(tree);
		});
	}, []);

	localStorage.setItem("lastRenderedCategory", props.category);

	const constructCategoryTree: (tree: CategoryNode) => React.ReactNode = (tree: CategoryNode) => {
		const hasChildren = tree.children.length > 0;
		const children: React.ReactNode = hasChildren ? tree.children
		.map(child => {
			return constructCategoryTree(child);
		}) : undefined;

		const isCurrentCategory = tree.path === props.category;
		const categoryEntryStyle: CSSProperties = {
			fontWeight: isCurrentCategory ? "bold" : "normal",
		};

		if (hasChildren) {
			categoryEntryStyle.display = "inline-block";
			return <Expandable
				key={tree.path + " (folder)"}
				title={"category: " + tree.path}
				titleNode={<CategoryEntry
					style={categoryEntryStyle}
					title={tree.name + " [" + tree.count + "]"}
					category={tree.path}
					/>}
				content={children}
			/>
		} else {
			return <CategoryEntry
				key={tree.path}
				style={categoryEntryStyle}
				title={tree.name + " [" + tree.count + "]"}
				category={tree.path}
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
			<CategoryEntry title={"全部"} category={""} style={{
				fontWeight: props.category === "" ? "bold" : "normal",
			}} />
			<hr className={"directory-hr"}/>
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
			<a className="clickable hoverHighlight" href="https://sumygg.com/">SumyBlog</a>
			<a className="clickable hoverHighlight" href="https://blog.gadore.top">千里之豪</a>
		</p>
		<br/>
		<h3>偏个人</h3>
		<p>
			<a className="clickable hoverHighlight" href="https://handsomemango.vercel.app/">芒果！（的文）</a>
			<a className="clickable hoverHighlight" href="https://mantyke.icu/">小球飞鱼</a>
			<a className="clickable hoverHighlight" href="https://nachtzug.xyz/">Nachtzug</a>
			<a className="clickable hoverHighlight" href="https://blog.dlzhang.com/">班班的碎碎念</a>
			<a className="clickable hoverHighlight" href="https://blog.fivest.one/">fivestone</a>
			<a className="clickable hoverHighlight" href="https://mengru.space">mengru</a>
			<a className="clickable hoverHighlight" href="https://www.sardinefish.com">SardineFish</a>
			<a className="clickable hoverHighlight" href="https://ayu.land/">甜鱼</a>
			<a className="clickable hoverHighlight" href="https://nikukikai.art/">肉機械</a>
			<a className="clickable hoverHighlight" href="https://tianxianzi.me/">天仙子</a>
			<a className="clickable hoverHighlight" href="https://varraro.github.io">Lenger的后花园</a>
		</p>
		<br/>
		<h3>怎么死链了！敲打！</h3>
		<p>
			<a className="clickable hoverHighlight" href="https://ablustrund.com/">Ablustrund</a>
		</p>
	</div>
}