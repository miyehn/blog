import React, {ReactNode, CSSProperties} from "react";

type ClickableProps = {
	content?: ReactNode,
	onClickFn?: (e: any) => void,
	style?: CSSProperties
}

export function Clickable(props: ClickableProps) {
	return <div
		className={"clickable"}
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
		let indentDivStyle = this.autoIndent ? {margin: 10, paddingLeft: 6, marginBottom: 20}: {};
		return <div style={{marginTop: 10, marginBottom: 10}}>
			<Clickable content={<span>
				<span>{this.state.show ? '- ' : '+ '}</span>
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