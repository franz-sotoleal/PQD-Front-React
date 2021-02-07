import React, {useContext, useState} from "react";

const ProductContext = React.createContext(undefined);

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error("useProductContext must be used within a ProductContextProvider");
    }
    return context;
};


export const ProductContextProvider = ({children}) => {
    const [products, setProducts] = useState();

    return (
        <ProductContext.Provider value={{products, setProducts}}>
            {children}
        </ProductContext.Provider>
    );
};
