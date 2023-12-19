import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {contentManager, PostInfo} from "./ContentManager";
import {createBrowserRouter, RouterProvider, Link, useMatches, useMatch} from "react-router-dom";
import Markdown from "react-markdown";

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

type StateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

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
	return(
		<div>
			<Link to={props.linkPath}>
				{dateStr}
			</Link>
		</div>
	)}

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
		width: "100%",
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
		{posts.map(p => <Post key={p.path} info={p} permalink={p.path}/>)}
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

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <Error404/>,
		children:[
			{
				path: '',
				element: <PostStream startIndex={1} scrollMinIndex={0} scrollMaxIndex={40}/>
			},
			{
				path: 'post/:permalink',
				element: <SinglePostPage/>
			}
		]
	}
]);

export default function Blog() {
	return <div tabIndex={0} style={{
		width: "100%",
		height: "100%",
		outline: "1px solid red",
	}}>
		<RouterProvider router={router}/>
	</div>
}