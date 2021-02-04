import {UserContextProvider} from "./UserContextProvider";

const PqdContext = ({children}) => {
    return <UserContextProvider>{children}</UserContextProvider>;
}

export default PqdContext
