"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// --- 1. Define Types ---

export interface UserState {
    id: string;
    username: string;
    email?: string;
}

interface TokenPayload {
    id: string | number;
    username: string;
    email?: string;
    exp?: number;
    iat?: number;
    jti?: string;
    token_type?: string;
}

interface AuthContextValue {
    user: UserState | null;
    loading: boolean;
    login: (access: string, refresh: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Cookie config
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    secure: true,
    sameSite: "Lax",
};

const REFRESH_COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 30,
    secure: true,
    sameSite: "Lax",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserState | null>(null);
    const [loading, setLoading] = useState(true);

    const setUserFromToken = (accessToken: string) => {
        try {
            const decoded = jwtDecode<TokenPayload>(accessToken);
            setUser({
                id: String(decoded.id),
                username: decoded.username,
                email: decoded.email,
            });
        } catch (error) {
            console.error("Token decoding failed or token is invalid.", error);
            setUser(null);
        }
    };

    useEffect(() => {
        // Read from cookie (also visible in DevTools → Application → Cookies)
        const accessToken = Cookies.get("access");
        if (accessToken) {
            setUserFromToken(accessToken);
        }
        setLoading(false);
    }, []);

    const login = (access: string, refresh: string) => {
        // Store in cookies — visible under DevTools → Application → Cookies
        Cookies.set("access", access, COOKIE_OPTIONS);
        Cookies.set("refresh", refresh, REFRESH_COOKIE_OPTIONS);
        setUserFromToken(access);
    };

    const logout = () => {
        Cookies.remove("access");
        Cookies.remove("refresh");
        setUser(null);
        window.location.href = "/login";
    };

    const contextValue: AuthContextValue = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};