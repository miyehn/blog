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
		<p>我是miyehn，可以叫我小雨，是个坐标美东，喜欢画画，也喜欢胡思乱想并对着（未来的）自己唠嗑的人。</p>
		<p>博客名 “槽” 是吐槽的那个槽，内容我也知道没营养... 可是建博客的初衷就是吐槽啊=A=。</p>
	</div>
)}

export var Friends = function() {return(
    <div className="friends">
        <p>朋友们的博客：</p>
        <a className="light" href="https://handsomemango.github.io/blog">芒果</a>
        <a className="light" href="https://sumygg.com/">SumyBlog</a>
        <a className="light" href="https://mantyke.icu/">小球飞鱼</a>
        <a className="light" href="https://nachtzug.xyz/">Nachtzug</a>
        <a className="light" href="https://blog.dlzhang.com/">班班的碎碎念</a>
        <a className="light" href="http://blog.fivest.one/">fivestone</a>
        <a className="light" href="https://mengru.space">mengru</a>
    </div>
)}

export var password = "23333";
