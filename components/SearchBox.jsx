import { Input } from "./ui/input";

const SearchBox = ({ handleSearch }) => {
	return (
		<div className="relative flex items-center md:w-96 w-48 mt-12">
			<Input placeholder="Search..." className="w-full py-2 pl-10 pr-4 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 bg-light transition-all ease-in-out duration-200" />
			<button onClick={handleSearch} className="absolute left-3 text-gray-900 hover:text-gray-900 transition-all duration-200 ease-in-out">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 16a6 6 0 100-12 6 6 0 000 12zm0 0l5 5" />
				</svg>
			</button>
		</div>
	);
};

export default SearchBox;
