import { createRoot } from 'react-dom/client'
import MobileBlogMain from "./Mobile.tsx";
import {useMediaQuery} from "react-responsive";
import {BlogMain} from "./BlogMain.tsx";
import {createContext, useContext} from "react";

const mediaQuerySettings = {
	query: '(min-width: 960px)'
};

function isMobile() {
	return !useMediaQuery(mediaQuerySettings);
}

type BlogContextValue = {
	isMobile: boolean;
};

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

export function useBlogContext(): BlogContextValue {
	const ctx = useContext(BlogContext);
	if (!ctx) {
		throw new Error("Trying to use blog context outside of provider");
	}
	return ctx;
}

function Main() {
	if (isMobile()) {
		return <BlogContext.Provider value={{isMobile: true}}><MobileBlogMain/></BlogContext.Provider>
	} else {
		return <BlogContext.Provider value={{isMobile: false}}><BlogMain/></BlogContext.Provider>
	}
}

createRoot(document.getElementById('root')!).render(<Main/>);
