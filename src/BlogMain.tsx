import {HashRouter, Route, Switch, Link } from "react-router-dom";
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
	Post, TimelinePostRenderer,
} from "./Components";
import './style/tabs.css';
import {contentManager} from "./ContentManager";

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
			<Tab className="tabs-button"><Link to={"/about"}>About</Link></Tab>
			<Tab className="tabs-button"><Link to={"/archive"}>Archive</Link></Tab>
			<Tab className="tabs-button"><Link to={"/friends"}>Friends</Link></Tab>
		</TabList>
	</Tabs>
}

function Directory(props: {
	pageName: string,
	category?: string
}) {
	const expanded = props.pageName.length > 0;
	return <div style={{
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		height: expanded ? "100%" : 0,
	}}>
		{expanded ? <DirectoryTabs pageName={props.pageName} category={props.category}/> : undefined}
		<ArrowButton expanded={expanded}/>
	</div>
}

type MatchType = "page" | "category" | "wildcard";

function MainContentPage(props: {
	matchType: MatchType,
	page?: string,
	category?: string
}) {
	let pageName;
	if (props.matchType === "category") {
		pageName = "archive";
	} else {
		pageName = props.page ?? "";
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
		<Directory pageName={pageName} category={props.category}/>
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
		<HashRouter hashType={"noslash"}>
			<Switch>
				<Route exact path={"/archive/:category"} render={({match})=><MainContentPage matchType={"category"} category={match.params.category}/>}/>
				<Route exact path={"/post/:permalink"} render={({match})=><SinglePostPage permalink={match.params.permalink}/>}/>
				<Route exact path={"/:page"} render={({match})=><MainContentPage matchType={"page"} page={match.params.page}/>}/>
				<Route exact path={"/"} render={()=><MainContentPage matchType={"wildcard"}/>}/>
			</Switch>
		</HashRouter>
	</div>
}
