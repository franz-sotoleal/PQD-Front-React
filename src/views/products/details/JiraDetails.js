import React, {useState} from "react";

import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CCollapse,
    CLink,
    CListGroup,
    CListGroupItem,
    CRow,
    CTooltip,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

export default function JiraDetails({data}) {
    const [issueAccordion, setIssueAccordion] = useState([]);

    const getTimeFromTimestampWithoutClock = (timestamp) => {
        const date = new Date(timestamp);
        return (
            date.getDate() +
            ". " +
            date.toString().split(" ")[1] +
            " " +
            date.getFullYear()
        );
    };

    const onIssueAccordionClick = (sprintId) => {
        issueAccordion.includes(sprintId)
            ? setIssueAccordion(issueAccordion.filter((e) => e !== sprintId))
            : setIssueAccordion((prev) => [...prev, sprintId]);
    };

    return (
        <CCard>
            <CCardHeader>
                <CIcon name="cib-jira"/> Atlassian Jira
                <small> scrum sprint info</small>
            </CCardHeader>
            <CCardBody>
                <CListGroup>
                    <CListGroupItem color="light">
                        Active Sprint(s) <small>at the time of the release</small>
                    </CListGroupItem>

                    {data?.jiraSprints.map((sprint) => {
                        return (
                            <CListGroupItem>
                                <CRow>
                                    <CCol xs="4">
                                        {sprint.goal ? (
                                            <CTooltip content={sprint.goal}>
                                                <CLink>
                                                    <div style={{fontSize: "medium"}}>
                                                        {sprint.name}
                                                    </div>
                                                </CLink>
                                            </CTooltip>
                                        ) : (
                                            <div style={{fontSize: "medium"}}>{sprint.name}</div>
                                        )}
                                    </CCol>
                                    <CCol xs="5">
                                        <small>
                                            <CIcon name="cil-clock"/>{" "}
                                            {getTimeFromTimestampWithoutClock(sprint.start)} -{" "}
                                            {getTimeFromTimestampWithoutClock(sprint.end)}
                                        </small>
                                    </CCol>
                                    <CCol xs="3">
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={sprint.browserUrl}
                                        >
                                            <small>
                                                {"Open In Jira "}
                                                <CIcon name="cil-external-link"/>
                                            </small>
                                        </a>
                                    </CCol>
                                </CRow>

                                <hr/>

                                {sprint.issues.length > 0 ? (
                                    <CCard className="mb-0">
                                        <CCardHeader id="headingOne">
                                            <CButton
                                                block
                                                color="link"
                                                className="text-left m-0 p-0"
                                                onClick={() => onIssueAccordionClick(sprint.id)}
                                            >
                                                <h5 className="m-0 p-0">
                                                    <CIcon
                                                        name={
                                                            issueAccordion.includes(sprint.id)
                                                                ? "cil-chevron-bottom"
                                                                : "cil-chevron-top"
                                                        }
                                                    />{" "}
                                                    Issues in {sprint.name}
                                                </h5>
                                            </CButton>
                                        </CCardHeader>
                                        <CCollapse show={issueAccordion.includes(sprint.id)}>
                                            <CCardBody>
                                                {sprint.issues.map((issue) => {
                                                    return (
                                                        <CListGroup accent>
                                                            <CListGroupItem>
                                                                <a
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    href={issue.browserUrl}
                                                                >
                                                                    <img
                                                                        alt="icon"
                                                                        src={issue.fields.issueType.iconUrl}
                                                                    />{" "}
                                                                    {issue.key}{" "}
                                                                    <small>
                                                                        {"Open In Jira "}
                                                                        <CIcon name="cil-external-link"/>
                                                                    </small>
                                                                </a>
                                                            </CListGroupItem>
                                                        </CListGroup>
                                                    );
                                                })}
                                            </CCardBody>
                                        </CCollapse>
                                    </CCard>
                                ) : null}
                            </CListGroupItem>
                        );
                    })}
                </CListGroup>
            </CCardBody>
        </CCard>
    );
}
