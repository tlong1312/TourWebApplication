import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api/api';
import { clearToken, getUserInfo, getUserRole, saveToken } from '../utils/api/tokenService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const res = await api.post("/refresh");

                const { access_token } = res.data;
                saveToken(access_token);

                setUser(getUserInfo());
                setRole(getUserRole());
            }catch (error) {
                clearToken();
                setUser(null);
                setRole(null);
            }finally{
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const loginContext = (token) => {
        saveToken(token);
        setUser(getUserInfo());
        setRole(getUserRole());
    };

    const logoutContext = async () => {
        try {
            await api.post("/logout");
        }catch (error) {
            console.error("Lỗi khi đăng xuất server ", error);
        }finally {
            clearToken();
            setUser(null);
            setRole(null);
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, loginContext, logoutContext}}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

