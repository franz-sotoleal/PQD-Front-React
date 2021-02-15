import {
    CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CForm, CInput, CInputGroup, CInputGroupPrepend,
    CInputGroupText, CInvalidFeedback, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CSwitch
} from "@coreui/react";
import React, {useRef, useState} from "react";
import CIcon from "@coreui/icons-react";
import {
    saveProduct, testJiraApiConnection, testSonarqubeApiConnection, triggerReleaseInfoCollection
} from "../../utils/product-service";
import {useUserContext} from "../../context/UserContextProvider";
import {renderInputHelper} from "../common/FormHelper";
import {Loader} from "../common/Loader";
import config from "../../config/config.json";
import {useHistory} from "react-router-dom";

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

    const [savedProduct, setSavedProduct] = useState(undefined);
    const [productSaving, setProductSaving] = useState(false);

    const [triggerRequestDone, setTriggerRequestDone] = useState(false);
    const [triggerRequestLoading, setTriggerRequestLoading] = useState(false);
    const [triggerRequestResStatus, setTriggerRequestResStatus] = useState("");

    const [accordion, setAccordion] = useState(2);

    // Context
    const {getUserInfo, setUserInfo} = useUserContext();
    const history = useHistory();

    const logOut = () => {
        setUserInfo(undefined);
        history.push("/login")
    }

    const resetModal = () => {
        setName("");
        setSqBaseUrl("");
        setSqComponentName("");
        setSqApiToken("");
        setJiraBaseUrl("");
        setJiraBoardId("");
        setJiraUserEmail("");
        setJiraApiToken("");
        setSavedProduct(undefined);
        setTriggerRequestDone(false);
        setTriggerRequestLoading(false);
        setTriggerRequestResStatus("");
        jiraTested.current = false;
        sonarqubeTested.current = false;
        setJiraConnectionLoading(false);
        setSonarqubeConnectionLoading(false);
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

    const makeTriggerRequest = (url) => {
        setTriggerRequestLoading(true);
        triggerReleaseInfoCollection(url, savedProduct?.token)
            .then((res) => {
                setTriggerRequestResStatus(res?.status);
            })
            .catch(e => console.error(e))
            .finally(() => {
                setTriggerRequestDone(true);
                setTriggerRequestLoading(false);
            });
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

    const messagingUrl = `${config.pqdApiBaseUrl}/messaging/trigger?productId=${savedProduct?.id}`;
    const token = savedProduct?.token;
    const encryptedToken = btoa(token + ":");
    const authorizationHeaderValue = "Basic " + encryptedToken;

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
                                {messagingUrl}
                            </CCardBody>
                        </CCard>

                        <p>The post request requires basic auth with the following token:</p>

                        <CCard>
                            <CCardBody>
                                {token}
                            </CCardBody>
                        </CCard>
                    </CAlert>
                    <hr/>
                    <p>You can trigger the first release info collection with the button below. The request is
                       asynchronous - successful message means that the API has received the request and has
                       started working on it. Note that the button can
                       be pressed once and the collection retrieves the information from the tools at the current
                       time:</p>
                    {!triggerRequestDone && !triggerRequestLoading
                     ? <CButton color="primary"
                                variant="ghost"
                                block
                                onClick={() => makeTriggerRequest(messagingUrl)}>
                         <CIcon name="cil-link"/> Collect release info
                     </CButton>
                     : null}

                    {triggerRequestLoading
                     ? renderLoader(true)
                     : null}

                    {triggerRequestDone && !triggerRequestLoading
                     ? triggerRequestResStatus === "OK"
                       ? renderInputHelper("Release info collection started", "success")
                       : renderInputHelper(
                                "Houston, we have a problem... Release info collection request failed for some reason",
                                "warning")
                     : null}

                    <hr/>

                    <CCardBody>
                        <div id="accordion">
                            <CCard className="mb-0">
                                <CCardHeader id="headingThree">
                                    <CButton
                                        block
                                        color="link"
                                        className="text-left m-0 p-0"
                                        onClick={() => setAccordion(accordion === 2 ? null : 2)}
                                    >
                                        <h5 className="m-0 p-0">
                                            <CIcon name={accordion !== 2 ? "cil-chevron-bottom" : "cil-chevron-top"}/>
                                            {" "}Specified tools
                                        </h5>
                                    </CButton>
                                </CCardHeader>
                                <CCollapse show={accordion === 2}>
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
                                            <li>In Postman, simply put the token to the username field and postman does
                                                the rest
                                            </li>
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
                                            {" "}Request examples
                                        </h5>
                                    </CButton>
                                </CCardHeader>
                                <CCollapse show={accordion === 1}>
                                    <CCardBody>
                                        Here you can see three example requests of how to make a valid request with
                                        authorization header to the triggering endpoint. These examples should help you
                                        to implement the triggering request into your pipeline. The triggering request
                                        should run after all other tools on the pipeline. For example, Sonarqube
                                        analysis must be finished before making the triggering request.
                                        <br/>
                                        <hr/>
                                        <h6>Javascript Fetch:</h6>
                                        <code>const myHeaders = new Headers();</code>
                                        <br/>
                                        <br/>
                                        <code>
                                            myHeaders.append("Authorization", "{authorizationHeaderValue}");
                                        </code>
                                        <br/>
                                        <br/>
                                        <code>{"const requestOptions = \{method: 'POST', headers: myHeaders, redirect: 'follow'\};"}</code>
                                        <br/>
                                        <br/>
                                        <code>fetch("{messagingUrl}", requestOptions)</code>
                                        <br/>
                                        <code>.then(response => response.text())</code>
                                        <br/>
                                        <code>.then(result => console.log(result))</code>
                                        <br/>
                                        <code>.catch(error => console.log('error', error))</code>
                                        <hr/>

                                        <h6>Python Requests:</h6>
                                        <code>import requests</code>
                                        <br/>
                                        <br/>
                                        <code>
                                            url = "{messagingUrl}"
                                        </code>
                                        <br/>
                                        <code>payload = {"{" + "}"}</code>
                                        <br/>
                                        <code>{"headers = {"}
                                            {"'Authorization': '" + authorizationHeaderValue + "'}"}
                                        </code>
                                        <br/>
                                        <br/>
                                        <code>response = requests.request("POST", url, headers=headers,
                                              data=payload)</code>
                                        <br/>
                                        <code>print(response.text)</code>
                                        <hr/>

                                        <h6>cURL:</h6>
                                        <code>curl --location --request POST '{messagingUrl}' --header
                                              'Authorization: {authorizationHeaderValue}'</code>

                                    </CCardBody>
                                </CCollapse>
                            </CCard>
                        </div>
                    </CCardBody>

                    <CAlert color="info">
                        <b>Log Out</b> and <b>Log In</b> to see the newly added product in the product list. If you have
                                       read the information above, then
                        <CButton color="primary"
                                 variant="ghost"
                                 block
                                 onClick={() => logOut()}>
                            <CIcon name="cil-account-logout"/> Log Out Now
                        </CButton>
                    </CAlert>

                </CCollapse>
                <CCollapse show={productSaving}>
                    {renderLoader(false)}
                </CCollapse>
                <CCollapse show={!productSaving && !savedProduct}>
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
                {!savedProduct
                 ? <>
                     <CButton color="secondary"
                              onClick={() => setState(!state)}>
                         <CIcon name="cil-ban"/> Cancel
                     </CButton>
                     <CButton color="info"
                              disabled={!saveButtonEnabled()}
                              onClick={() => save()}>
                         <CIcon name="cil-save"/> Save Product
                     </CButton>
                 </>
                 : <>
                     <CButton color="danger"
                              onClick={() => resetModal()}>
                         <CIcon name="cil-x-circle"/> Reset Modal
                     </CButton>
                     <CButton color="info"
                              onClick={() => setState(!state)}>
                         <CIcon name="cil-ban"/> Close Modal
                     </CButton>
                 </>}
            </CModalFooter>
        </CModal>
    );
}

export default AddProductModal
