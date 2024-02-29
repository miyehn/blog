import {HashRouter, Route, Switch, Link } from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import React, {CSSProperties, useEffect, useRef} from "react";
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
import {contentManager, PostInfo} from "./ContentManager";

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

	const renderAllPostsFn = (posts: PostInfo[]) => {
		let list: React.ReactNode[] = [];
		let collapsedGroup: React.ReactNode[] = [];
		for (let i = 0; i < posts.length; i++) {
			let p = posts[i];
			let elem = <Post
				container={streamRef}
				key={p.path}
				info={p}
				permalink={p.path}
				renderer={TimelinePostRenderer}/>;
			if (p.collapsed) {
				collapsedGroup.push(elem);
			} else {
				if (collapsedGroup.length > 0) {
					list.push(<div key={'collapsedGroup-' + i} className="timeline-collapsed-group">{collapsedGroup}</div>)
					collapsedGroup = [];
				}
				list.push(elem)
			}
		}
		return list;
	}

	const streamRef = useRef<HTMLDivElement>(null);
	return <div style={{
		position: "relative",
		height: "100%",
	}}>
		 <ContentStream
			 startIndex={0}
			 verticalMargin={20}
			 initialCount={contentManager.blogInfo.initialNumPosts}
			 increment={contentManager.blogInfo.postsPerPage}
			 scrollMinIndex={0}
			 scrollMaxIndex={Infinity}
			 style={{ marginLeft: 60 }}
			 container={streamRef}
			 renderFn={renderAllPostsFn}
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
