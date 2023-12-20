import React, {CSSProperties, useEffect, useRef, useState} from "react";
import { ProjectionCalculator2d } from "projection-3d-2d";
import { vec3, quat, mat4, ReadonlyQuat, ReadonlyVec3 } from "gl-matrix";
import '../common/style/style.css';
import './layout.css';
import BlogMain from "./BlogMain";
import {projectorController} from "./ProjectorController";

//const red = "rgba(255, 0, 0, 1)";
//const green = "rgba(0, 255, 0, 1)";
//const blue = "rgba(0, 0, 255, 1)";

type ProjectionParams = {
	cameraOffsetX: number,
	cameraOffsetY: number,
	cameraOffsetZ: number,
	rotateX: number,
	rotateY: number
};

export let setProjectionParams = (params: ProjectionParams) => {};

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

export default function Projector() {

	const containerRef = useRef<HTMLDivElement | null>(null);

	const [rotateX, setRotateX] = useState(0);
	const [rotateY, setRotateY] = useState(0);
	const [cameraOffsetX, setCameraOffsetX] = useState(0);
	const [cameraOffsetY, setCameraOffsetY] = useState(0);
	const [cameraOffsetZ, setCameraOffsetZ] = useState(0);

	const getProjectionInfo = function(width: number, height: number) {

		// view dir rotation
		let yRot = quat.create();
		quat.setAxisAngle(yRot, vec3.fromValues(0, 1, 0), rotateY);
		let xRot = quat.create();
		quat.setAxisAngle(xRot, vec3.fromValues(1, 0, 0), rotateX);

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

	// initialization
	useEffect(()=>{
		setProjectionParams = (params: ProjectionParams) => {
			setRotateX(params.rotateX);
			setRotateY(params.rotateY);
			setCameraOffsetX(params.cameraOffsetX);
			setCameraOffsetY(params.cameraOffsetY);
			setCameraOffsetZ(params.cameraOffsetZ);
		};
	}, []);

	let outerSideLength = Math.min(window.innerWidth, window.innerHeight) * 0.9 - 80;
	const aspectRatio = 1.25;
	const zDist = outerSideLength / 2;
	const scaleRatio = zDist / (zDist + cameraOffsetZ);
	let width = outerSideLength;
	let height = outerSideLength / aspectRatio;

	let outerBoxStyle: CSSProperties = {
		position: "relative",
		left: -cameraOffsetX,
		top: cameraOffsetY,
		width: width,
		height: height,
		margin: "0 auto",
		marginTop: (window.innerHeight - height) / 2,
		transform: `scale(${scaleRatio})`,
		//border: "1px solid red",
		overflow: "visible"
	};

	let projectionInfo = getProjectionInfo(width, height);
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
		opacity: Math.pow(opacity, fallOff),
		width: width,
		height: height,
		transform: projectionMatrix
	};
	return <div
		ref={containerRef}
		style={{
			width: "100%",
			height: window.innerHeight - 20,
			margin: 0,
			padding: 0,
			outline: "none",
			overflow: "hidden"
		}}
		tabIndex={0}
		onKeyDown={e => {
			if (e.target === containerRef.current) {
				projectorController.onKeyDown(e.key);
				if (projectorController.isCapturedKey(e.key)) e.preventDefault();
			}
		}}
		onKeyUp={e => {
			if (e.target === containerRef.current) {
				projectorController.onKeyUp(e.key);
				if (projectorController.isCapturedKey(e.key)) e.preventDefault();
			}
		}}
	>
		<div style={outerBoxStyle}>
			<div style={innerBoxStyle}>
				<BlogMain/>
			</div>
		</div>
	</div>

}
