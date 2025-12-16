import { createRoot } from 'react-dom/client'
import MobileBlogMain from "./Mobile.tsx";
import {useMediaQuery} from "react-responsive";
import {mediaQuerySettings} from "./Components.tsx";
import {BlogMainFramed2} from "./BlogMain.tsx";

function Main() {
	const isDesktopOrLaptop = useMediaQuery(mediaQuerySettings);
	return isDesktopOrLaptop ? <BlogMainFramed2/> : <MobileBlogMain />

}

createRoot(document.getElementById('root')!).render(<Main/>);
