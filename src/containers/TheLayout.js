import React, {useEffect} from 'react'
import {TheContent, TheFooter, TheHeader} from './index'
import {useUserContext} from "../context/UserContextProvider";
import {useHistory} from "react-router-dom";

const TheLayout = () => {

    const {getUserInfo} = useUserContext();
    const history = useHistory();

    useEffect(() => {
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.jwt) {
            history.push("/login")
        }
    }, [])

    return (
        <div className="c-app c-default-layout">
            <div className="c-wrapper">
                <TheHeader/>
                <div className="c-body">
                    <TheContent/>
                </div>
                <TheFooter/>
            </div>
        </div>
    )
}

export default TheLayout
