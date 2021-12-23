import React, { Component } from 'react';
import { /*Redirect,*/ Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import jQuery from 'jquery';
import ReactMarkDown from 'react-markdown';
import './style/style.css';
import { Intro, Friends, PostsPerPage, email, socialHandles, title} from '../config.js';

import {FaTumblrSquare as Tumblr} from 'react-icons/fa';
import {FaWeibo as Weibo} from 'react-icons/fa';
import {TiSocialInstagram as Ins} from 'react-icons/ti';
import {FaTwitterSquare as Twitter} from 'react-icons/fa';
import {IoMdMail as Mail} from 'react-icons/io';
import {GoMarkGithub as Github} from "react-icons/go";

var fetchCache = new Map();
function asyncFetch(url, callback, errorCallback)
{
	if (fetchCache.has(url))
	{
		callback(fetchCache.get(url));
		return;
	}
	jQuery.ajax({
		type: 'GET',
		url: url,
		success: (data)=>{
			callback(data);
			fetchCache.set(url, data);
		},
		error: errorCallback,
		async: true
	});
}

let chunkSize = 100;
var magicword = '';

var Lofter = require('./assets/lofter.png');
var domainName = process.env.REACT_APP_DOMAIN;

document.title = title;

export default class Main extends Component {
	render() {return(
		<HashRouter hashType="noslash" onUpdate={() => window.scrollTo(0, 0)}>
			<div>
				<div className="content-all container-fluid">
					<SideColumn />
					<MainColumn />
				</div>
				<Footer />
			</div>
		</HashRouter>
	)}
}

class MainColumn extends Component {
	render() {
		return (
		<div className="mainColumn"><Switch>
			{/* Home page */}
			<Route exact path="/" component={()=><PostsManager tag={undefined} page={0} />} />
			{/* single post */}
			<Route exact path="/post/:permalink" render={({match})=>
				<SinglePost permalink={match.params.permalink} />} />
			{/* page num */}
			<Route exact path="/page/:num" render={({match})=>
				<PostsManager tag={undefined} page={match.params.num} />} />
			{/* tag (with page num) */}
			<Route exact path="/tag/:tag/page/:num" render={({match})=>
				<PostsManager tag={match.params.tag} page={match.params.num} />} />
			{/* tag */}
			<Route exact path="/tag/:tag" render={({match})=>
				<PostsManager tag={match.params.tag} page={0} />} />
			}
		</Switch></div>
	)}
}

class SinglePost extends Component {

	constructor(props) {
		super(props);
		this.state = {
			found: false,
			postObject: {
				date: "unknown",
				path: props.permalink,
				tags: [],
				content: "loading...",
			}
		};
	}

	componentDidMount() {
		let permalink = this.state.postObject.path;
		let url = domainName + '/mrblog-content/blogposts/' + permalink;
		asyncFetch(url, (data)=>{
			let newState = this.state;
			newState.postObject = JSON.parse(data);
			newState.postObject.path = permalink;
			newState.found = true;
			this.setState(newState);
		});
	}

	render() {
		return this.state.found ? <PostRenderer postObj={this.state.postObject} /> : <NotFound />
	}
}

class SideColumn extends Component {
	render() {
		return (
		<div className="sideColumn">
			<Avatar />
			<Social />
			<Intro />
			<TagsSummary magicword={magicword}/>
			<Friends />
		</div>
	)}
}

// props: (string)tag, (int)page
class PostsManager extends Component {
	constructor(props){
		super(props);
		this.state = {
			filterTag: props.tag,
			renderPosts: [],
			currentPage: props.page,
			totalPage: 0
		};
	}

	asyncFetchPosts(tag, pageNum)
	{
		var url = domainName + '/mrblog-content/index/' + magicword;
		if (tag !== undefined && tag.length > 0) url += 'tag_' + tag + '_';
		let firstPostIndex = pageNum * PostsPerPage;
		let chunkIndex = Math.floor(firstPostIndex / chunkSize);
		url += chunkIndex;
		asyncFetch(url, (data)=>{
			let parsedData = JSON.parse(data);
			let indexInChunkStart = firstPostIndex - chunkIndex * chunkSize;
			var newState = this.state;
			newState.filterTag = tag;
			newState.currentPage = parseInt(pageNum, 10);
			newState.totalPage = Math.ceil(parsedData.count / PostsPerPage);
			newState.renderPosts = [];
			for (var i = 0; i < PostsPerPage; i++)
			{
				let indexInChunk = indexInChunkStart + i;
				if (indexInChunk >= parsedData.content.length) break;

				let p = parsedData.content[indexInChunk];
				p.content = 'loading...';
				newState.renderPosts.push(p);
				let contentUrl = domainName + '/mrblog-content/blogposts/' + p.path;

				let fetchWithCapture = (url, idx)=>{
					asyncFetch(url, (postData)=>{
						newState.renderPosts[idx].content = JSON.parse(postData).content;
						this.setState(newState);
					});
				};
				fetchWithCapture(contentUrl, i);
			}
			this.setState(newState);
		// callback for not able to retrieve full index (likely due to wrong magicword)
		}, (jqXHR, textStatus, errorThrown)=>{
			if (jqXHR.status===404) {
				magicword = '';
			}
		});
	}

	componentDidMount() {
		this.asyncFetchPosts(this.state.filterTag, this.state.currentPage);
	}

	componentWillReceiveProps(nextProp){
		this.asyncFetchPosts(nextProp.tag, nextProp.page);
	}

	render() {
		window.scrollTo(0, 0);
		var here = this.state.currentPage;
		var tag = this.state.filterTag;
		var prev, next;
		if(tag===undefined){
			prev = '/page/'+(here-1);
			next = '/page/'+(here+1);
		}
		else {
			prev = '/tag/'+tag+'/page/'+(here-1);
			next = '/tag/'+tag+'/page/'+(here+1);
		}
		return (
			<div>{
				this.state.renderPosts.map (postObj =>
					<PostRenderer postObj={postObj} key={postObj.path} />
				)}
				{here>0 && here<this.state.totalPage && 
					<Link className="prev light" to={prev}>Prev</Link>}
				{here<this.state.totalPage-1 && here>=0 && 
					<Link className="next light" to={next}>Next</Link>}
			</div>
		);
	}
}

function DateString({date, linkPath}) {
	let convertOptions = {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};
	let dateStr = date==='pinned' ? 'Pinned' : (new Date(Date.parse(date))).toLocaleString('en-US', convertOptions);
	return(
	<div >
		<Link to={linkPath}><span className="date">
		{dateStr}
		</span></Link>
	</div>
)}

function PostRenderer({postObj}){return(
	<div>
		<DateString date={postObj.date} linkPath={'/post/'+postObj.path} />
		<div className="post">
			<div>
				{ postObj.title!=='' && 
					<div className="title">
						<Link to={'/post/'+postObj.path}>{postObj.title}</Link>
					</div> }
				<ReactMarkDown className="markdown" escapeHtml={false} source={postObj.content} />
			</div>
			{ postObj.tags.map(item=><Tag key={postObj.path+item} text={item} search={item} />) }
		</div>
	</div>
)}

//can't reference this outside so had to wrap setState() this way
class TagsSummary extends Component {
	constructor(props) {
		super(props);
		this.magicword = props.magicword
		this.state = {tagList: []};
	}

	componentDidMount() {
		this.update();
	}

	update() {
		asyncFetch(domainName + '/mrblog-content/index/'+this.magicword+'tags', (data)=>{
			let newState = {
				tagList: JSON.parse(data)
			}
			this.setState(newState);
		});
	}

	componentWillReceiveProps(newProps) {
		this.magicword = newProps.magicword;
		this.update();
	}

	render(){
		return (
		<div className="tagsAll">
			{this.state.tagList.map(tag=>
				<Tag key={tag.tag} 
						 text={tag.tag+' '+tag.num}
						 search={tag.tag} />)}
		</div>
	)}
}

function Tag ({text, search}) {return (
		<Link className="tag" to={'/tag/'+search}>{text}</Link>
)}

function Social() { 
	var mailto = "mailto" + email;
	var handles = socialHandles.filter(s=>{
		return s.url.trim().length > 0
	});

	var toIcon = function(s) {
		if (s==="instagram") {
			return <Ins id="instagram" className="social light" size={26} />
		} else if (s==="lofter") {
			return <img src={Lofter} alt="lofter" id="lofter" className="social light"/>
		} else if (s==="weibo") {
			return <Weibo className="social light" size={22} />
		} else if (s==="tumblr") {
			return <Tumblr className="social light" size={22} />
		} else if (s==="github") {
			return <Github className="social light" size={22} />
		} else if (s==="twitter") {
			return <Twitter className="social light" size={22} />
		}
	}

	return(
	<div className="socialAll">
		{handles.map(item=>
			<a key={item.platform} href={item.url}> {toIcon(item.platform)} </a>
		)}

		<br/>

		<a className="light" href={mailto}>
			<Mail id="mail" size={18} /> {email}
		</a>
	</div>
)}

class Avatar extends Component {
	constructor(props) {
		super(props);
		this.pic = '';
		this.showpic = true;
		try {
			this.pic = require('../avatar.png');
		} catch (e) {
			this.showpic = false;
		}
		this.avatar = this.showpic ? 
		<img className="avatar" src={this.pic} alt="avatar"/> : <div className="avatar">{title}</div>
	}

	render() { return(
		<div>
			<Link to="/">{this.avatar}</Link>
		</div>
	)}
}

class Footer extends Component {
	constructor(props) {
		super(props);
		this.state = {value: 'React', redirect: false};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit (event) {
		magicword = this.state.value;
		this.setState({redirect: true});
		event.preventDefault();
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	render(){ 
		var powered =
			<form onSubmit={this.handleSubmit}>
				<span>Powered by </span>
				<input className="footerInput" size="5" type="text" 
						value={this.state.value} onChange={this.handleChange} />
				<input type="submit" value="" />
			</form>
		return (
			<div className="footer">
				本博客<a href="https://github.com/miyehn/mrblog">Github</a> | 博客字体<a href="https://github.com/lxgw/LxgwWenKai-Lite">霞鹜文楷</a><br/>
				{powered}
			</div>
	)}
}

function NotFound() { return (
	<div>Not found...</div>
)}
