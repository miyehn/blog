import React from 'react';
import ReactDOM from 'react-dom/client';
import Projector from './Projector.tsx';
import MobileBlogMain from "./Mobile";
import {useMediaQuery} from "react-responsive";
import {mediaQuerySettings} from "./Components";

const domNode = document.getElementById('root');
const rootNode = ReactDOM.createRoot(domNode);

function RootNode() {
	const isDesktopOrLaptop = useMediaQuery(mediaQuerySettings);
	return isDesktopOrLaptop ? <Projector/> : <MobileBlogMain/>;
}

rootNode.render(<RootNode/>)