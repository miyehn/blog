import React from 'react';
//import ReactDOM from 'react-dom';
//import {HashRouter} from "react-router-dom";
import {vec3, mat4, quat} from 'gl-matrix';

//const red = "rgba(255, 0, 0, 1)";
//const green = "rgba(0, 255, 0, 1)";
//const blue = "rgba(0, 0, 255, 1)";

function Logo() {
	return <div style={{
		position: "absolute",
		top: "50%",
	}}> <img style={{
			position: "relative",
			top: -50,
			left: -100,
			height: 100,
		}} src={require("../avatar.png")} alt={"avatar"}/>
	</div>
}

function Intro() {
	return <div style={{
		position: "absolute",
		border: "1px solid green",
		width: 300,
		height: 150,
		left: -220,
		top: 100
	}}>
		sup
	</div>
}

function toRadians(n) {
	return n * Math.PI / 180;
}
function toDegrees(n) {
	return n * 180 / Math.PI;
}
function normalized(v) {
	let len = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
	return {
		x: v.x / len,
		y: v.y / len,
		z: v.z / len
	};
}

export default class Main extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			rotateX: 0,
			rotateY: 0
		};
	}

	render() {

		let outerSideLength = Math.min(window.innerWidth, window.innerHeight) - 200;
		let aspectRatio = 1.5;
		let width = outerSideLength;
		let height = outerSideLength / aspectRatio;

		let vFov = toRadians(40);
		let hFov = Math.atan(Math.tan(vFov) * aspectRatio);
		//console.log("fov: " + vFov + ", " + hFov);

		//let tr = quat.create();
		//quat.fromEuler(tr, toDegrees(vFov), toDegrees(hFov), 0);

		//let viewDir = normalized({x: 0.3, y: 0.3, z: 1});
		//console.log(viewDir);

		let viewDirRot = quat.create();
		quat.setAxisAngle(viewDirRot, vec3.fromValues(0, 1, 0), toRadians(-2));
		let vCenter = vec3.create();
		vec3.transformQuat(vCenter, vec3.fromValues(0, 0, -1), viewDirRot);
		//console.log(vCenter);

		let vBottomRight = vec3.fromValues(1, -1, -1);
		//vec3.normalize(vTopRight, vec3.clone(vTopRight));
		vec3.transformQuat(vBottomRight, vec3.clone(vBottomRight), viewDirRot);
		//console.log(vBottomRight);

		let br = {
			x: -vBottomRight[0] / vBottomRight[2],
			y: -vBottomRight[1] / vBottomRight[2]
		};
		//console.log(br);

		let vTopLeft = vec3.fromValues(-1, 1, -1);
		vec3.transformQuat(vTopLeft, vec3.clone(vTopLeft), viewDirRot);
		let tl = {
			x: -vTopLeft[0] / vTopLeft[2],
			y: -vTopLeft[1] / vTopLeft[2]
		};
		//console.log(tl);

		/*
		let viewDir0 = vec3.fromValues(viewDir.x, viewDir.y, viewDir.z);
		// top right
		let viewDirTR = vec3.create();
		vec3.rotateY(viewDirTR, viewDir0, vec3.fromValues(0, 0, 0), -hFov);
		vec3.rotateX(viewDirTR, vec3.clone(viewDirTR), vec3.fromValues(0, 0, 0), vFov);
		//console.log(viewDirTR);
		 */


		let containerWidth = 1100;
		let zDist = 1000;
		let shiftXPx = Math.tan(this.state.rotateY) * zDist;
		let shiftYPx = Math.tan(this.state.rotateX) * zDist;
		let outerBoxStyle = {
			position: "relative",
			width: containerWidth,
			//transform: `matrix(${br.x}, ${br.y}, ${tl.x}, ${tl.y}, 0, 0)`
			marginTop: (window.innerHeight - outerSideLength) / 2,
			perspective: zDist,
			perspectiveOrigin: `${50 + shiftXPx / containerWidth * 100}%`,
			//borderColor: green
			border: "1px solid red"
		};
		let wallStyle = {
			perspective: zDist,
		};
		let rotateYBoxStyle = {
			left: -shiftXPx,
			transform: `rotateY(${this.state.rotateY}rad)`,
			perspective: zDist,
			position: "relative",
			pointerEvents: "none"
		};
		let rotateXBoxStyle = {
			top: shiftYPx,
			transform: `rotateX(${this.state.rotateX}rad)`,
			position: "relative",
			margin: "0 auto",
			border: "1px solid",
			backgroundImage: "linear-gradient(45deg, hsl(0deg 0% 0%) 0%, hsl(0deg 0% 100%) 100%)",
			width: width,
			height: height,
		}
		return (
			<div style={outerBoxStyle}>
				<span>x: </span>
				<input type={"range"} width={200} min={-Math.PI * 25} max={Math.PI * 25} onChange={e=>{
					this.setState({rotateX: e.target.value * 0.01});
				}}/>
				<span>y: </span>
				<input type={"range"} width={200} min={-Math.PI * 25} max={Math.PI * 25} onChange={e=>{
					this.setState({rotateY: e.target.value * 0.01});
				}}/>
				<div style={wallStyle}>
					<div style={rotateYBoxStyle}>
						<div style={rotateXBoxStyle}></div>
					</div>
				</div>
			</div>
		)
	}
}
