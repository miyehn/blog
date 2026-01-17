import {HashRouter, Routes, Route, Link, useParams} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import React, {type CSSProperties, useEffect, useRef} from "react";
import {
	AboutPage,
	ArchivePage,
	ArrowButton,
	Error404,
	FriendsPage,
	ContentStream,
	SinglePostPage,
	Post, TimelinePostRenderer,
} from "./Components";
import './style/tabs.css';
import {contentManager, type PostInfo} from "./ContentManager";
import {BackgroundProps, getContentLeft, getContentWidth, BackgroundCanvas} from "./background.tsx";
import {useElementSize, useWindowSize} from "./Utils.tsx";

function DirectoryTabs(props: {
	pageName: string,
	category?: string
}) {
	const pageNames = [
		"about",
		"archive",
		"friends",
		//"gallery"
	];
	const currentIndex = Math.max(0, pageNames.indexOf(props.pageName));
	return <Tabs
		className="tabs-outerContainer"
		selectedIndex={currentIndex}
		selectedTabClassName="tabs-selectedButton"
		selectedTabPanelClassName="tabs-selectedPanel"
		onSelect={(idx, lastIdx, e)=>{
			localStorage.setItem("directoryPageName", pageNames[idx]);
		}}>
		<TabPanel>
			<AboutPage/>
		</TabPanel>
		<TabPanel>
			<ArchivePage category={props.category ?? ""}/>
		</TabPanel>
		<TabPanel>
			<FriendsPage/>
		</TabPanel>
		<TabList className="tabs-listContainer">
			<Tab className="tabs-button"><Link to={"/about"}>关于</Link></Tab>
			<Tab className="tabs-button"><Link to={"/archive"}>归档</Link></Tab>
			<Tab className="tabs-button"><Link to={"/friends"}>友情链接</Link></Tab>
		</TabList>
	</Tabs>
}

function Directory(props: {
	pageName: PageName,
	category?: string
}) {
	const expanded = props.pageName !== "feed";
	return <div style={{
		height: expanded ? "100%" : 0,
	}}>
		{expanded ? <DirectoryTabs pageName={props.pageName} category={props.category}/> : undefined}
		<ArrowButton expanded={expanded}/>
	</div>
}

type MatchType = "page" | "category" | "wildcard";

export const renderAllPostsFn = (posts: PostInfo[], streamRef: React.RefObject<HTMLDivElement | null>) => {
	let list: React.ReactNode[] = [];
	for (let i = 0; i < posts.length; i++) {
		let p = posts[i];
		let elem = <Post
			container={streamRef}
			key={p.path}
			info={p}
			permalink={p.path}
			renderer={TimelinePostRenderer}/>;
		list.push(elem);
	}
	return list;
}

type PageName = "archive" | "about" | "friends" | "feed";

function MainFeedPage() {
	const streamRef = useRef<HTMLDivElement>(null);
	return <div style={{
		position: "relative",
		width: getContentWidth() + 220,
		left: getContentLeft() - 220,
		height: window.innerHeight,
	}}>
		<ContentStream
			 startIndex={0}
			 verticalMargin={20}
			 initialCount={contentManager.blogInfo.initialNumPosts}
			 increment={contentManager.blogInfo.postsPerPage}
			 scrollMinIndex={0}
			 scrollMaxIndex={Infinity}
			 style={{ marginLeft: BackgroundProps.gridSize + 6 }}
			 container={streamRef}
			 renderFn={(posts: PostInfo[]) => renderAllPostsFn(posts, streamRef)}
			 prefix={<div style={{height: 20}}/>}
		 />
		<Directory pageName={"feed"}/>
	</div>
}

function DirectoryPage(props: {
	matchType: MatchType,
}) {
	const params = useParams();
	let pageName: PageName;
	if (props.matchType === "category") {
		pageName = "archive";
	} else if (params.page === "about" || params.page === "friends" || params.page === "archive") {
		pageName = params.page;
	} else {
		pageName = "feed";
	}

	return <div style={{
		position: "relative",
		width: getContentWidth(),
		left: getContentLeft(),
		height: "100%",
	}}>
		<Directory pageName={pageName} category={params.category}/>
	</div>
}

export function BlogMain() {
	useEffect(() => {
		document.title = contentManager.blogInfo.title;
	}, []);
	const [windowWidth, windowHeight] = useWindowSize();
	return <div style={{
		position: "relative",
		width: windowWidth,
		height: windowHeight
	}}>
		<BackgroundCanvas width={windowWidth} height={windowHeight}/>
		<HashRouter>
			<Routes>
				<Route path={"/archive/:category"} element={<DirectoryPage matchType={"category"}/>}/>
				<Route path={"/:page"} element={<DirectoryPage matchType={"page"}/>}/>
				<Route path={"/post/:permalink"} element={<SinglePostPage type={"desktop"}/>}/>
				<Route path={"/"} element={<MainFeedPage/>}/>
			</Routes>
		</HashRouter>
	</div>
}
