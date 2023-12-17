import React, {CSSProperties} from 'react';
import {controller} from "./controller";

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

	render() {

		let outerSideLength = Math.min(window.innerWidth, window.innerHeight) * 0.9 - 80;
		const aspectRatio = 1;
		const zDist = outerSideLength / 2;//500;
		const scaleRatio = zDist / (zDist + this.state.cameraOffsetZ);
		let width = outerSideLength;
		let height = outerSideLength / aspectRatio;

		let shiftXPx = Math.tan(this.state.rotateY) * zDist;
		let shiftYPx = Math.tan(this.state.rotateX) * zDist;
		let outerBoxStyle: CSSProperties = {
			position: "relative",
			left: -this.state.cameraOffsetX,
			top: this.state.cameraOffsetY,
			width: width,
			height: height,
			margin: "0 auto",
			marginTop: (window.innerHeight - height) / 2,
			perspective: zDist,
			transform: `scale(${scaleRatio})`,
			//border: "1px solid red",
			overflow: "visible"
		};
		let rotateYBoxStyle: CSSProperties = {
			left: -shiftXPx,
			transform: `rotateY(${this.state.rotateY}rad)`,
			perspective: zDist,
			position: "relative",
			pointerEvents: "none"
		};
		let rotateXBoxStyle: CSSProperties = {
			top: shiftYPx,
			transform: `rotateX(${this.state.rotateX}rad)`,
			position: "relative",
			border: "1px solid",
			backgroundImage: "linear-gradient(45deg, hsl(0deg 0% 0%) 0%, hsl(0deg 0% 100%) 100%)",
			width: width,
			height: height,
		}
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
					<div style={rotateYBoxStyle}>
						<div style={rotateXBoxStyle}></div>
					</div>
				</div>
			</div>
		)
	}
}
