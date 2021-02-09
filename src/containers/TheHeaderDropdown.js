import React from 'react'
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {useUserContext} from "../context/UserContextProvider";
import {useHistory} from "react-router-dom";

const TheHeaderDropdown = () => {

    const {getUserInfo, setUserInfo} = useUserContext();
    const history = useHistory();

    const renderHello = () => {
        const firstName = getUserInfo()?.firstName;
        return firstName
               ? <div>Hello, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}!</div>
               : null;
    }

    const logOut = () => {
        setUserInfo(undefined);
        history.push("/login")
    }

    return (
        <CDropdown
            inNav
            className="c-header-nav-items mx-2"
            direction="down"
        >
            <CDropdownToggle className="c-header-nav-link" caret={false}>
                {renderHello()}
                <div className="c-avatar">
                    <CIcon name="cil-user"/>
                </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownItem divider/>
                <CDropdownItem onClick={() => logOut()}>
                    <CIcon name="cil-lock-locked" className="mfe-2"/>
                    Log out
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>
    );
}

export default TheHeaderDropdown
