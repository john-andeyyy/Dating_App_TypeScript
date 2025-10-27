import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { initSocket } from "../utils/Socket-Notif";

// Utility functions
const getImageSrc = (imageBuffer?: { data?: ArrayBuffer }): string | null => {
    if (!imageBuffer?.data) return null;
    const byteArray = new Uint8Array(imageBuffer.data);
    const blob = new Blob([byteArray], { type: "image/png" });
    return URL.createObjectURL(blob);
};

const calculateAge = (birthday: string): number => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};

// Types
interface MatchItem {
    _id: string;
    id: string;
    name: string;
    age: number | string;
    bio: string;
    img: string;
}

interface MatchListContextType {
    matchesList: MatchItem[];
    loading: boolean;
    fetchMatches: () => Promise<void>;
    removeMatch: (removedId: string) => void;
}

interface MatchListProviderProps {
    children: ReactNode;
}

// Context creation
const MatchListContext = createContext < MatchListContextType | undefined > (undefined);

export const MatchListProvider = ({ children }: MatchListProviderProps) => {
    const Baseurl = import.meta.env.VITE_BASEURL;
    const { user } = useAuth();
    const userId = user?._id;
    const accessToken = localStorage.getItem("AccessToken");

    const [matchesList, setMatchesList] = useState < MatchItem[] > ([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const socket = initSocket(userId);
        const handleNewMatch = (newMatch: any) => {
            const transformed: MatchItem = {
                _id: newMatch.senderId,
                id: newMatch.senderId,
                name: newMatch.name || "Unknown",
                age: newMatch.Birthday ? calculateAge(newMatch.Birthday) : "N/A",
                bio: newMatch.bio || "No bio",
                img:
                    getImageSrc(newMatch.Image) ||
                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            };
            setMatchesList((prev) => [transformed, ...prev]);
        };

        socket.on("Recive_NewMatch", handleNewMatch);
        return () => {
            socket.off("Recive_NewMatch", handleNewMatch);
        };
    }, [userId]);

    const fetchMatches = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${Baseurl}/Matching/MatchedList/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 200) {
                const transformed: MatchItem[] = res.data.data.map((item: any) => ({
                    _id: item._id,
                    id: item.userSuggestion._id,
                    name: item.userSuggestion.Name || "Unknown",
                    age: item.userSuggestion.Birthday
                        ? calculateAge(item.userSuggestion.Birthday)
                        : "N/A",
                    bio: item.userSuggestion.bio || "No bio",
                    img:
                        getImageSrc(item.userSuggestion.Image) ||
                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg",
                }));
                setMatchesList(transformed);
            } else {
                setMatchesList([]);
            }
        } catch (err) {
            console.error("Error fetching matches:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeMatch = (removedId: string) => {
        setMatchesList((prev) => prev.filter((match) => match.id !== removedId));
    };

    useEffect(() => {
        fetchMatches();
    }, [userId]);

    return (
        <MatchListContext.Provider value={{ matchesList, loading, fetchMatches, removeMatch }}>
            {children}
        </MatchListContext.Provider>
    );
};

export const useMatchList = (): MatchListContextType => {
    const context = useContext(MatchListContext);
    if (!context) {
        throw new Error("useMatchList must be used within a MatchListProvider");
    }
    return context;
};
