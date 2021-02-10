import {
    CButton, CCol, CCollapse, CForm, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CInvalidFeedback, CModal,
    CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CSwitch
} from "@coreui/react";
import React, {useState} from "react";
import CIcon from "@coreui/icons-react";

const AddProductModal = ({state, setState}) => {

    const [name, setName] = useState("");

    // SQ info
    const [sqBaseUrl, setSqBaseUrl] = useState("");
    const [sqComponentName, setSqComponentName] = useState("");
    const [sqApiToken, setSqApiToken] = useState("");

    // Jira info
    const [jiraBaseUrl, setJiraBaseUrl] = useState("");
    const [jiraBoardId, setJiraBoardId] = useState("");
    const [jiraUserEmail, setJiraUserEmail] = useState("");
    const [jiraApiToken, setJiraApiToken] = useState("");

    // Other states
    const [sonarqubeEnabled, setSonarqubeEnabled] = useState(true);
    const [jiraEnabled, setJiraEnabled] = useState(true);

    const resetFields = () => {
        setName("");
        setSqComponentName("");
        setSqApiToken("");
        setJiraBaseUrl("");
        setJiraBoardId("");
        setJiraUserEmail("");
        setJiraApiToken("");
    }

    const nameValid = () => {
        return name === "" || name.length >= 3;
    }

    const baseUrlValid = (baseUrl) => {
        return baseUrl === ""
            || /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/.test(baseUrl)
            ||
            /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/
                .test(baseUrl)
            &&
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
                .test(baseUrl);
    }

    const emailValid = (email) => {
        return email === "" || /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/.test(email);
    }

    return (
        <CModal
            show={state}
            onClose={() => setState(!state)}
            color="info"
        >
            <CModalHeader closeButton>
                <CModalTitle><CIcon name="cil-library-add"/> Add New Product</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm>
                    <p className="text-muted">Add new product and start collecting information from Sonarqube and
                                              Jira</p>

                    <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                            <CInputGroupText>
                                <CIcon name="cil-description"/>
                            </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput type="text"
                                placeholder="Product name"
                                autoComplete=""
                                invalid={!nameValid()}
                                valid={name !== "" && nameValid()}
                                onChange={value => setName(value.currentTarget.value)}
                                value={name}/>
                        <CInvalidFeedback>Name too short</CInvalidFeedback>
                    </CInputGroup>

                    <CRow>
                        <CCol xs="10">
                            <h5>Sonarqube</h5>
                        </CCol>
                        <CCol xs="2">
                            <CRow className="text-right">
                                <CSwitch className={'mx-1 cil-align-right'} shape={'pill'} color={'info'}
                                         labelOn={'\u2713'}
                                         labelOff={'\u2715'}
                                         defaultChecked onChange={() => setSonarqubeEnabled(!sonarqubeEnabled)}/>
                            </CRow>
                        </CCol>
                    </CRow>

                    <CCollapse show={sonarqubeEnabled}>
                        <p>Read more about how to{" "}
                            <a target="_blank"
                               href="https://docs.sonarqube.org/latest/user-guide/user-token/">
                                create Sonarqube API token{" "}
                                <CIcon name="cil-external-link"/>
                            </a>
                            <br/>
                           See also,{" "}
                            <a target="_blank"
                               href="https://docs.sonarqube.org/latest/extend/web-api/">
                                Sonarqube API documentation{" "}
                                <CIcon name="cil-external-link"/>
                            </a>
                        </p>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-link"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Sonarqube API base url"
                                    autoComplete=""
                                    invalid={!baseUrlValid(sqBaseUrl)}
                                    valid={sqBaseUrl !== "" && baseUrlValid(sqBaseUrl)}
                                    onChange={value => setSqBaseUrl(value.currentTarget.value)}
                                    value={sqBaseUrl}/>
                            <CInvalidFeedback>Invalid url</CInvalidFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-fingerprint"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Sonarqube project key (component name)"
                                    autoComplete=""
                                    valid={sqComponentName !== ""}
                                    onChange={value => setSqComponentName(value.currentTarget.value)}
                                    value={sqComponentName}/>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-badge"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Sonarqube API token"
                                    autoComplete=""
                                    valid={sqApiToken !== ""}
                                    onChange={value => setSqApiToken(value.currentTarget.value)}
                                    value={sqApiToken}/>
                        </CInputGroup>
                    </CCollapse>

                    <CRow>
                        <CCol xs="10">
                            <h5>Jira</h5>
                        </CCol>
                        <CCol xs="2">
                            <CRow className="text-right">
                                <CSwitch className={'mx-1'} shape={'pill'} color={'info'} labelOn={'\u2713'}
                                         labelOff={'\u2715'}
                                         defaultChecked onChange={() => setJiraEnabled(!jiraEnabled)}/>
                            </CRow>
                        </CCol>
                    </CRow>

                    <CCollapse show={jiraEnabled}>
                        <p>Read more about how to{" "}
                            <a target="_blank"
                               href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/">
                                create Jira API token{" "}
                                <CIcon name="cil-external-link"/>
                            </a>
                            <br/>
                           See also,{" "}
                            <a target="_blank"
                               href="https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#version">
                                Jira API documentation{" "}
                                <CIcon name="cil-external-link"/>
                            </a>
                        </p>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-link"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Jira API base url"
                                    autoComplete=""
                                    invalid={!baseUrlValid(jiraBaseUrl)}
                                    valid={jiraBaseUrl !== "" && baseUrlValid(jiraBaseUrl)}
                                    onChange={value => setJiraBaseUrl(value.currentTarget.value)}
                                    value={jiraBaseUrl}/>
                            <CInvalidFeedback>Invalid url</CInvalidFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-fingerprint"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Jira board id"
                                    autoComplete=""
                                    valid={jiraBoardId !== ""}
                                    onChange={value => setJiraBoardId(value.currentTarget.value)}
                                    value={jiraBoardId}/>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-at"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Jira user email"
                                    autoComplete=""
                                    invalid={!emailValid(jiraUserEmail)}
                                    valid={jiraUserEmail !== "" && emailValid(jiraUserEmail)}
                                    onChange={value => setJiraUserEmail(value.currentTarget.value)}
                                    value={jiraUserEmail}/>
                            <CInvalidFeedback>Invalid email</CInvalidFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                    <CIcon name="cil-badge"/>
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                                    placeholder="Jira API token"
                                    autoComplete=""
                                    valid={jiraApiToken !== ""}
                                    onChange={value => setJiraApiToken(value.currentTarget.value)}
                                    value={jiraApiToken}/>
                        </CInputGroup>
                    </CCollapse>

                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setState(!state)}>Cancel</CButton>
                <CButton color="info" onClick={() => setState(!state)}>Do Something</CButton>{' '}
            </CModalFooter>
        </CModal>
    );
}

export default AddProductModal
