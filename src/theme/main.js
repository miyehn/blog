import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import jQuery from 'jquery';
import ReactMarkDown from 'react-markdown';
import moment from 'moment';
import './style/style.css';
import { Intro, Friends, PostsPerPage, 
  password, email, socialHandles, title} from '../config.js';

import {FaTumblrSquare as Tumblr} from 'react-icons/fa';
import {FaWeibo as Weibo} from 'react-icons/fa';
import {TiSocialInstagram as Ins} from 'react-icons/ti';
import {FaTwitterSquare as Twitter} from 'react-icons/fa';
import {IoMdMail as Mail} from 'react-icons/io';
import {GoMarkGithub as Github} from "react-icons/go";

import {IoIosSkipBackward as Prev} from 'react-icons/io';
import {IoIosSkipForward as Next} from 'react-icons/io';
import {TiMediaPlay as Play} from 'react-icons/ti';
import {TiMediaPause as Pause} from 'react-icons/ti';

var Lofter = require('./assets/lofter.png');
var domainName = process.env.REACT_APP_DOMAIN;

var auth = false;
var summary = [];
var summaryPublic = [];
var playlist = [];
var future = moment(1e15);
document.title = title;

var tagsUpdater = ()=>{}
var tagsRefresher = ()=>{}
var postManagerRefresher = ()=>{}

jQuery.ajax({
  type: 'GET',
  dataType: 'json',
  url: domainName + '/mrblog-content/blogSummary',
  success: (data)=>{
		console.log(domainName + '/mrblog-content/blogSummary');
		console.log(data);
    summary = data.map(obj=>{
      obj.date = (obj.date.trim().toLowerCase()==='pinned') ? future : moment(obj.date); 
      return obj;
    });
    summary = summary.sort((p1,p2)=>{
      var t1 = p1.date.unix();
      var t2 = p2.date.unix();
      if(isNaN(t1)) t1 = -1;
      if(isNaN(t2)) t2 = -1;
      return t2-t1;
    });
    summaryPublic = summary.filter(post=>{return post.publicity <= 1});
    tagsRefresher();
    postManagerRefresher();
  },
  async: false
});

jQuery.ajax({
  type: 'GET',
  dataType: 'json',
  url: domainName + '/mrblog-content/tracklist',
  success: (data)=>{
    playlist = data.map(obj=>{
      obj.url = domainName + '/mrblog-content/tracks/' + obj.filename;
      return obj;
    });
  },
  async: false
});

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

function MainColumn () {return (
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

class SinglePost extends Component {

	constructor(props) {
		super(props);
		let initState = {
			found: false,
			postObject: {
				content: "loading..."
			}
		};
		this.state = initState;

		// TODO: optimize; use a dictionary
		for (var i = 0; i < summary.length; i++) {
			let postObj = summary[i];
			let path = postObj.path;
			if (path==='/'+props.permalink) {
				asyncFetchPost(path, (data)=>{
					let newState = {
						found: true,
						postObject: postObj
					};
					newState.postObject.content = data;
					this.setState(newState);
				});
				break;
			}
		}
	}

	render() {
		return this.state.found ? <PostRenderer postObj={this.state.postObject} /> : <NotFound />
	}
}

function SideColumn () {return (
    <div className="sideColumn">
      <Avatar />
      <Social />
      <Intro />
      <TagsSummary />
      <Friends />
    </div>
)}

function fetchPost(fullpath, callback) {
  var content = 'loading...';
  jQuery.ajax({
    type: 'GET',
    url: domainName + '/mrblog-content/blogposts' + fullpath,
    success: (data)=>{content = data},
    async: false
  });
  return content;
}

function asyncFetchPost(fullpath, callback) {
	jQuery.ajax({
		type: 'GET',
		url: domainName + '/mrblog-content/blogposts' + fullpath,
		async: true,
		success: (data)=>{callback(data);}
	});
}

class PostsManager extends Component {
  constructor(props){
    super(props);
    this.state = {
      filterTag: this.props.tag,
      renderPosts: [],
      perPage: PostsPerPage,
      currentPage: this.props.page,
      totalPage: 0
    };
    this.posts = [];
  }

  componentDidMount() {
    this.updateRenderPage(this.state.filterTag, this.state.currentPage);
    postManagerRefresher = this.forceUpdate;
  }

  updateRenderPage(tag, page) {
		
		var newState = {};

    this.state.filterTag = tag;
    var postByTag = [];
    var grandList = auth ? summary : summaryPublic;
    grandList.map(obj=>{
      if(tag===undefined || obj.tags.includes(tag)) postByTag.push(obj);
    })
    this.state.totalPage = Math.ceil(postByTag.length/this.state.perPage);
    this.state.currentPage = parseInt(page);
    this.state.renderPosts = [];
    for(var i=0; i<this.state.perPage; i++){
      var post = postByTag[i + this.state.currentPage*this.state.perPage];
      if(post!==undefined){
				var cb = ()=>{};
        var content = (auth&&post.publicity===1) ?
					fetchPost(post.path+"-alt", cb) : fetchPost(post.path, cb);
        post.content = content;
        this.state.renderPosts.push(post);
      }
    }
		//this.setState(newState);
    this.forceUpdate();
  }

  componentWillReceiveProps(nextProp){
    this.updateRenderPage(nextProp.tag, nextProp.page);
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

function Date({date, linkPath}) {return(
  <div >
		<Link to={linkPath}><span className="date">
    {date.unix()===future.unix() ? "Pinned" : date.format('MMM D YYYY　dddd h:mmA')}
		</span></Link>
  </div>
)}

function PostRenderer ({postObj}){ return(
  <div>
    <Date date={postObj.date} linkPath={'/post'+postObj.path} />
    <div className="post">
      <div>
        { postObj.title!=='' && 
          <Link to={'/post'+postObj.path} className="title">{postObj.title}</Link> }
        <ReactMarkDown className="markdown" escapeHtml={false} source={postObj.content} />
      </div>
      { postObj.tags.map(item=><Tag key={postObj.path+item} text={item} search={item} />) }
    </div>
  </div>
)}

//can't reference this outside so had to wrap setState() this way
var whyIHaveToDoThis = (x)=>{} 
class TagsSummary extends Component {
  constructor(props){
    super(props);
    this.state = {tagList: []};
  }

  componentDidMount(){
    tagsRefresher = this.forceUpdate();
    tagsUpdater = this.updateMe;
    whyIHaveToDoThis = (x)=>this.setState({tagList: x});
    this.updateMe();
  }

  updateMe(){
    var tagNameList = [];
    var tagList = [];
    var grandList = auth ? summary : summaryPublic;
    grandList.map(obj=>{
      obj.tags.map(tag=>{
        var ind = tagNameList.indexOf(tag);
        if(ind<0) { tagList.push({tagName: tag, count:1}); tagNameList.push(tag);}
        else {tagList[ind].count += 1;}
      })
    })
    tagList.sort((a,b)=>{return b.count-a.count});
    whyIHaveToDoThis(tagList);
  }

  render(){
    return (
    <div className="tagsAll">
      {this.state.tagList.map(tag=>
        <Tag key={tag.tagName} 
             text={tag.tagName+' '+tag.count}
             search={tag.tagName} />)}
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
      return <img src={Lofter} id="lofter" className="social light"/>
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
      try {
        this.pic = require('../avatar.jpg');
      } catch (e) {
        this.showpic = false;
      }
    }
    this.avatar = this.showpic ? 
    <img className="avatar" src={this.pic}/> : <div className="avatar">{title}</div>
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
    if(this.state.value.toLowerCase()===password){
      auth = true;
      this.setState({redirect: true});
      tagsUpdater();
    }
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render(){ 
    var content;
    if(this.state.redirect) {
      this.state.redirect = false;
      content = <Redirect to="/" />
    } else {content =
      <form onSubmit={this.handleSubmit}>
        <span>Powered by </span>
        <input className="footerInput" size="5" type="text" 
            value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="" />
      </form>
    }
    return (
      <div className="footer">{content}</div>
  )}
}

function NotFound() { return (
  <div>Not found...</div>
)}
