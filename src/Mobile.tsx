import React, {useEffect, useRef} from "react";
import {AboutContent, ContentStream, FriendsPageContent, Logo, SinglePostPage, Social} from "./Components";
import {Expandable, useWindowSize} from "./Utils";
import {contentManager, type PostInfo} from "./ContentManager";
import {renderAllPostsFn, CmdHandler} from "./BlogMain";
import {HashRouter, Routes, Route} from "react-router-dom";

import "./style/style.css"
import "./style/layout.css"
import "./style/tabs.css"

function MobileBlogContent() {
	const streamRef = useRef<HTMLDivElement>(null);
	const [width, height] = useWindowSize();
	const headerContent = <div style={{marginTop: 60, marginBottom: 30}}>
		<Logo/>
		<Social/>
		<div style={{marginBottom: 10}}>
			此站在移动端只有最基础的阅览功能，部分设计只在足够大的屏幕上呈现，建议用电脑打开。
		</div>
		<Expandable title={"关于此地"} content={
			<div style={{marginTop: 10, marginBottom: 20}}>
				<AboutContent/>
			</div>
		}/>
		<Expandable title={"友情链接"} content={
			<div style={{marginTop: 10, marginBottom: 20}}>
				<FriendsPageContent/>
			</div>
		}/>
	</div>
	return <div style={{
		position: "relative",
		height: height,
		padding: "0 20px"
	}}>
		<ContentStream
			startIndex={0}
			verticalMargin={20}
			initialCount={contentManager.blogInfo.initialNumPosts}
			increment={contentManager.blogInfo.postsPerPage}
			scrollMinIndex={0}
			scrollMaxIndex={Infinity}
			renderFn={(posts: PostInfo[]) => renderAllPostsFn(posts, streamRef)}
			container={streamRef}
			prefix={headerContent}
		/>
	</div>
}

export default function MobileBlogMain() {
	useEffect(() => {
		document.title = contentManager.blogInfo.title;
	}, []);
	return <HashRouter>
		<Routes>
			<Route path={"/cmd/:word"} element={<CmdHandler/>}/>
			<Route path={"/"} element={<MobileBlogContent/>}/>
			<Route path={"/post/:permalink"} element={<SinglePostPage type={"mobile"}/>}/>
		</Routes>
	</HashRouter>
}