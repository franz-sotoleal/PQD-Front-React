import {UserContextProvider} from "./UserContextProvider";
import {ProductContextProvider} from "./ProductContextProvider";

const PqdContext = ({children}) => {
    return (
        <UserContextProvider>
            <ProductContextProvider>
                {children}
            </ProductContextProvider>
        </UserContextProvider>
    );
}

export default PqdContext
