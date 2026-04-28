import Link from "next/link";

export default function AuthErrorPage({ searchParams }) {
	const error = searchParams.error;

	return (
		<div className="max-w-md mx-auto mt-10">
			<h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
			<p>{error ? `Error: ${error}` : "An unknown error occurred."}</p>
			<Link href="/login" className="text-blue-500 hover:underline">
				Go back to Login
			</Link>
		</div>
	);
}
