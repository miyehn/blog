import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import React, {useEffect} from "react";
import {
	AboutPage,
	ArchivePage,
	ArrowButton,
	Error404,
	FriendsPage,
	ContentStream,
	SinglePostPage,
	Post, TimelinePostRenderer, PostExcerptRenderer
} from "./Components";
import './tabs.css';
import {contentManager} from "./ContentManager";
import {useParams} from "react-router";

function DirectoryTabs(props: {
	pageName: string
}) {
	const pageNames = [
		"about",
		"archive",
		"friends",
		//"gallery"
	];
	const currentIndex = Math.max(0, pageNames.indexOf(props.pageName));
	const navigate = useNavigate();
	return <Tabs
		className="tabs-outerContainer"
		selectedIndex={currentIndex}
		selectedTabClassName="tabs-selectedButton"
		selectedTabPanelClassName="tabs-selectedPanel"
		onSelect={(idx, lastIdx, e)=>{
			localStorage.setItem("directoryPageName", pageNames[idx]);
			navigate("/" + pageNames[idx]);
		}}>
		<TabPanel>
			<AboutPage/>
		</TabPanel>
		<TabPanel>
			<ArchivePage/>
		</TabPanel>
		<TabPanel>
			<FriendsPage/>
		</TabPanel>
		<TabList className="tabs-listContainer">
			<Tab className="tabs-button">About</Tab>
			<Tab className="tabs-button">Archive</Tab>
			<Tab className="tabs-button">Friends</Tab>
		</TabList>
	</Tabs>
}

function Directory(props: {
	pageName: string
}) {
	const expanded = props.pageName.length > 0;
	return <div style={{
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		height: expanded ? "100%" : 0,
	}}>
		{expanded ? <DirectoryTabs pageName={props.pageName}/> : undefined}
		<ArrowButton expanded={expanded}/>
	</div>
}

type MatchType = "page" | "category" | "wildcard";

function MainContentPage(props: {
	matchType: MatchType
}) {
	let pageName;
	if (props.matchType === "category") {
		pageName = "archive";
	} else {
		const {page} = useParams();
		pageName = page ?? "";
	}

	return <div style={{
		position: "relative",
		height: "100%",
	}}>
		 <ContentStream
			 startIndex={0}
			 verticalMargin={20}
			 initialCount={contentManager.blogInfo.postsPerPage}
			 increment={contentManager.blogInfo.postsPerPage}
			 scrollMinIndex={0}
			 scrollMaxIndex={40}
			 style={{ marginLeft: 60 }}
			 renderFn={posts => posts.map(p =>
				 <Post key={p.path} info={p} permalink={p.path} renderer={TimelinePostRenderer}/>
			 )}
		 />
		<Directory pageName={pageName}/>
	</div>
}

export default function BlogMain() {
	useEffect(()=>{
		document.title = contentManager.blogInfo.title;
	}, []);
	return <div tabIndex={0} style={{
		width: "100%",
		height: "100%",
		borderTop: "1px solid lightgrey",
		borderBottom: "1px solid lightgrey",
		overflow: "scroll"
	}}>
		<BrowserRouter>
			<Routes>
				<Route path={"/archive/:category"} element={<MainContentPage matchType={"category"}/>}/>
				<Route path={"/post/:permalink"} element={<SinglePostPage/>}/>
				<Route path={"/:page"} element={<MainContentPage matchType={"page"}/>}/>
				<Route path={"/"} element={<MainContentPage matchType={"wildcard"}/>}/>
			</Routes>
		</BrowserRouter>
	</div>
}
