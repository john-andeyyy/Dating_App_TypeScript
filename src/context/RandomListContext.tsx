import axios from "axios";
import {
    createContext,
    useState,
    useContext,
    useEffect,
} from "react";
import type { ReactNode } from "react";

import { showToast } from "../components/ToastNotif";
import { useAuth } from "./AuthContext";

interface Profile {
    id: string;
    name: string;
    bio: string;
    image: string;
    age: number;
    email: string;
    longitude: string;
    latitude: string;
    gender: string;
}

interface AgeFilter {
    min: number;
    max: number;
}

interface RandomListContextType {
    profiles: Profile[];
    refresh: () => Promise<void>;
    removeProfile: (id: string) => void;
    loading: boolean;
    isEmpty: boolean;
    ageFilter: AgeFilter;
    updateAgeFilter: (min: number, max: number) => void;
    radius: number;
    updateRadius: (value: number) => void;
    Update_InterestedIn: (value: string) => void;
    interestedIn: string;
    useAgeFilter: boolean;
    toggleUseAgeFilter: (value: boolean) => void;


}

const RandomListContext = createContext<RandomListContextType | undefined>(
    undefined
);

export function RandomProvider({ children }: { children: ReactNode }) {
    const Baseurl = import.meta.env.VITE_BASEURL;
    const { user } = useAuth();
    const userId = user?._id;
    const accessToken = localStorage.getItem("AccessToken");

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [useAgeFilter, setUseAgeFilter] = useState<boolean>(
        () => localStorage.getItem("useAgeFilter") === "true"
    );
    const toggleUseAgeFilter = (value: boolean) => {
        setUseAgeFilter(value);
        localStorage.setItem("useAgeFilter", String(value));
    };



    const [interestedIn, setinterestedIn] = useState<string>(() => {
        // Prefer persisted user choice; fallback to backend user preference; default to "All"
        const saved = localStorage.getItem("interestedIn");
        if (saved) return saved;
        const initial = (user as any)?.interestedIn;
        return initial ? String(initial) : "All";
    });

    const Update_InterestedIn = (value: string) => {
        setinterestedIn(value);
        localStorage.setItem("interestedIn", value);
    }

    const [ageFilter, setAgeFilter] = useState<AgeFilter>({ min: 18, max: 35 });
    const [radius, setRadius] = useState(20);

    const updateRadius = (value: number) => {
        setRadius(value);
    };

    const getImageSrc = (imageBase64?: string): string => {
        if (!imageBase64)
            return "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";
        return `data:image/png;base64,${imageBase64}`;
    };

    function capitalizeFirstLetter(str: string) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }


    const fetchProfiles = async (): Promise<void> => {
        if (!userId) return;
        setLoading(true);

        try {
            // Kunin user location (browser geolocation)
            let userLat = 0;
            let userLng = 0;
            try {
                await new Promise<void>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            userLat = position.coords.latitude;
                            userLng = position.coords.longitude;
                            resolve();
                        },
                        (error) => {
                            console.warn("Geolocation failed:", error.message);
                            resolve(); // continue kahit walang location
                        }
                    );
                });
            } catch (err) {
                console.warn("Geolocation error:", err);
            }


            const url = useAgeFilter
                ? `${Baseurl}/Matching/PeopleList/${userId}?minAge=${ageFilter.min}&maxAge=${ageFilter.max}`
                : `${Baseurl}/Matching/PeopleList/${userId}`;

            console.log("useAgeFilter: ", useAgeFilter);

            //  request para mag-send ng location + radius sa body
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    latitude: userLat,
                    longitude: userLng,
                    radius,
                    interestedIn
                }
            });


            console.log("url:", url);

            if (res.data?.data?.length && res.status === 200) {
                const formattedProfiles: Profile[] = res.data.data.map((user: any) => ({
                    id: user._id,
                    name: user.Name,
                    bio: user.bio,
                    image: getImageSrc(user.Image),
                    age: user.age,
                    email: user.Email,
                    longitude: user.Longitude,
                    latitude: user.Latitude,
                    gender: capitalizeFirstLetter(user.gender),
                }));


                setProfiles(formattedProfiles.sort(() => Math.random() - 0.5));
                console.log(formattedProfiles.sort(() => Math.random() - 0.5));

                setIsEmpty(false);
            } else {
                setProfiles([]);
                setIsEmpty(true);
            }
        } catch (err: any) {
            if (err.response?.status === 404) setIsEmpty(true);
            else showToast("error", err.message);
        } finally {
            setLoading(false);
        }
    };


    //  removeProfile function
    const removeProfile = (id: string) => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
    };

    // Sync interestedIn from backend once on user change IF no local choice exists
    useEffect(() => {
        const saved = localStorage.getItem("interestedIn");
        if (!saved) {
            const userInterested = (user as any)?.interestedIn;
            if (userInterested && String(userInterested) !== interestedIn) {
                setinterestedIn(String(userInterested));
            }
        }
    }, [userId]);

    // Fetch profiles when filters or user change
    useEffect(() => {
        fetchProfiles();
    }, [userId, ageFilter, radius, useAgeFilter, interestedIn]);

    const updateAgeFilter = (min: number, max: number) => {
        setAgeFilter({ min, max });
    };

    return (
        <RandomListContext.Provider
            value={{
                profiles,
                refresh: fetchProfiles,
                removeProfile,
                loading,
                isEmpty,
                ageFilter,
                updateAgeFilter,
                radius,
                updateRadius,
                Update_InterestedIn,
                interestedIn,
                useAgeFilter,
                toggleUseAgeFilter

            }}
        >
            {children}
        </RandomListContext.Provider>

    );
}

export const useRandomProvider = (): RandomListContextType => {
    const context = useContext(RandomListContext);
    if (!context)
        throw new Error("useRandomProvider must be used within RandomProvider");
    return context;
};
