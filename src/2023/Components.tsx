import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {contentManager, PostInfo} from "./ContentManager";
import {Link, useMatch, useNavigate} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {TiSocialInstagram as Ins} from "react-icons/ti";
import {FaTumblrSquare as Tumblr, FaTwitterSquare as Twitter, FaWeibo as Weibo} from "react-icons/fa";
import {GrGithub as Github} from "react-icons/gr";
import {IoMdMail as Mail} from "react-icons/io";
import {Clickable, Expandable} from "./Utils";

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

function Markdown(props: {content: string}) {
	return <ReactMarkdown className="markdown" remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>{props.content}</ReactMarkdown>
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
		navigate(props.expanded ? "/" : "/page/" + str);
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

function Post(props: {permalink: string, info?: PostInfo}) {
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
	return <div style={{marginBottom: 20}}>
		<DateString date={info.date} linkPath={"/post/" + info.path}/>
		<Markdown content={content}/>
	</div>
}

export function PostStream(props: {
	startIndex: number,
	scrollMinIndex: number,
	scrollMaxIndex: number,
}) {
	const [startPostIndex, setStartPostIndex] = useState(props.startIndex);
	const [scrollMaxIndex, setScrollMaxIndex] = useState(props.scrollMaxIndex);
	const [fetching, setFetching] = useState(false);

	const initialPosts: PostInfo[] = [];
	const [posts, setPosts]: StateType<PostInfo[]> = useState(initialPosts);

	const ref = useRef<HTMLDivElement | null>(null);

	const asyncGetPosts = function(startIdx: number, count: number) {
		setFetching(true);
		contentManager.asyncGetPostsInfo(startIdx, count, (arr, finished, totalNumPosts)=>{
			if (finished) {
				setStartPostIndex(startIdx);
				setPosts(arr);
				if (totalNumPosts >= 0) setScrollMaxIndex(i => Math.min(i, totalNumPosts));
				setFetching(false);
			}
		});
	};

	const postsPerPage = contentManager.blogInfo.postsPerPage;

	// initial range
	useEffect(()=>{
		let numInitialPosts = Math.min(props.scrollMaxIndex - props.startIndex, postsPerPage);
		asyncGetPosts(props.startIndex, numInitialPosts);
	}, []);

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
					let numPostsAfter = Math.min(posts.length + postsPerPage, scrollMaxIndex) - posts.length;
					asyncGetPosts(startPostIndex, posts.length + numPostsAfter);
				}
				else if (e.deltaY < 0
					&& scrollTop === 0
					&& startPostIndex > props.scrollMinIndex
				) {
					let numPostsBefore = startPostIndex - Math.max(props.scrollMinIndex, startPostIndex - postsPerPage);
					asyncGetPosts(startPostIndex - numPostsBefore, posts.length + numPostsBefore);
				}
			}
		}}
	>
		<div style={{height: 20}}/>
		{posts.map(p => <Post key={p.path} info={p} permalink={p.path}/>)}
		<div style={{height: 20}}/>
	</div>;
}

export function Error404() {
	return <div>blah 404</div>;
}

export function SinglePostPage() {
	const match = useMatch("post/:permalink");
	if (match?.params?.permalink !== undefined) {
		return <Post permalink={match.params.permalink}/>
	} else {
		return <Error404/>;
	}
}

export function ArchivePage() {
	return <div>
		<Clickable content={"Timeline"}/>
		<Expandable title={"Tag"} content={
			<div>
				<Clickable content={"example tag 1"}/>
				<Clickable content={"example tag 2"}/>
			</div>
		}/>
	</div>
}

export function FriendsPage() {
	return <div className={"friends"}>
		<p>也拜访下俺的赛博邻居们吧：</p>
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