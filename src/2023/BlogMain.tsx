import {createBrowserRouter, Link, RouterProvider, useMatch, useNavigate} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import React from "react";
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

function DirectoryTabs(props: {
	pageName: string
}) {
	const pageNames = [
		"about",
		"archive",
		"friends",
		"gallery"
	];
	const currentIndex = Math.max(0, pageNames.indexOf(props.pageName));
	const navigate = useNavigate();
	return <Tabs
		className="tabs-outerContainer"
		selectedIndex={currentIndex}
		selectedTabClassName="tabs-selectedTab"
		selectedTabPanelClassName="tabs-selectedPanel"
		onSelect={(idx, lastIdx, e)=>{
			localStorage.setItem("directoryPageName", pageNames[idx]);
			navigate("/page/" + pageNames[idx]);
		}}>
		<TabList className="tabs-listContainer">
			<Tab className="tabs-button">about</Tab>
			<Tab className="tabs-button">archive</Tab>
			<Tab className="tabs-button">friends</Tab>
			<Tab className="tabs-button">gallery</Tab>
		</TabList>
		<TabPanel>
			<AboutPage/>
		</TabPanel>
		<TabPanel>
			<ArchivePage/>
		</TabPanel>
		<TabPanel>
			<FriendsPage/>
		</TabPanel>
		<TabPanel>
			gallery
		</TabPanel>
	</Tabs>
}

function Directory(props: {
	pageName: string
}) {
	const expanded = props.pageName.length > 0;
	const navigate = useNavigate();
	let directoryContent = <div style={{
		height: "100%",
		display: "flex",
		flexDirection: "row",
	}}>
		<div style={{
			position: "relative",
			flex: 5,
			height: "100%",
			background: "rgba(255, 255, 255, 0.98)",
			paddingLeft: 60,
		}}>
			{expanded ? <DirectoryTabs pageName={props.pageName}/> : undefined}
			<ArrowButton expanded={expanded}/>
		</div>
		<div style={{flex: 1}} onClick={()=>{
			navigate("/");
		}}/>
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
		<ContentStream
			startIndex={0}
			initialCount={contentManager.blogInfo.postsPerPage}
			increment={contentManager.blogInfo.postsPerPage}
			scrollMinIndex={0}
			scrollMaxIndex={40}
			renderFn={p => <Post key={p.path} info={p} permalink={p.path} renderer={TimelinePostRenderer}/>}
		/>
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

export default function BlogMain() {
	return <div tabIndex={0} style={{
		width: "100%",
		height: "100%",
		borderTop: "1px solid lightgrey",
		borderBottom: "1px solid lightgrey",
	}}>
		<RouterProvider router={router}/>
	</div>
}
