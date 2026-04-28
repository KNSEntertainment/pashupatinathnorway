import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function HomeVideo() {
	return <ReactPlayer url="https://www.youtube.com/watch?v=khUIb9rZJKQ" controls width="100%" height="400px" />;
}
