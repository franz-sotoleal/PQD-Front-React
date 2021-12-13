import React from "react";

import {
    CBadge,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CListGroup,
    CListGroupItem,
    CRow,
    CLink,
    CTooltip
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

export default function SonarqubeDetails({data}) {
    const TOOLTIP_RELIABILITY = "ISO/IEC 25010: Degree to which a system, product or component performs specified functions under specified conditions for a specified period of time.";

    const TOOLTIP_SECURITY = "ISO/IEC 25010: Degree to which a product or system protects information and data so that persons or other products or systems have the degree of data access appropriate to their types and levels of authorization.";

    const TOOLTIP_MAINTAINABILITY = "ISO/IEC 25010: The degree of effectiveness and efficiency with which a product or system can be modified to improve it, correct it or adapt it to changes in environment, and in requirements. ";

    const TOOLTIP_QUALITY_LEVEL_GREEN = "Everything is good. Rating A shows that everything is perfect. Rating B shows minor issues but overall quality is good."

    const TOOLTIP_QUALITY_LEVEL_YELLOW = "Major issues. Ratings C and D indicate some major issues with the release."

    const TOOLTIP_QUALITY_LEVEL_RED = "Critical issues. Rating E indicates critical flaws with the release."

    const getRating = (rating) => {
        if (rating === 1.0) {
            return <>
                <CBadge color="success">A</CBadge>
                {" "}
                <CTooltip
                    content={TOOLTIP_QUALITY_LEVEL_GREEN}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </>;
        } else if (rating === 2.0) {
            return <>
                <CBadge color="success">B</CBadge>
                {" "}
                <CTooltip
                    content={TOOLTIP_QUALITY_LEVEL_GREEN}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </>;
        } else if (rating === 3.0) {
            return <>
                <CBadge color="warning">C</CBadge>
                {" "}
                <CTooltip
                    content={TOOLTIP_QUALITY_LEVEL_YELLOW}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </>;
        } else if (rating === 4.0) {
            return <>
                <CBadge color="warning">D</CBadge>
                {" "}
                <CTooltip
                    content={TOOLTIP_QUALITY_LEVEL_YELLOW}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </>;
        } else {
            return <>
                <CBadge color="danger">E</CBadge>
                {" "}
                <CTooltip
                    content={TOOLTIP_QUALITY_LEVEL_RED}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </>;
        }
    }

    const getDebtTime = (time) => {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        return hours > 0 ? hours + "h " + minutes + "min" : minutes + "min";
    };
    return (
        <CCard>
            <CCardHeader>
                <CIcon name="cil-rss"/> Sonarqube
                <small> master scan info</small>
            </CCardHeader>
            <CCardBody>
                <CListGroup>
                    <CListGroupItem color="light">Quality characteristics</CListGroupItem>
                    <CListGroupItem>
                        <CRow>
                            <CCol xs="5" md="3">
                                <div style={{fontSize: "medium"}}>Reliability</div>
                            </CCol>
                            <CCol xs="3" md="3">
                                Rating: {getRating(data?.reliabilityRating)}
                            </CCol>
                            <CCol xs="4" md="3">
                                <CIcon name="cil-bug"/> Bugs: {data?.reliabilityBugs}
                            </CCol>
                        </CRow>
                    </CListGroupItem>
                    <CListGroupItem>
                        <CRow>
                            <CCol xs="5" md="3">
                                <div style={{fontSize: "medium"}}>Security</div>
                            </CCol>
                            <CCol xs="3" md="3">
                                Rating: {getRating(data?.securityRating)}
                            </CCol>
                            <CCol xs="4" md="3">
                                <CIcon name="cil-lock-unlocked"/> Vulnerabilities:{" "}
                                {data?.securityVulnerabilities}
                            </CCol>
                        </CRow>
                    </CListGroupItem>
                    <CListGroupItem>
                        <CRow>
                            <CCol xs="5" md="3">
                                <div style={{fontSize: "medium"}}>Maintainability</div>
                            </CCol>
                            <CCol xs="3" md="3">
                                Rating: {getRating(data?.maintainabilityRating)}
                            </CCol>
                            <CCol xs="4" md="3">
                                <CIcon name="cil-burn"/> Code Smells:{" "}
                                {data?.maintainabilitySmells}
                            </CCol>
                            <CCol xs="4" md="3">
                                <CIcon name="cil-clock"/> Debt:{" "}
                                {getDebtTime(data?.maintainabilityDebt)}
                            </CCol>
                        </CRow>
                    </CListGroupItem>
                </CListGroup>
            </CCardBody>
        </CCard>
    );
}
