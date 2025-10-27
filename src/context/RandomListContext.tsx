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
}

interface AgeFilter {
    min: number;
    max: number;
}

interface RandomListContextType {
    profiles: Profile[];
    refresh: () => Promise<void>;
    loading: boolean;
    isEmpty: boolean;
    ageFilter: AgeFilter;
    updateAgeFilter: (min: number, max: number) => void;
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
    const [useAgeFilter] = useState(
        () => localStorage.getItem("useAgeFilter") === "true"
    );

    // const [useAgeFilter] = useState(
    //     () => localStorage.getItem("useAgeFilter") === "true"
    // );
    const [ageFilter, setAgeFilter] = useState<AgeFilter>({ min: 18, max: 35 });

    const getImageSrc = (imageBase64?: string): string => {
        if (!imageBase64)
            return "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";
        return `data:image/png;base64,${imageBase64}`;
    };

    const fetchProfiles = async (): Promise<void> => {
        if (!userId) return;

        setLoading(true);

        try {
            const url = useAgeFilter
                ? `${Baseurl}/Matching/PeopleList/${userId}?minAge=${ageFilter.min}&maxAge=${ageFilter.max}`
                : `${Baseurl}/Matching/PeopleList/${userId}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.data?.data?.length && res.status === 200) {
                const formattedProfiles: Profile[] = res.data.data.map((user: any) => ({
                    id: user._id,
                    name: user.Name,
                    bio: user.bio,
                    image: getImageSrc(user.Image),
                    age: user.age,
                }));

                setProfiles(formattedProfiles.sort(() => Math.random() - 0.5));
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

    useEffect(() => {
        fetchProfiles();
    }, [userId, ageFilter]);

    const updateAgeFilter = (min: number, max: number) => {
        setAgeFilter({ min, max });
    };

    return (
        <RandomListContext.Provider
            value={{ profiles, refresh: fetchProfiles, loading, isEmpty, ageFilter, updateAgeFilter }}
        >
            {children}
        </RandomListContext.Provider>
    );
}

export const useRandomProvider = (): RandomListContextType => {
    const context = useContext(RandomListContext);
    if (!context) throw new Error("useRandomProvider must be used within RandomProvider");
    return context;
};
