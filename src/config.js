import React from 'react';


// ---- social handles & links ----
export var email = "rainduym@gmail.com"
export var socialHandles = [
    {
        "platform": "lofter",
        "url": ""
    },{
        "platform": "instagram",
        "url": ""
    },{
        "platform": "tumblr",
        "url": ""
    },{
        "platform": "twitter",
        "url": "https://twitter.com/rain_dd"
    },{
        "platform": "weibo",
        "url": "https://www.weibo.com/rainduym"
    },{
        "platform": "github",
        "url": "https://github.com/miyehn"
    }
]

// ---- blog settings ----
export var title = "槽"
export var PostsPerPage = 6;

export var Intro = function(){return (
	<div className="intro">
		<p>一些脑洞，涂鸦和快乐碎片>:D</p>
		<p>作品集页：<a className="light" href="https://miyehn.me">miyehn.me</a></p>
	</div>
)}

export var Friends = function() {return(
    <div className="friends">
        <p>也拜访下俺的赛博邻居们吧：</p>
        <a className="light" href="https://sumygg.com/">SumyBlog</a>
        <a className="light" href="https://mantyke.icu/">小球飞鱼</a>
        <a className="light" href="https://nachtzug.xyz/">Nachtzug</a>
        <a className="light" href="https://blog.dlzhang.com/">班班的碎碎念</a>
        <a className="light" href="http://blog.fivest.one/">fivestone</a>
        <a className="light" href="https://mengru.space">mengru</a>
        <a className="light" href="https://www.sardinefish.com">SardineFish</a>
        <a className="light" href="https://ablustrund.com/">Ablustrund</a>
        <a className="light" href="https://ayu.land/">甜鱼</a>
        <a className="light" href="https://nikukikai.art/">肉機械</a>
    </div>
)}
