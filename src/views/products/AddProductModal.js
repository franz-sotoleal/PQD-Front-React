import {
    CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CForm, CInput, CInputGroup, CInputGroupPrepend,
    CInputGroupText, CInvalidFeedback, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CSwitch
} from "@coreui/react";
import React, {useRef, useState} from "react";
import CIcon from "@coreui/icons-react";
import {saveProduct, testJiraApiConnection, testSonarqubeApiConnection} from "../../utils/product-service";
import {useUserContext} from "../../context/UserContextProvider";
import {renderInputHelper} from "../common/FormHelper";
import {Loader} from "../common/Loader";
import config from "../../config/config.json";

const dummyProduct = {
    id: 1,
    name: "Demo Product",
    token: "8257cc3a6b0610da1357f73e03524b090658553a",
    sonarqubeInfo: {
        baseUrl: "http://localhost:9000",
        componentName: "ESI-builtit",
        token: "9257cc3a6b0610da1357f73e03524b090658553d"
    }
    ,
    jiraInfo: {
        baseUrl: "https://kert944.atlassian.net",
        boardId: 1,
        token: "dlNrqUp5na04fQyacxcx58EF",
        userEmail: "prinkkert@gmail.com"
    }
}

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

    // Other states and refs
    const [sonarqubeEnabled, setSonarqubeEnabled] = useState(true);
    const [sonarqubeConnection, setSonarqubeConnection] = useState({});
    const sonarqubeTested = useRef(false);
    const [sonarqubeConnectionLoading, setSonarqubeConnectionLoading] = useState(false);
    const [jiraEnabled, setJiraEnabled] = useState(true);
    const [jiraConnection, setJiraConnection] = useState({});
    const jiraTested = useRef(false);
    const [jiraConnectionLoading, setJiraConnectionLoading] = useState(false);

    const [savedProduct, setSavedProduct] = useState(dummyProduct); // TODO remove dummy product
    const [productSaving, setProductSaving] = useState(false);

    const [accordion, setAccordion] = useState(-1);

    // Context
    const {getUserInfo} = useUserContext();

    const resetFields = () => { // TODO clear the fields after saving and show reset button on successful saving result
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
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/
                .test(baseUrl);
    }

    const emailValid = (email) => {
        return email === "" || /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/.test(email);
    }

    const sqDataExists = () => {
        return sqBaseUrl !== "" && baseUrlValid(sqBaseUrl)
            && sqComponentName !== "";
    }

    const jiraDataExists = () => {
        return jiraBaseUrl !== "" && baseUrlValid(jiraBaseUrl)
            && jiraBoardId !== "" && !isNaN(jiraBoardId)
            && jiraUserEmail !== "" && emailValid(jiraUserEmail)
            && jiraApiToken !== ""
    }

    const saveButtonEnabled = () => {
        return name !== "" && nameValid()
            && (jiraEnabled || sonarqubeEnabled)
            && (jiraEnabled && jiraDataExists() || !jiraEnabled)
            && (sonarqubeEnabled && sqDataExists() || !sonarqubeEnabled);
    }

    const testSqConnection = () => {
        if (sqDataExists()) {
            setSonarqubeConnectionLoading(true);
            const requestBody = {
                baseUrl: sqBaseUrl,
                componentName: sqComponentName,
                token: sqApiToken
            }
            testSonarqubeApiConnection(getUserInfo().jwt, requestBody)
                .then((res) => {
                    setSonarqubeConnection(res);
                })
                .catch(e => console.error(e))
                .finally(() => {
                    sonarqubeTested.current = true;
                    setSonarqubeConnectionLoading(false);
                });
        }
    }

    const testJiraConnection = () => {
        if (jiraDataExists()) {
            setJiraConnectionLoading(true);
            const requestBody = {
                baseUrl: jiraBaseUrl,
                boardId: jiraBoardId,
                userEmail: jiraUserEmail,
                token: jiraApiToken
            }
            testJiraApiConnection(getUserInfo().jwt, requestBody)
                .then((res) => {
                    setJiraConnection(res);
                })
                .catch(e => console.error(e))
                .finally(() => {
                    jiraTested.current = true;
                    setJiraConnectionLoading(false);
                });
        }
    }

    const save = () => {
        const userId = getUserInfo().userId;

        if (!userId) {
            console.error("userId not found, exiting save function");
            return;
        }

        const requestBody = {
            name: name,
            userId: userId,
        };

        if (sonarqubeEnabled) {
            requestBody.sonarqubeInfo = {
                baseUrl: sqBaseUrl,
                componentName: sqComponentName,
                token: sqApiToken
            };
        }

        if (jiraEnabled) {
            requestBody.jiraInfo = {
                baseUrl: jiraBaseUrl,
                boardId: jiraBoardId,
                userEmail: jiraUserEmail,
                token: jiraApiToken
            };
        }
        setProductSaving(true);
        saveProduct(getUserInfo().jwt, requestBody)
            .then(res => {
                console.log(res);
                setSavedProduct(res);
            })
            .catch(err => console.error(err))// TODO show error message on failure
            .finally(() => {
                setProductSaving(false);
            });
    }

    const renderLoader = (disableLoaderText) => {
        return <Loader disableLoaderText={disableLoaderText || true} className="text-center"/>;
    };

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
                <CCollapse show={savedProduct && !productSaving}>
                    <CAlert color="success">
                        <h4 className="alert-heading">{savedProduct?.name} saved successfully!</h4>
                        <hr/>
                        <p>
                            The product has been saved successfully and is ready to receive information from the{" "}
                            specified tools. To trigger information collection from the tools, make a post request to
                            the{" "}
                            following url:
                        </p>

                        <CCard>
                            <CCardBody>
                                {`${config.pqdApiBaseUrl}/messaging/trigger?productId=${savedProduct?.id}`}
                            </CCardBody>
                        </CCard>

                        <p>The post request requires basic auth with the following token:</p>

                        <CCard>
                            <CCardBody>
                                {savedProduct?.token}
                            </CCardBody>
                        </CCard>
                    </CAlert>

                    <hr />

                    <CCardBody>
                        <div id="accordion">
                            <CCard className="mb-0">
                                <CCardHeader id="headingOne">
                                    <CButton
                                        block
                                        color="link"
                                        className="text-left m-0 p-0"
                                        onClick={() => setAccordion(accordion === 0 ? null : 0)}
                                    >
                                        <h5 className="m-0 p-0">
                                            <CIcon name={accordion !== 0 ? "cil-chevron-bottom" : "cil-chevron-top"}/>
                                            {" "}How to do basic auth
                                        </h5>
                                    </CButton>
                                </CCardHeader>
                                <CCollapse show={accordion === 0}>
                                    <CCardBody>
                                        The endpoint requires basic authentication with base64 encrypted token:
                                        <ul>
                                            <li>In Postman, simply put the token to the username field and postman does the rest</li>
                                            <li>If sending by code (from your pipeline for example), then</li>
                                            <ul>
                                                <li>Add colon ':' to the end of the token</li>
                                                <li>Encrypt the token to Base64</li>
                                                <ul>
                                                    <li>Javascript encrypting example: btoa("your_product_token:"))</li>
                                                </ul>
                                                <li>Add the encrypted token to authorization header</li>
                                                <ul>
                                                    <li>Add word "Basic" before the token</li>
                                                    <ul>
                                                        <li>Example: "Basic ODI1N2N..."</li>
                                                    </ul>
                                                </ul>
                                            </ul>
                                        </ul>
                                    </CCardBody>
                                </CCollapse>
                            </CCard>
                            <CCard className="mb-0">
                                <CCardHeader id="headingTwo">
                                    <CButton
                                        block
                                        color="link"
                                        className="text-left m-0 p-0"
                                        onClick={() => setAccordion(accordion === 1 ? null : 1)}
                                    >
                                        <h5 className="m-0 p-0">
                                            <CIcon name={accordion !== 1 ? "cil-chevron-bottom" : "cil-chevron-top"}/>
                                            {" "}Specified tools
                                        </h5>
                                    </CButton>
                                </CCardHeader>
                                <CCollapse show={accordion === 1}>
                                    <CCardBody>
                                        {savedProduct?.sonarqubeInfo
                                         ? <>
                                             <h6>Sonarqube</h6>
                                             <CRow>
                                                 <CCol xs="4">
                                                     Base url:
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.sonarqubeInfo?.baseUrl}
                                                 </CCol>
                                             </CRow>
                                             <CRow>
                                                 <CCol xs="4">
                                                     <p>Component:</p>
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.sonarqubeInfo?.componentName}
                                                 </CCol>
                                             </CRow>
                                             <CRow>
                                                 <CCol xs="4">
                                                     <p>Token:</p>
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.sonarqubeInfo?.token}
                                                 </CCol>
                                             </CRow>
                                             <br/>
                                         </>
                                         : null
                                        }
                                        {savedProduct?.jiraInfo
                                         ? <>
                                             <h6>Jira</h6>
                                             <CRow>
                                                 <CCol xs="4">
                                                     Base url:
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.jiraInfo?.baseUrl}
                                                 </CCol>
                                             </CRow>
                                             <CRow>
                                                 <CCol xs="4">
                                                     Board id:
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.jiraInfo?.boardId}
                                                 </CCol>
                                             </CRow>
                                             <CRow>
                                                 <CCol xs="4">
                                                     <p>Token:</p>
                                                 </CCol>
                                                 <CCol xs="8">
                                                     {savedProduct.jiraInfo?.token}
                                                 </CCol>
                                             </CRow>
                                         </>
                                         : null
                                        }
                                    </CCardBody>
                                </CCollapse>
                            </CCard>
                        </div>
                    </CCardBody>

                    <CAlert color="info">
                        <b>Log Out</b> and <b>Log In</b> to see the newly added product in the product list
                    </CAlert>

                </CCollapse>
                <CCollapse show={productSaving}>
                    {renderLoader(false)}
                </CCollapse>
                <CCollapse show={!productSaving}>
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

                            {sonarqubeConnectionLoading
                             ? renderLoader()
                             : <CButton disabled={!(sonarqubeEnabled && sqDataExists())}
                                        color="primary"
                                        variant="ghost"
                                        block
                                        onClick={() => testSqConnection()}>
                                 <CIcon name="cil-link"/> Test Sonarqube Connection
                             </CButton>}

                            {sonarqubeTested.current
                             ? sonarqubeConnection?.connectionOk
                               ? renderInputHelper(sonarqubeConnection?.message, "success")
                               : renderInputHelper(sonarqubeConnection?.message)
                             : null}

                        </CCollapse>

                        <br/>

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
                                        invalid={isNaN(jiraBoardId)}
                                        valid={jiraBoardId !== "" && !isNaN(jiraBoardId)}
                                        onChange={value => setJiraBoardId(value.currentTarget.value)}
                                        value={jiraBoardId}/>
                                <CInvalidFeedback>Id must be numeric</CInvalidFeedback>
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

                            {jiraConnectionLoading
                             ? renderLoader()
                             : <CButton disabled={!(jiraEnabled && jiraDataExists())}
                                        color="primary"
                                        variant="ghost"
                                        block
                                        onClick={() => testJiraConnection()}>
                                 <CIcon name="cil-link"/> Test Jira Connection
                             </CButton>}

                            {jiraTested.current
                             ? jiraConnection?.connectionOk
                               ? renderInputHelper(jiraConnection?.message, "success")
                               : renderInputHelper(jiraConnection?.message)
                             : null}

                        </CCollapse>

                    </CForm>
                </CCollapse>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary"
                         onClick={() => setState(!state)}>
                    <CIcon name="cil-ban"/> Cancel
                </CButton>
                <CButton color="info"
                         disabled={!saveButtonEnabled()}
                         onClick={() => save()}>
                    <CIcon name="cil-save"/> Save Product</CButton>{' '}
            </CModalFooter>
        </CModal>
    )
}

export default AddProductModal
