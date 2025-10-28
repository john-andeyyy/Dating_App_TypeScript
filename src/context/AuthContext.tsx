import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import { showToast } from "../components/ToastNotif";

const Baseurl = import.meta.env.VITE_BASEURL;

interface UserData {
    _id?: string;
    name?: string;
    email?: string;
    age?: number;
    [key: string]: any;
}

interface AuthContextType {
    login: () => Promise<void>;
    logout: () => void;
    user: UserData | null;
    userdata: UserData;
    del: boolean;
    setDel: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserData | null>(() => {
        const storedUser = localStorage.getItem("userId");
        return storedUser ? { _id: storedUser } : null;
    });

    const [userdata, setUserData] = useState<UserData>({});
    const [del, setDel] = useState<boolean>(false);

    const login = async () => {
        const userid = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("AccessToken");
        const savedTheme = localStorage.getItem('theme');
        localStorage.setItem("theme", savedTheme || "light");
        if (!userid || !accessToken) return;

        try {
            const res = await axios.get(`${Baseurl}/user/auth/retrive/${userid}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUserData(res.data.Data);
            setUser(res.data.Data);
        } catch (error: any) {
            console.error(error.response?.data?.message || error.message);
        }
    };

    const CheckToken = async () => {
        const accessToken = localStorage.getItem("AccessToken");
        const refreshToken = localStorage.getItem("Refresh_Token");
        if (!accessToken) return;

        try {
            const res = await axios.get(`${Baseurl}/user/auth/CheckToken`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status === 200) return;
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401) {
                try {
                    const newTokenRes = await axios.post(`${Baseurl}/user/auth/RefreshToken`, {
                        refreshToken,
                    });
                    if (newTokenRes.status === 200) {
                        const newAccessToken = newTokenRes.data.accessToken;
                        localStorage.setItem("AccessToken", newAccessToken);
                        await login();
                        console.log("Access token refreshed");
                    }
                } catch {
                    logout();
                }
            } else if (status === 403) {
                logout();
            }
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            await CheckToken();
            await login();
        };
        initAuth();
    }, []);

    const logout = () => {
        const savedTheme = localStorage.getItem('theme');
        localStorage.clear();
        localStorage.setItem("theme", savedTheme || "dark");
        setUserData({});
        setUser(null);
        showToast("success", "Logout successful");
    };

    return (
        <AuthContext.Provider value={{ login, user, userdata, logout, del, setDel }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
