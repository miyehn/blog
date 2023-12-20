import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {CategoryInfo, contentManager, PostInfo} from "./ContentManager";
import {Link, useNavigate} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import {TiSocialInstagram as Ins} from "react-icons/ti";
import {FaTumblrSquare as Tumblr, FaTwitterSquare as Twitter, FaWeibo as Weibo} from "react-icons/fa";
import {GrGithub as Github} from "react-icons/gr";
import {IoMdMail as Mail} from "react-icons/io";
import {Clickable, Expandable} from "./Utils";
import {useParams} from "react-router";

type StateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function Logo() {
	return  <img style={{
		display: "block",
		position: "relative",
		margin: "auto",
		marginTop: 20,
		height: 72,
	}} src={require("../avatar.png")} alt={"avatar"}/>
}

function Markdown(props: {content: string, includeImage: boolean, inline?: boolean}) {
	const className = props.inline ? "markdown inline" : "markdown";
	if (props.includeImage) {
		return <ReactMarkdown
			className={className}
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			//@ts-expect-error
			rehypePlugins={[rehypeRaw]}
		>{props.content}</ReactMarkdown>
	} else {
		return <ReactMarkdown
			className={className}
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			//@ts-expect-error
			rehypePlugins={[rehypeRaw]}
			children={props.content}
			components={{
				img({...props}) {
					return <span> [img] </span>
				}
			}}
		/>
	}
}

// using raw <a> tags here so that hovering over these elements show the url
function Social() {
	let mailto = "mailto" + contentManager.blogInfo.email;
	let handles = contentManager.blogInfo.socialHandles.filter(s=>{
		return s.url.trim().length > 0
	});

	let toIcon = function(s: string) {
		if (s==="instagram") {
			return <Ins id="instagram" className="socialIcon clickable" size={26} />
		} else if (s==="weibo") {
			return <Weibo className="socialIcon clickable" size={22} />
		} else if (s==="tumblr") {
			return <Tumblr className="socialIcon clickable" size={22} />
		} else if (s==="github") {
			return <Github className="socialIcon clickable" size={22} />
		} else if (s==="twitter") {
			return <Twitter className="socialIcon clickable" size={22} />
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

			<a className="clickable" href={mailto}>
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
	return <Markdown includeImage content={content}/>;
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
	let str = localStorage.getItem("directoryPageName");
	if (str === null) str = "about";

	const navigate = useNavigate();
	const style: CSSProperties = {
		position: "relative",
		width: 30,
		height: 30,
		left: -15,
		textAlign: "center",
		margin: "auto",
		cursor: "pointer"
	};

	const btn = <Clickable style={style} onClickFn={e=>{
		navigate(props.expanded ? "/" : "/" + str);
	}} content={props.expanded ? "<<" : ">>"}/>

	return <div style={{
		position: "absolute",
		top: 20,
		left: props.expanded ? "95%" : 30,
	}}>{btn}</div>
}

function DateString(props: {
	date: string,
	linkPath: string
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
	let dateStr = props.date==='pinned' ?
		'Pinned' : (new Date(Date.parse(props.date))).toLocaleString('en-US', convertOptions);
	return(<Link to={props.linkPath}><span className="date">{dateStr}</span></Link>)
}

type PostRenderer = (props: {info: PostInfo, content: string}) => any;

export const TimelinePostRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string
}) {
	return <div style={{marginBottom: 20}}>
		<DateString date={props.info.date} linkPath={"/post/" + props.info.path}/>
		<Markdown includeImage content={props.content}/>
	</div>
}

export const PostExcerptRenderer: PostRenderer = function(props: {
	info: PostInfo,
	content: string
}) {
	let renderContent = "";
	if (props.info.title.length > 0) {
		renderContent += "**" + props.info.title + "** | ";
	}
	renderContent += props.content;
	return <div className={"cssTruncate"} style={{
		marginBottom: 20,
	}}>
		<DateString date={props.info.date} linkPath={"/post/" + props.info.path}/>
		<Markdown inline includeImage={false} content={renderContent}/>
	</div>
}

export function Post(props: {permalink: string, info?: PostInfo, renderer: PostRenderer}) {
	const [info, setInfo]: StateType<PostInfo> = useState(props.info ?? {
		date: "",
		title: "",
		path: props.permalink,
		tags: []
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
		content: content
	});
}

// todo: more carefully control scrollTop
export function ContentStream(props: {
	startIndex: number,
	initialCount: number,
	increment: number,
	scrollMinIndex: number,
	scrollMaxIndex: number,
	verticalMargin: number,
	renderFn: (p: PostInfo) => React.ReactNode,
	category?: string,
}) {
	const [startPostIndex, setStartPostIndex] = useState(props.startIndex);
	const [scrollMaxIndex, setScrollMaxIndex] = useState(props.scrollMaxIndex);
	const [fetching, setFetching] = useState(false);

	const initialPosts: PostInfo[] = [];
	const [posts, setPosts]: StateType<PostInfo[]> = useState(initialPosts);

	const ref = useRef<HTMLDivElement | null>(null);

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
		let numInitialPosts = Math.min(props.scrollMaxIndex - props.startIndex, props.initialCount);
		asyncGetPosts(props.startIndex, numInitialPosts);
	}, [props.category]);

	//console.log(`min ${props.scrollMinIndex}, start ${startPostIndex}, max ${scrollMaxIndex}, total ${posts.length}`);

	let style: CSSProperties = {
		position: "relative",
		height: "100%",
		overflow: "scroll",
		overscrollBehaviorY: "contain",
	};

	return <div
		ref={ref}
		className={"forceScrollable noScrollBar"}
		style={style}
		onWheel={e=>{
			if (fetching) {
				console.log("skip.."); // this could happen when there's slow network
			} else {
				let clientHeight = ref?.current?.clientHeight ?? 0;
				let scrollTop = ref?.current?.scrollTop ?? 0;
				let scrollHeight = ref?.current?.scrollHeight ?? 0;
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
		<div style={{height: props.verticalMargin}}/>
		{posts.map(props.renderFn)}
		<div style={{height: props.verticalMargin}}/>
	</div>;
}

export function Error404() {
	return <div>blah 404</div>;
}

export function SinglePostPage() {
	const {permalink} = useParams();
	if (permalink !== undefined) {
		return <Post permalink={permalink} renderer={TimelinePostRenderer}/>
	} else {
		return <Error404/>;
	}
}

function CategoryEntry(props: {
	title: React.ReactNode,
	category: string
}) {
	return <Link to={"/archive/" + props.category}><Clickable content={<div style={{position: "relative"}}>
		<span style={{position: "absolute", top: 0, left: 0}}>{">"}</span>
		<div style={{
			marginLeft: 20
		}}>
			{props.title}
		</div>
	</div>}/></Link>
}

export function ArchivePage() {

	const initialCategories: CategoryInfo[] = [];
	const [categoriesList, setCategoriesList]: StateType<CategoryInfo[]> = useState(initialCategories);

	useEffect(()=>{
		contentManager.asyncGetCategoriesInfo(list => {
			setCategoriesList(list);
		});
	}, []);

	const {category} = useParams();

	return <div style={{display: "flex", flexDirection: "row", height: "100%"}}>
		<div style={{flex: 1, height: "100%", overflow: "scroll", paddingRight: 10}}>
			<CategoryEntry title={"Timeline"} category={""}/>
			<Expandable title={"Tag (legacy)"} content={<div>{
				categoriesList.map(c => {
					const title = c.count > 1 ? (c.category + " (" + c.count.toString() + ")") : c.category;
					return <CategoryEntry key={c.category} title={title} category={"tag-" + c.category}/>
				})
			}</div>}/>
			<CategoryEntry title={"example category 1 name also pretty long into multiple lines"} category={""}/>
			<CategoryEntry title={"example category 2 with a long name"} category={""}/>
		</div>
		<div style={{flex: 2, height: "100%", overflow: "scroll"}}>
			<ContentStream
				category={category}
				startIndex={0}
				initialCount={10}
				increment={10}
				scrollMinIndex={0}
				scrollMaxIndex={50}
				verticalMargin={0}
				renderFn={p => <Post key={p.path} info={p} permalink={p.path} renderer={PostExcerptRenderer}/>}/>
		</div>
	</div>
}

export function FriendsPage() {
	return <div className={"friends"}>
		<p>也拜访下赛博邻居们吧：</p>
		<a className="clickable" href="https://sumygg.com/">SumyBlog</a>
		<a className="clickable" href="https://mantyke.icu/">小球飞鱼</a>
		<a className="clickable" href="https://nachtzug.xyz/">Nachtzug</a>
		<a className="clickable" href="https://blog.dlzhang.com/">班班的碎碎念</a>
		<a className="clickable" href="http://blog.fivest.one/">fivestone</a>
		<a className="clickable" href="https://mengru.space">mengru</a>
		<a className="clickable" href="https://www.sardinefish.com">SardineFish</a>
		<a className="clickable" href="https://ablustrund.com/">Ablustrund</a>
		<a className="clickable" href="https://ayu.land/">甜鱼</a>
	</div>
}