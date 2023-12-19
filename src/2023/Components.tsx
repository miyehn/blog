import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {contentManager, PostInfo} from "./ContentManager";
import {createBrowserRouter, RouterProvider, Link, useMatches, useMatch} from "react-router-dom";
import Markdown from "react-markdown";

type StateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function Logo() {
	return <div style={{
		position: "absolute",
		top: "50%",
	}}> <img style={{
		position: "relative",
		top: -50,
		left: -100,
		height: 100,
	}} src={require("../avatar.png").default} alt={"avatar"}/>
	</div>
}

function ArrowButton(props: {
	expanded: boolean
}) {
	let str = localStorage.getItem("directoryPage");
	if (str === null) str = "about";

	return <div style={{
		position: "absolute",
		top: 20,
		right: 10,
		width: 30,
		height: 30,
		cursor: "pointer"
	}} onClick={e=>{
		localStorage.setItem("directoryExpanded", props.expanded ? "0" : "1");
	}}><Link to={
		props.expanded ? "/" : "/page/" + str.toString()
	}><div style={{textAlign: "center", margin: "auto"}}>{
		props.expanded ? "<<" : ">>"
	}</div></Link></div>
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
		<Markdown className="markdown" skipHtml={true}>{content}</Markdown>
	</div>
}

function PostStream(props: {
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
		className={"forceScrollable"}
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

function Error404() {
	return <div>blah 404</div>;
}

function SinglePostPage() {
	const match = useMatch("post/:permalink");
	if (match?.params?.permalink !== undefined) {
		return <Post permalink={match.params.permalink}/>
	} else {
		return <Error404/>;
	}
}

function AboutPage() {
	return <div style={{
		border: "1px solid red"
	}}>
		(about page)
	</div>
}

function Directory(props: {
	pageName: string
}) {
	let expanded = false;
	let str = localStorage.getItem("directoryExpanded");
	if (str !== null) {
		expanded = parseInt(str) > 0;
	}
	if (props.pageName.length === 0) {
		expanded = false;
	}

	let pageContent = undefined;

	if (expanded) {
		if (props.pageName === "about") {
			pageContent = <AboutPage/>
		} else {
			pageContent = <Error404/>
		}
	}

	let directoryContent = <div style={{
		height: "100%",
		display: "flex",
		flexDirection: "row",
	}}>
		<div style={{
			position: "relative",
			flex: 9,
			height: "100%",
			background: "rgba(255, 255, 255, 0.95)",
			paddingLeft: 60,
			paddingRight: expanded? 60 : 0,
			outline: "1px solid green"
		}}>
			{pageContent}
			<ArrowButton expanded={expanded}/>
		</div>
		<div style={{flex: 1}}/>
	</div>

	return <div style={{
		position: "absolute",
		left: 0,
		top: 0,
		width: expanded ? "100%" : 0,
		height: expanded ? "100%" : 0,
	}}>
		{directoryContent}
	</div>
}

function MainContentPage() {
	const match = useMatch("page/:page");
	const pageName = match?.params?.page ?? "";
	return <div style={{
		position: "relative",
		height: "100%",
		paddingLeft: 60,
		paddingRight: 20,
	}}>
		<PostStream startIndex={1} scrollMinIndex={0} scrollMaxIndex={40}/>
		<Directory pageName={pageName}/>
	</div>
}

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <Error404/>,
		children:[
			{
				path: "",
				element: <MainContentPage/>
			},
			{
				path: "post/:permalink",
				element: <SinglePostPage/>
			},
			{
				path: "page/:page",
				element: <MainContentPage/>
			}
		]
	}
]);

export default function Blog() {
	return <div tabIndex={0} style={{
		width: "100%",
		height: "100%",
		outline: "1px solid lightgrey",
	}}>
		<RouterProvider router={router}/>
	</div>
}