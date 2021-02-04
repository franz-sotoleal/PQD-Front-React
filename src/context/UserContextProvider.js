import React, {useContext, useState} from "react";

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

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};
