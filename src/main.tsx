import { createRoot } from 'react-dom/client'
import MobileBlogMain from "./Mobile.tsx";
import {useMediaQuery} from "react-responsive";
import {mediaQuerySettings} from "./Components.tsx";
import {BlogMain} from "./BlogMain.tsx";

function Main() {
	const isDesktopOrLaptop = useMediaQuery(mediaQuerySettings);
	return isDesktopOrLaptop ? <BlogMain/> : <MobileBlogMain />

}

createRoot(document.getElementById('root')!).render(<Main/>);
