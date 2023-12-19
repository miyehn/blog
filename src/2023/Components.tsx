import React from "react";
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

function PostStream() {
	contentManager.asyncGetPosts(100, 1, (arr, finished)=>{
		console.log(arr);
		if (finished) {
			console.log("done!");
		}
	});
	return <div>(post stream content)</div>;
}

export default function Blog() {
	return <div>
		<Logo/>
		<PostStream/>
	</div>
}