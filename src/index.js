import React from 'react';
import ReactDOM from 'react-dom/client';
import Projector from './Projector.tsx';
import MobileBlogMain from "./Mobile";

const domNode = document.getElementById('root');
const rootNode = ReactDOM.createRoot(domNode);

if (window.innerWidth >= 768) {
	rootNode.render(<Projector/>);
} else {
	rootNode.render(<MobileBlogMain/>);
}