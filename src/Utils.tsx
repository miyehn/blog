import React, {ReactNode, CSSProperties} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type ClickableProps = {
	content?: ReactNode,
	onClickFn?: (e: any) => void,
	style?: CSSProperties,
	noHoverHighlight?: boolean
};

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
		let indentDivStyle = this.autoIndent ? {paddingLeft: 20}: {};
		return <div style={{}}>
			<Clickable content={<span>
				<span style={{display: "inline-block", width: 20}}>{this.state.show ? '- ' : '+ '}</span>
				{(this.props.titleNode ? this.props.titleNode : this.props.title)}
			</span>} onClickFn={this.onClick}/>
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
		return <ReactMarkdown
			className={className}
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			//@ts-expect-error
			rehypePlugins={[rehypeRaw]}
		>{props.content}</ReactMarkdown>
	} else {
		return <ReactMarkdown
			className={className}
			remarkPlugins={[
				[remarkGfm, {singleTilde: false}],
			]}
			//@ts-expect-error
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
				ul({ordered, ...props}) {
					return <span{...props}/>
				},
				ol({ordered, ...props}) {
					return <span{...props}/>
				},
				li({ordered, ...props}) {
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
		/>
	}
}
