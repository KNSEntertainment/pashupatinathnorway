"use client";

import { useEffect, useState, useCallback } from "react";

const useFetchData = (apiEndpoint, responseKey = "data") => {
	const [data, setData] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			console.log(`useFetchData: Fetching from ${apiEndpoint}`);
			const res = await fetch(apiEndpoint);
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			const result = await res.json();
			console.log(`useFetchData: Raw result:`, result);

			if (Array.isArray(result)) {
				console.log(`useFetchData: Setting data as array`);
				setData(result);
			} else {
				console.log(`useFetchData: Setting data from result[${responseKey}]:`, result[responseKey]);
				setData(result[responseKey] || []);
			}
		} catch (err) {
			console.error(`useFetchData: Error:`, err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [apiEndpoint, responseKey]);

	useEffect(() => {
		if (!apiEndpoint) return;
		fetchData();
	}, [apiEndpoint, fetchData]);

	const mutate = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return { data, error, loading, mutate };
};

export default useFetchData;
