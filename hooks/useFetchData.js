"use client";

import { useEffect, useState, useCallback } from "react";

const useFetchData = (apiEndpoint, responseKey = "data") => {
	const [data, setData] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(apiEndpoint);
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			const result = await res.json();

			if (Array.isArray(result)) {
				setData(result);
			} else {
				setData(result[responseKey] || []);
			}
		} catch (err) {
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
