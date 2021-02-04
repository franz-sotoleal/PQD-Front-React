import React, {useEffect, useState} from "react";
import {Link, useHistory} from 'react-router-dom'
import {
    CAlert, CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CInput, CInputGroup, CInputGroupPrepend,
    CInputGroupText, CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {httpPost} from "../../../utils/http-request";
import config from "../../../config/config.json"
import {useUserContext} from "../../../context/UserContextProvider";

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
    const {user, setUser} = useUserContext();
    const history = useHistory();

    useEffect(() => {
        if (user && user.jwt) {
            history.push("/dashboard")
        }
    }, [user]);

    const performLogin = () => {
        setLoginFailed(false);
        const body = {};
        body["username"] = username;
        body["password"] = password;
        httpPost(`${config.pqdApiBaseUrl}/authentication/login`, body)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setUser(data);
            })
            .catch(() => {
                setLoginFailed(true);
                setUser(undefined);
            });
    }

    return (
        <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md="8">
                        <CCardGroup >
                            <CCard className="p-4">
                                <CCardBody className="text-center">
                                    <CForm>
                                        <h1>Login</h1>
                                        <p className="text-muted">Sign In to your account</p>
                                        {loginFailed
                                         ? <CAlert color="danger">
                                             Login failed!
                                         </CAlert>
                                         : null}
                                        <CInputGroup className="mb-3">
                                            <CInputGroupPrepend>
                                                <CInputGroupText>
                                                    <CIcon name="cil-user"/>
                                                </CInputGroupText>
                                            </CInputGroupPrepend>
                                            <CInput type="text"
                                                    placeholder="Username"
                                                    autoComplete="username"
                                                    onChange={value => setUsername(value.currentTarget.value)}
                                                    value={username}/>
                                        </CInputGroup>
                                        <CInputGroup className="mb-4">
                                            <CInputGroupPrepend>
                                                <CInputGroupText>
                                                    <CIcon name="cil-lock-locked"/>
                                                </CInputGroupText>
                                            </CInputGroupPrepend>
                                            <CInput type="password"
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                    onChange={value => setPassword(value.currentTarget.value)}
                                                    value={password}/>
                                        </CInputGroup>
                                        <CRow >
                                            <CCol xs="12" sm="1">
                                                <CButton color="primary" className="px-4"
                                                         onClick={() => performLogin()}>Login</CButton>
                                            </CCol>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                            <CCard className="text-white bg-primary p-4" >
                                <CCardBody className="text-center">
                                    <div>
                                        <h2>Sign up</h2>
                                        <p>Register your account to get access to PQD functionality</p>
                                        <Link to="/register">
                                            <CButton color="primary" className="mt-3" active tabIndex={-1}>Click Here To Register
                                                                                                           Now!</CButton>
                                        </Link>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default Login
