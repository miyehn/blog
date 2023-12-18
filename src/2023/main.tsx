import React, {CSSProperties} from "react";
import {controller} from "./controller";
import { ProjectionCalculator2d } from "projection-3d-2d";
import { vec3, quat, mat4, ReadonlyQuat, ReadonlyVec3 } from "gl-matrix";

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

type ProjectionParams = {
	cameraOffsetX: number,
	cameraOffsetY: number,
	cameraOffsetZ: number,
	rotateX: number,
	rotateY: number
};

export let setProjectionParams = (params: ProjectionParams) => {};

function radians(n: number) {
	return n * Math.PI / 180;
}

function degrees(n: number) {
	return n * 180 / Math.PI;
}

type FourPoints = [[number, number], [number, number], [number, number], [number, number]];

function rotate(v: vec3, o: ReadonlyVec3, q: ReadonlyQuat) {
	vec3.subtract(v, vec3.clone(v), o);
	vec3.transformQuat(v, vec3.clone(v), q);
	vec3.add(v, vec3.clone(v), o);
}

function perspectiveDivide(vi: ReadonlyVec3, o: ReadonlyVec3): [number, number] {
	// translate to position relative to origin
	let v = vec3.clone(vi)
	vec3.subtract(v, vec3.clone(v), o);
	// perspective divide
	v[0] *= -o[2] / v[2];
	v[1] *= -o[2] / v[2];
	// translate back
	vec3.add(v, vec3.clone(v), o);
	return [v[0], v[1]];
}

const distToProjector = 500;

export default class Main extends React.Component {

	state: {
		cameraOffsetX: number,
		cameraOffsetY: number,
		cameraOffsetZ: number,
		rotateX: number,
		rotateY: number
	};

	constructor(props: {}) {
		super(props);
		this.state = {
			cameraOffsetX: 0,
			cameraOffsetY: 0,
			cameraOffsetZ: 0,
			rotateX: 0,
			rotateY: 0,
		};
		setProjectionParams = ((params: ProjectionParams) => {
			this.setState(params);
		}).bind(this);
	}

	getProjectionInfo(width: number, height: number) {

		// view dir rotation
		let yRot = quat.create();
		quat.setAxisAngle(yRot, vec3.fromValues(0, 1, 0), this.state.rotateY);
		let xRot = quat.create();
		quat.setAxisAngle(xRot, vec3.fromValues(1, 0, 0), this.state.rotateX);

		let viewDirRot = quat.create();
		quat.multiply(viewDirRot, xRot, yRot);

		let origin = vec3.fromValues(0, 0, -distToProjector);

		// rotated points
		let bl = vec3.fromValues(-width/2, -height/2, 0);
		rotate(bl, origin, viewDirRot);
		let br = vec3.fromValues(width/2, -height/2, 0);
		rotate(br, origin, viewDirRot);
		let tl = vec3.fromValues(-width/2, height/2, 0);
		rotate(tl, origin, viewDirRot);
		let tr = vec3.fromValues(width/2, height/2, 0);
		rotate(tr, origin, viewDirRot);

		let originalPoints: FourPoints = [
			[-width/2, -height/2],
			[width/2, -height/2],
			[-width/2, height/2],
			[width/2, height/2]
		];
		let projectedPoints: FourPoints = [
			perspectiveDivide(bl, origin),
			perspectiveDivide(br, origin),
			perspectiveDivide(tl, origin),
			perspectiveDivide(tr, origin)
		];

		let projectionCalculator2d = new ProjectionCalculator2d(projectedPoints, originalPoints);
		let midPt = projectionCalculator2d.getProjectedPoint([0, 0]);
		return {
			matrix: projectionCalculator2d.resultMatrix,
			meanDistance: vec3.len(vec3.fromValues(midPt[0], midPt[1], -distToProjector))
		};
	}

	render() {
		let outerSideLength = Math.min(window.innerWidth, window.innerHeight) * 0.9 - 80;
		const aspectRatio = 1.25;
		const zDist = outerSideLength / 2;
		const scaleRatio = zDist / (zDist + this.state.cameraOffsetZ);
		let width = outerSideLength;
		let height = outerSideLength / aspectRatio;

		let outerBoxStyle: CSSProperties = {
			position: "relative",
			left: -this.state.cameraOffsetX,
			top: this.state.cameraOffsetY,
			width: width,
			height: height,
			margin: "0 auto",
			marginTop: (window.innerHeight - height) / 2,
			transform: `scale(${scaleRatio})`,
			//border: "1px solid red",
			overflow: "visible"
		};

		let projectionInfo = this.getProjectionInfo(width, height);
		let m = projectionInfo.matrix;
		let projectionMatrix = `matrix3d(
			${m.get(0, 0)}, ${m.get(1, 0)}, ${0}, ${m.get(2, 0)},
			${m.get(0, 1)}, ${m.get(1, 1)}, ${0}, ${m.get(2, 1)},
			${0}, ${0}, ${1}, ${0},
			${m.get(0, 2)}, ${m.get(1, 2)}, ${0}, ${m.get(2, 2)}	
		)`;

		let opacity = (distToProjector) / projectionInfo.meanDistance;
		const fallOff = 4;
		let innerBoxStyle: CSSProperties = {
			background: "rgba(220, 220, 220, 1)",
			opacity: Math.pow(opacity, fallOff),
			width: width,
			height: height,
			transform: projectionMatrix
		};

		return (
			<div
				style={{width: "100%", height: window.innerHeight - 20, margin: 0, padding: 0, outline: "none", overflow: "hidden"}}
				tabIndex={0}
				onKeyDown={e=>{
					controller.onKeyDown(e.key);
				}}
				onKeyUp={e=>{
					controller.onKeyUp(e.key);
				}}
			>
				<div style={outerBoxStyle}>
					<div style={innerBoxStyle}></div>
				</div>
			</div>
		)
	}
}
