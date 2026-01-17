import React, {type ReactNode, type CSSProperties, useState, useLayoutEffect, useId, useRef, useEffect} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import P5 from "p5";
import {RxTriangleRight, RxTriangleDown} from "react-icons/rx";

type ClickableProps = {
	content?: ReactNode,
	onClickFn?: (e: any) => void,
	style?: CSSProperties,
	noHoverHighlight?: boolean
};

// from: https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react
// eslint-disable-next-line react-refresh/only-export-components
export function useWindowSize() {
	const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
	useLayoutEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);
	return size;
}

export function Clickable(props: ClickableProps) {
	return <div
		className={props.noHoverHighlight ? "clickable" : "clickable hoverHighlight"}
		onClick={props.onClickFn}
		style={props.style}
	>{props.content}</div>
}
type ExpandableProps = {
	title: string,
	autoIndent?: boolean,
	titleNode?: ReactNode,
	defaultShow?: boolean,
	content?: ReactNode,
	onExpand?: () => void,
	onCollapse?: () => void
}
type ExpandableState = {
	show: boolean,
}
export class Expandable extends React.Component {
	props: ExpandableProps = { title: "(expand me)" };
	state: ExpandableState = { show: false };
	autoIndent: boolean = true;
	onClick: () => void;
	constructor(inProps: ExpandableProps) {
		super(inProps);
		this.props = inProps;
		if (inProps.autoIndent === false) this.autoIndent = false;
		this.onClick = (()=>{
			let newShow = !this.state.show
			this.setState({show: newShow});
			if (this.props.onExpand && newShow) this.props.onExpand();
			if (this.props.onCollapse && !newShow) this.props.onCollapse();
			localStorage.setItem("exp: " + inProps.title, (newShow ? 1 : 0).toString());
		}).bind(this);

		let expanded = localStorage.getItem("exp: " + inProps.title);
		let show: boolean = inProps.defaultShow ?? false;
		if (expanded !== null) {
			show = parseInt(expanded) === 1;
		}
		this.state = {
			show: show
		};
	}
	render() {
		const indentSize = "1em";
		let indentDivStyle = this.autoIndent ? {paddingLeft: indentSize}: {};
		return <div style={{}}>
			{/* title */}
			{(this.props.titleNode ? this.props.titleNode : this.props.title)}

			{/* clickable triangle */}
			<Clickable style={{display: "inline-block"}} content={
				<div style={{
					display: "inline-block",
					width: 24,
					position: "relative",
					top: 3,
					textAlign: "right",
					color: "#ff0000"
					//outline: "1px solid red"
				}}>{this.state.show ?
					<RxTriangleDown/> : <RxTriangleRight/>
				}</div>
			} onClickFn={this.onClick}/>

			{/* expanded children (might be hidden) */}
			<div style={{position: "relative", display: this.state.show ? "block" : "none"}}>
				<div style={indentDivStyle}>
					{this.props.content}
				</div>
			</div>
		</div>
	}
}

export function Markdown(props: {content: string, inline?: boolean, className?: string}) {
	const className = props.className ? "markdown " + props.className : "markdown";
	if (!props.inline) {
		return <div className={className}><ReactMarkdown
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			rehypePlugins={[rehypeRaw]}
		>{props.content}</ReactMarkdown></div>
	} else {
		return <div className={className}><ReactMarkdown
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			rehypePlugins={[rehypeRaw]}
			children={props.content}
			components={{
				img({...props}) {
					return <span>[img]</span>
				},
				p({...props}) {
					return <span{...props}/>
				},
				a({...props}) {
					return <span{...props}/>
				},
				ul({...props}) {
					return <span{...props}/>
				},
				ol({...props}) {
					return <span{...props}/>
				},
				li({...props}) {
					return <span{...props}/>
				},
				blockquote({children, ...otherProps}) {
					return <span{...otherProps}>{children}</span>
				},
				hr({...props}) {
					return <span> | </span>
				},
				br({...props}) {
					return <span> </span>
				},
				h1({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
				h2({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
				h3({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
				h4({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
				h5({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
				h6({children, ...otherProps}) {
					return <b{...otherProps}>{children}</b>
				},
			}}
		/></div>
	}
}

export function P5Canvas(props: {
	style?: CSSProperties,
	width: number,
	height: number,
	trueDpr: boolean,
	p5setup: (p5: P5) => void,
}) {
	const id = useId();

	const divRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const dpr = props.trueDpr ? window.devicePixelRatio : 1;

	const sketch = (p5: P5) => {
		p5.setup = () => {
			p5.createCanvas(props.width, props.height, canvasRef.current ?? undefined);
			p5.pixelDensity(dpr);
			props.p5setup(p5);
		}
	};

	useEffect(() => {
		new P5(sketch, divRef.current ?? undefined);
	}, [props.width, props.height]);

	return <div ref={divRef} style={props.style} id={id}>
		<canvas ref={canvasRef} width={props.width} height={props.height}></canvas>
	</div>
}

///////////////////////// CHATGPT //////////////////////////////

type Size = { width: number; height: number };
export function useElementSize<T extends HTMLElement>() {
	const ref = useRef<T | null>(null);
	const [size, setSize] = useState<Size>({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const update = () => {
			const rect = el.getBoundingClientRect();
			setSize({
				width: Math.max(0, Math.round(rect.width)),
				height: Math.max(0, Math.round(rect.height)),
			});
		};

		update(); // initial

		const ro = new ResizeObserver(() => update());
		ro.observe(el);

		return () => ro.disconnect();
	}, []);

	return [ref, size] as const;
}