import { createContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
	const [profile, setProfile] = useState({ name: "Guest" });

	const fetchProfile = async () => {
		try {
			const res = await fetch("/api/settings");
			console.log("res:", res);
			const data = await res.json();
			setProfile(data);
		} catch (error) {
			console.error("Error fetching profile data:", error);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
};

export default ProfileContext;
