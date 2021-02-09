import React, {useContext, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";

const UserContext = React.createContext(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
};

export const UserContextProvider = ({children}) => {
    const [user, setUser] = useState();
    const history = useHistory();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.jwt) {
            setUser(user);
        } else {
            history?.push("/login")
        }
    }, [])

    const getUserInfo = () => {
        return user;
    }

    const setUserInfo = (userInfo) => {
        setUser(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
    }

    return (
        <UserContext.Provider value={{getUserInfo, setUserInfo}}>
            {children}
        </UserContext.Provider>
    );
};
