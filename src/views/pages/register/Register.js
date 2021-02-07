import React, {useEffect, useState} from 'react'
import {
    CAlert, CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormText, CInput, CInputGroup, CInputGroupPrepend,
    CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {useUserContext} from "../../../context/UserContextProvider";
import {useHistory} from "react-router-dom";
import {httpPost} from "../../../utils/http-request";
import config from "../../../config/config.json";

const Register = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [registerFailed, setRegisterFailed] = useState(false);
    const [registerFailMessage, setRegisterFailMessage] = useState("");
    const [success, setSuccess] = useState(false)
    const {user} = useUserContext();
    const history = useHistory();

    useEffect(() => {
        if (user && user.jwt) {
            history.push("/dashboard")
        }
    }, [user]);

    const performRegister = () => {
        if (!username || !email || !password || (password !== repeatPassword)) {
            setRegisterFailed(true);
            setRegisterFailMessage("Please complete the form!");
            return;
        }
        setRegisterFailed(false);
        setRegisterFailMessage("");
        const body = {};
        body["username"] = username;
        body["firstName"] = firstName;
        body["lastName"] = lastName;
        body["email"] = email;
        body["password"] = password;
        httpPost(`${config.pqdApiBaseUrl}/authentication/register`, body)
            .then(res => {
                if (res.status === 200) {
                    return {status: "OK"};
                } else {
                    return {status: "Error", body: res.json()};
                }
            })
            .then(data => {
                if (data.status === "OK") {
                    setSuccess(true);
                } else {
                    setRegisterFailed(true);
                    return data.body;
                }
            })
            .then(body => {
                if (body) {
                    setRegisterFailMessage(body.message);
                }
            })
    }

    const emailValid = () => {
        return email === "" || /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/.test(email);
    }

    const usernameValid = () => {
        return username === "" || username.length >= 3;
    }

    const passwordValid = () => {
        return password === "" || password.length >= 4;
    }

    const repeatPasswordValid = () => {
        return repeatPassword === "" || repeatPassword === password;
    }

    const renderInputHelper = (message) => {
        return <CFormText className="alert-danger">{message}</CFormText>
    }

    const redirectToLoginPage = () => {
        setSuccess(!success);
        history.push("/login");
    }

    const renderSuccessModal = () => {
        return <CModal
            show={success}
            onClose={() => setSuccess(!success)}
            color="success"
        >
            <CModalHeader closeButton>
                <CModalTitle>Register successful</CModalTitle>
            </CModalHeader>
            <CModalBody>
                Your account has been registered. You can now login to your account.
            </CModalBody>
            <CModalFooter>
                <CButton color="success" onClick={() => redirectToLoginPage()}>Login</CButton>
            </CModalFooter>
        </CModal>
    }

    return (
        <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md="9" lg="7" xl="6">
                        <CCard className="mx-4">
                            <CCardBody className="p-4">
                                {renderSuccessModal()}
                                <CForm>
                                    <h1>Register</h1>
                                    <p className="text-muted">Register your account</p>
                                    {registerFailed
                                     ? <CAlert color="danger">
                                         Register failed: {registerFailMessage}
                                     </CAlert>
                                     : null}
                                    {!usernameValid() ? renderInputHelper("Username too short") : null}
                                    <CInputGroup className="mb-3">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-user"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text"
                                                placeholder="Username"
                                                autoComplete="username"
                                                invalid={!usernameValid()}
                                                valid={username !== "" && usernameValid()}
                                                onChange={value => setUsername(value.currentTarget.value)}
                                                value={username}/>
                                    </CInputGroup>
                                    {!emailValid() ? renderInputHelper("Invalid email format") : null}
                                    <CInputGroup className="mb-3">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>@</CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text"
                                                placeholder="Email"
                                                autoComplete="email"
                                                invalid={!emailValid()}
                                                valid={email !== "" && emailValid()}
                                                onChange={value => setEmail(value.currentTarget.value)}
                                                value={email}/>
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-user"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text"
                                                placeholder="First name (optional)"
                                                autoComplete="firstname"
                                                onChange={value => setFirstName(value.currentTarget.value)}
                                                value={firstName}/>
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-user"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text"
                                                placeholder="Last name (optional)"
                                                autoComplete="lastname"
                                                onChange={value => setLastName(value.currentTarget.value)}
                                                value={lastName}/>
                                    </CInputGroup>
                                    {!passwordValid() ? renderInputHelper("Password too short") : null}
                                    <CInputGroup className="mb-3">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-lock-locked"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="password"
                                                placeholder="Password"
                                                autoComplete="new-password"
                                                invalid={!passwordValid()}
                                                valid={password !== "" && passwordValid()}
                                                onChange={value => setPassword(value.currentTarget.value)}
                                                value={password}/>
                                    </CInputGroup>
                                    {!repeatPasswordValid() ? renderInputHelper("Passwords don't match") : null}
                                    <CInputGroup className="mb-4">
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-lock-locked"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="password"
                                                placeholder="Repeat password"
                                                autoComplete="new-password"
                                                invalid={!repeatPasswordValid()}
                                                valid={repeatPassword !== "" && repeatPasswordValid()}
                                                onChange={value => setRepeatPassword(value.currentTarget.value)}
                                                value={repeatPassword}/>
                                    </CInputGroup>
                                    <CButton color="success"
                                             block
                                             onClick={() => performRegister()}>Register Account</CButton>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    );
}

export default Register
