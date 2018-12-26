import React from 'react';


// ---- social handles & links ----
export var email = "random@email.com"
export var socialHandles = [
    {
        "platform": "lofter",
        "url": ""
    },{
        "platform": "instagram",
        "url": "https://www.instagram.com/"
    },{
        "platform": "tumblr",
        "url": "https://www.tumblr.com/"
    },{
        "platform": "weibo",
        "url": ""
    },{
        "platform": "twitter",
        "url": ""
    },{
        "platform": "github",
        "url": "https://github.com/"
    }
]

// ---- blog settings ----
export var title = "Sample blog"
export var PostsPerPage = 6;

export var Intro = function(){return (
	<div className="intro">
		<p>This is a dummy blog.</p>
		<p>Find me elsewhere :)))</p>
	</div>
)}

export var Friends = function() {return(
    <div className="friends">
        <p>friends list↓</p>
        <a className="light" href="https://www.dictionary.com/browse/nowhere">none</a><br/>
    </div>
)}

export var password = "23333";

export var playlist = [
    {
        "info": "Reclaim - Ólafur Arnalds",
        "url": "https://miyehn.me/music/(06)Reclaim_olafur_arnalds.mp3"
    }
];
