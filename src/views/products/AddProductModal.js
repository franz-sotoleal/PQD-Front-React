import {
    CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CForm, CFormGroup, CInput, CInputCheckbox,
    CInputGroup, CInputGroupPrepend, CInputGroupText, CInvalidFeedback, CLabel, CModal, CModalBody, CModalFooter,
    CModalHeader, CModalTitle, CRow, CSwitch
} from "@coreui/react";
import React, {useEffect, useRef, useState} from "react";
import CIcon from "@coreui/icons-react";
import {
    saveProduct, testJiraApiConnection, testSonarqubeApiConnection, triggerReleaseInfoCollection, updateProduct
} from "../../utils/product-service";
import {useUserContext} from "../../context/UserContextProvider";
import {renderInputHelper} from "../common/FormHelper";
import {Loader} from "../common/Loader";
import config from "../../config/config.json";
import {useHistory} from "react-router-dom";

// type: "add" | "modify"; product: Product | undefined
// If type is "add", then no product prop is required, otherwise pass product prop as well
const AddProductModal = ({state, setState, type, product}) => {

    const [name, setName] = useState("");
    const [generateNewToken, setGenerateNewToken] = useState(false);

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

    const [accordion, setAccordion] = useState(-1);

    // Context
    const {getUserInfo, setUserInfo} = useUserContext();
    const history = useHistory();

    useEffect(() => {
        const isModifyingModal = product && type === "modify";
        if (isModifyingModal) {
            setName(product.name);
            setSqBaseUrl(product.sonarqubeInfo?.baseUrl);
            setSqComponentName(product.sonarqubeInfo?.componentName);
            setSqApiToken(product.sonarqubeInfo?.token);
            setJiraBaseUrl(product.jiraInfo?.baseUrl);
            setJiraBoardId(product.jiraInfo?.boardId);
            setJiraUserEmail(product.jiraInfo?.userEmail);
            setJiraApiToken(product.jiraInfo?.token);

            setSonarqubeEnabled(false);
            setJiraEnabled(false);
        }
    }, [product])

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

    const updateButtonEnabled = () => {
        return name !== "" && nameValid()
            && (jiraDataExists() && product.jiraInfo || !product.jiraInfo)
            && (sqDataExists() && product.sonarqubeInfo || !product.sonarqubeInfo);
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

    const refresh = () => {
        window.location.reload();
    }

    const getUpdateRequestBody = () => {
        const requestBody = {
            generateNewToken: generateNewToken,
            product: {
                id: product.id,
                name: name,
                token: product.token
            }
        };

        if (sonarqubeEnabled) {
            requestBody.product.sonarqubeInfo = {
                baseUrl: sqBaseUrl,
                componentName: sqComponentName,
                token: sqApiToken
            };
        }

        if (jiraEnabled) {
            requestBody.product.jiraInfo = {
                baseUrl: jiraBaseUrl,
                boardId: jiraBoardId,
                userEmail: jiraUserEmail,
                token: jiraApiToken
            };
        }
        return requestBody;
    }

    const getSaveRequestBody = () => {
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
        return requestBody;
    }

    const save = () => {
        const requestBody = getSaveRequestBody();
        setProductSaving(true);
        saveProduct(getUserInfo().jwt, requestBody)
            .then(res => {
                setSavedProduct(res);
            })
            .catch(err => console.error(err))// TODO show error message on failure
            .finally(() => {
                setProductSaving(false);
                setAccordion(2);
            });
    }

    const update = () => {
        const requestBody = getUpdateRequestBody();
        setProductSaving(true);
        updateProduct(getUserInfo().jwt, requestBody, product.id)
            .then(res => {
                setSavedProduct(res);
            })
            .catch(err => console.error(err))// TODO show error message on failure
            .finally(() => {
                setProductSaving(false);
                setAccordion(2);
            });
    }

    const renderLoader = (disableLoaderText) => {
        return <Loader disableLoaderText={disableLoaderText || true} className="text-center"/>;
    };

    const isModifyingModal = product && type === "modify";
    const messagingUrl = isModifyingModal && !savedProduct
                         ? `${config.pqdApiBaseUrl}/messaging/trigger?productId=${product?.id}`
                         : `${config.pqdApiBaseUrl}/messaging/trigger?productId=${savedProduct?.id}`;
    const token = isModifyingModal && !savedProduct
                  ? product.token
                  : savedProduct?.token;
    const encryptedToken = btoa(token + ":");

    const authorizationHeaderValue = "Basic " + encryptedToken;

    const renderRequestExamples = () => {
        return <CCard className="mb-0">
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
        </CCard>;
    };

    const renderRequestInstructions = () => {
        return <CCard className="mb-0">
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
        </CCard>;
    };

    const renderSavedProductDetails = () => {
        const prod = product && !savedProduct ? product : savedProduct;
        return <CCard className="mb-0">
            <CCardHeader id="headingThree">
                <CButton
                    block
                    color="link"
                    className="text-left m-0 p-0"
                    onClick={() => setAccordion(accordion === 2 ? null : 2)}
                >
                    <h5 className="m-0 p-0">
                        <CIcon name={accordion !== 2 ? "cil-chevron-bottom" : "cil-chevron-top"}/>
                        {" "}Specified tools info
                    </h5>
                </CButton>
            </CCardHeader>
            <CCollapse show={accordion === 2}>
                <CCardBody>
                    {prod?.sonarqubeInfo
                     ? <>
                         <h6>Sonarqube</h6>
                         <CRow>
                             <CCol xs="4">
                                 Base url:
                             </CCol>
                             <CCol xs="8">
                                 {prod.sonarqubeInfo?.baseUrl}
                             </CCol>
                         </CRow>
                         <CRow>
                             <CCol xs="4">
                                 <p>Component:</p>
                             </CCol>
                             <CCol xs="8">
                                 {prod.sonarqubeInfo?.componentName}
                             </CCol>
                         </CRow>
                         <CRow>
                             <CCol xs="4">
                                 <p>Token:</p>
                             </CCol>
                             <CCol xs="8">
                                 {prod.sonarqubeInfo?.token}
                             </CCol>
                         </CRow>
                         <br/>
                     </>
                     : null
                    }
                    {prod?.jiraInfo
                     ? <>
                         <h6>Jira</h6>
                         <CRow>
                             <CCol xs="4">
                                 Base url:
                             </CCol>
                             <CCol xs="8">
                                 {prod.jiraInfo?.baseUrl}
                             </CCol>
                         </CRow>
                         <CRow>
                             <CCol xs="4">
                                 Board id:
                             </CCol>
                             <CCol xs="8">
                                 {prod.jiraInfo?.boardId}
                             </CCol>
                         </CRow>
                         <CRow>
                             <CCol xs="4">
                                 <p>Token:</p>
                             </CCol>
                             <CCol xs="8">
                                 {prod.jiraInfo?.token}
                             </CCol>
                         </CRow>
                     </>
                     : null
                    }
                </CCardBody>
            </CCollapse>
        </CCard>
    }

    return (
        <CModal
            show={state}
            onClose={() => setState(!state)}
            color={isModifyingModal ? "warning" : "info"}>

            <CModalHeader closeButton>
                <CModalTitle>
                    {isModifyingModal
                     ? <><CIcon name="cil-settings"/> {"Update Product"}</>
                     : <><CIcon name="cil-library-add"/> Add New Product</>}
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CCollapse show={savedProduct && !productSaving}>
                    <CAlert color="success">
                        <h4 className="alert-heading">{savedProduct?.name} {isModifyingModal ? "updated" : "saved"} successfully!</h4>
                        <hr/>
                        {isModifyingModal
                        ? <p>
                             The product has been updated successfully. To trigger information collection from the tools, make a post request to
                             the{" "}
                             following url:
                         </p>
                        : <p>
                             The product has been saved successfully and is ready to receive information from the{" "}
                             specified tools. To trigger information collection from the tools, make a post request to
                             the{" "}
                             following url:
                         </p>}


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

                    <p>You can trigger the release info collection with the button below. The request is
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
                            {renderSavedProductDetails()}
                            {renderRequestInstructions()}
                            {renderRequestExamples()}
                        </div>
                    </CCardBody>

                    {isModifyingModal
                    ? <CAlert color="info">
                         <b>Refresh</b> the page to load the updated information.
                         <CButton color="primary"
                                  variant="ghost"
                                  block
                                  onClick={() => refresh()}>
                             <CIcon name="cil-reload"/> Refresh Now
                         </CButton>
                     </CAlert>
                    : <CAlert color="info">
                         <b>Log Out</b> and <b>Log In</b> to see the newly added product in the product list. If you have
                                        read the information above, then
                         <CButton color="primary"
                                  variant="ghost"
                                  block
                                  onClick={() => logOut()}>
                             <CIcon name="cil-account-logout"/> Log Out Now
                         </CButton>
                     </CAlert>}


                </CCollapse>
                <CCollapse show={productSaving}>
                    {renderLoader(false)}
                </CCollapse>
                <CCollapse show={!productSaving && !savedProduct}>
                    <CForm>
                        {isModifyingModal
                         ? <>
                             <p>
                                 To trigger information collection from the tools, make a post request
                                 to the following url:
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
                             {renderSavedProductDetails()}
                             {renderRequestInstructions()}
                             {renderRequestExamples()}
                             <br/>
                             <hr/>

                         </>
                         : null}


                            {isModifyingModal
                             ? <><h5>Update Product Info</h5><br/></>
                             : <p className="text-muted">Add new product and start collecting information from Sonarqube and Jira</p>}


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

                        {isModifyingModal
                         ? <CCardBody>
                             <CFormGroup row>
                                     <CFormGroup variant="custom-checkbox" inline>
                                         <CInputCheckbox custom id="inline-radio1" name="inline-radios" value="option1" onChange={() => setGenerateNewToken(true)}/>
                                         <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Generate New Token</CLabel>
                                     </CFormGroup>
                             </CFormGroup>
                         </CCardBody>
                         : null}

                        <CRow>
                            <CCol xs="10">
                                <h5>Sonarqube</h5>
                            </CCol>
                            <CCol xs="2">
                                {isModifyingModal
                                ? null
                                :<CRow className="text-right">
                                     <CSwitch className={'mx-1 cil-align-right'} shape={'pill'}
                                              color={isModifyingModal ? "warning" : "info"}
                                              labelOn={'\u2713'}
                                              labelOff={'\u2715'}
                                              defaultChecked onChange={() => setSonarqubeEnabled(!sonarqubeEnabled)}/>
                                 </CRow>}
                            </CCol>
                        </CRow>

                        <CCollapse show={sonarqubeEnabled || isModifyingModal && product.sonarqubeInfo}>
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
                             : <CButton disabled={!(sonarqubeEnabled && sqDataExists() || sqDataExists() && product.sonarqubeInfo)}
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
                                {isModifyingModal
                                ? null
                                : <CRow className="text-right">
                                     <CSwitch className={'mx-1'} shape={'pill'}
                                              color={isModifyingModal ? "warning" : "info"} labelOn={'\u2713'}
                                              labelOff={'\u2715'}
                                              defaultChecked onChange={() => setJiraEnabled(!jiraEnabled)}/>
                                 </CRow>}
                            </CCol>
                        </CRow>

                        <CCollapse show={jiraEnabled || isModifyingModal && product.jiraInfo}>
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
                             : <CButton disabled={!(jiraEnabled && jiraDataExists() || jiraDataExists() && product.jiraInfo)}
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
                     {isModifyingModal
                     ? <CButton color="warning"
                                disabled={!updateButtonEnabled()}
                                onClick={() => update()}>
                          <CIcon name="cil-save"/> Update
                      </CButton>
                     : <CButton color="info"
                                   disabled={!saveButtonEnabled()}
                                   onClick={() => save()}>
                              <CIcon name="cil-save"/> Save Product
                          </CButton>}
                 </>
                 : <>
                     {isModifyingModal
                     ? null
                     : <CButton color="danger"
                                onClick={() => resetModal()}>
                          <CIcon name="cil-x-circle"/> Reset Modal
                      </CButton>}
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
