import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { showToast } from "../components/ToastNotif";

const Baseurl = import.meta.env.VITE_BASEURL;

// Prevent multiple logout sequences from concurrent failing requests
let isLoggingOutGlobal = false;

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
    const navigate = useNavigate();
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
            // console.log(res.data.Data);
            

        } catch (error: any) {
            console.error(error.response?.data?.message || error.message);
        }
    };

    const CheckToken = async () => {
        const accessToken = localStorage.getItem("AccessToken");
        if (!accessToken) return;
        try {
            await axios.get(`${Baseurl}/user/auth/CheckToken`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } catch {
            // Interceptor will handle refresh/logout; avoid duplicate actions here
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            await CheckToken();
            await login();
        };
        initAuth();
    }, []);

    // Setup axios interceptors: attach token, refresh on 401/403, single-flight refresh, logout if refresh fails
    useEffect(() => {
        let refreshPromise: Promise<string> | null = null;

        const refreshAccessToken = async (): Promise<string> => {
            if (refreshPromise) return refreshPromise;
            refreshPromise = (async () => {
                const refreshToken = localStorage.getItem("Refresh_Token");
                if (!refreshToken) throw new Error("Missing refresh token");
                const res = await axios.post(`${Baseurl}/user/auth/RefreshToken`, { refreshToken }, {
                    headers: { Authorization: undefined as unknown as string },
                });
                const newAccessToken = res.data?.accessToken;
                if (!newAccessToken) throw new Error("No access token returned");
                localStorage.setItem("AccessToken", newAccessToken);
                return newAccessToken;
            })();

            try {
                const token = await refreshPromise;
                return token;
            } finally {
                refreshPromise = null;
            }
        };

        const requestInterceptor = axios.interceptors.request.use((config) => {
            const token = localStorage.getItem("AccessToken");
            if (token) {
                config.headers = config.headers || {};
                (config.headers as any).Authorization = `Bearer ${token}`;
            }
            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error?.response?.status;
                const originalRequest = error.config || {};
                const url: string = originalRequest?.url || "";

                // Do not retry refresh endpoint; if it fails, logout
                const isRefreshEndpoint = url.includes("/user/auth/RefreshToken");
                if (isRefreshEndpoint) {
                    if (!isLoggingOutGlobal) {
                        isLoggingOutGlobal = true;
                        logout();
                    }
                    return Promise.reject(error);
                }

                if ((status === 401 || status === 403) && !(originalRequest as any)._retry) {
                    (originalRequest as any)._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers = originalRequest.headers || {};
                        (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshErr) {
                        if (!isLoggingOutGlobal) {
                            isLoggingOutGlobal = true;
                            logout();
                        }
                        return Promise.reject(refreshErr);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const logout = () => {
        const savedTheme = localStorage.getItem('theme');
        localStorage.clear();
        localStorage.setItem("theme", savedTheme || "dark");
        setUserData({});
        setUser(null);
        showToast("success", "Logout successful", { toastId: "logout" });
        navigate("/", { replace: true });
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
