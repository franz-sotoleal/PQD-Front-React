import React, {useEffect, useRef, useState} from "react";
import {Link} from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md="8">
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <CForm>
                                        <h1>Login</h1>
                                        <p className="text-muted">Sign In to your account</p>
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
                                        <CRow>
                                            <CCol xs="6">
                                                <CButton color="primary" className="px-4">Login</CButton>
                                            </CCol>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                            <CCard className="text-white bg-primary py-5 d-md-down-none" style={{width: '44%'}}>
                                <CCardBody className="text-center">
                                    <div>
                                        <h2>Sign up</h2>
                                        <p>Register your account to get access to PQD functionality</p>
                                        <Link to="/register">
                                            <CButton color="primary" className="mt-3" active tabIndex={-1}>Register
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
