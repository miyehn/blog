import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {contentManager, PostInfo} from "./ContentManager";

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

function Post(props: {info: PostInfo}) {
	return <div>{props.info.date}</div>
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
	const [posts, setPosts]: [PostInfo[], React.Dispatch<React.SetStateAction<PostInfo[]>>] = useState(initialPosts);

	const ref = useRef<HTMLDivElement | null>(null);

	const asyncGetPosts = function(startIdx: number, count: number) {
		setFetching(true);
		contentManager.asyncGetPosts(startIdx, count, (arr, finished, totalNumPosts)=>{
			if (finished) {
				setStartPostIndex(startIdx);
				setPosts(arr);
				if (totalNumPosts >= 0) setScrollMaxIndex(i => Math.min(i, totalNumPosts));
				setFetching(false);
			}
		});
	}

	useEffect(()=>{
		asyncGetPosts(props.startIndex, 10);
	}, []);

	//console.log(`min ${props.scrollMinIndex}, start ${startPostIndex}, max ${scrollMaxIndex}, total ${posts.length}`);

	let style: CSSProperties = {
		position: "relative",
		width: "100%",
		height: "100%",
		overflow: "scroll",
		overscrollBehavior: "contain",
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
					asyncGetPosts(startPostIndex, posts.length + 20);
				}
				else if (e.deltaY < 0
					&& scrollTop === 0
					&& startPostIndex > props.scrollMinIndex
				) {
					let postsBefore = startPostIndex - Math.max(props.scrollMinIndex, startPostIndex - 20);
					asyncGetPosts(startPostIndex - postsBefore, posts.length + postsBefore);
				}
			}
		}}
	>
		{posts.map(p => <Post key={p.path} info={p}/>)}
	</div>;
}

export default function Blog() {
	return <div tabIndex={0} style={{
		width: "100%",
		height: "100%",
		outline: "1px solid red",
	}}>
		<PostStream startIndex={302} scrollMinIndex={280} scrollMaxIndex={Infinity}/>
	</div>
}