import React, {useState} from "react";

import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCollapse,
    CListGroup,
    CListGroupItem,
    CTooltip
} from "@coreui/react";

import CIcon from "@coreui/icons-react";

function StatusBadge({text, color}) {
    return <CBadge style={{fontSize: "small"}} shape="rounded-pill" color={color}>{text}</CBadge>;
}

export default function JenkinsDetails({data}) {

    const [collapseIndex, setCollapseIndex] = useState([0]);


    const getBadge = (status) => {
        switch (status) {
            case "blue":
                return <StatusBadge color="success" text="Success"/>
            case "red":
                return <StatusBadge color="danger" text="Failure"/>
            default:
                return <StatusBadge color="warning" text="Unknown"/>
        }
    }

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

    function msToTime(ms) {
        let seconds = (ms / 1000).toFixed(1);
        let minutes = (ms / (1000 * 60)).toFixed(1);
        let hours = (ms / (1000 * 60 * 60)).toFixed(1);
        let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (seconds < 60) return seconds + " sec";
        else if (minutes < 60) return minutes + " min";
        else if (hours < 24) return hours + " hrs";
        else return days + " days"
    }

    return (
        <CCard>
            <CCardHeader>
                <CIcon name="cil-rss"/> Jenkins
                <small> build info</small>
            </CCardHeader>
            <CCardBody>
                <CListGroup>
                    {data.map((info, index) =>
                        <CCard className="mb-0" key={index}>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                                <CButton
                                    color="link"
                                    className="text-left m-0 p-0"
                                    onClick={() => setCollapseIndex(collapseIndex.includes(index) ? collapseIndex.filter((item) => item !== index) : [...collapseIndex, index])}
                                >
                                    <h5 className="m-0 p-0">
                                        {info.name}
                                    </h5>
                                </CButton>
                                {getBadge(info.status)}
                            </CListGroupItem>
                            <CCollapse show={collapseIndex.includes(index)}>
                                <CListGroup>
                                    <CListGroupItem>
                                        <p className="m-0 p-0">
                                            Description: {info.description || "-"}
                                        </p>
                                    </CListGroupItem>
                                    <CListGroupItem>
                                        <p className="m-0 p-0">
                                            Last build: {getTimeFromTimestampWithoutClock(info.lastBuild)}
                                        </p>
                                    </CListGroupItem>
                                    <CListGroupItem>
                                        <p className="m-0 p-0">
                                            Build score: {info.buildScore}/100
                                        </p>
                                        <p className="m-0 p-0">
                                            {info.buildReport}
                                        </p>
                                    </CListGroupItem>


                                    <CListGroupItem color="light">The four key metrics</CListGroupItem>
                                    <CListGroupItem>
                                        <CTooltip
                                            content="The number of deployments/releases in a certain period"
                                            placement="left"
                                        >

                                            <p className="m-0 p-0">Deployment frequency: {info?.deploymentFrequency}</p>
                                        </CTooltip>

                                    </CListGroupItem>
                                    <CListGroupItem>
                                        <CTooltip
                                            content="The time it takes to go from code committed to code successfully running in production"
                                            placement="left"
                                        >
                                            <p className="m-0 p-0"> Lead Time for
                                                Change: {msToTime(info?.leadTimeForChange) || "-"}</p>
                                        </CTooltip>
                                    </CListGroupItem>
                                    <CListGroupItem>
                                        <CTooltip
                                            content="How long it takes to restore service from an incident from the time the incident occurs"
                                            placement="left"
                                        >
                                            <p className="m-0 p-0">Time to Restore
                                                Service: {msToTime(info?.timeToRestoreService) || "-"}</p>
                                        </CTooltip>
                                    </CListGroupItem>
                                    <CListGroupItem>
                                        <CTooltip
                                            content="The percentage of changes for the application or service which results in degraded service or subsequently required remediation"
                                            placement="left"
                                        >
                                            <p className="m-0 p-0">Change failure
                                                rate: {info?.changeFailureRate.toFixed(2)}%</p>
                                        </CTooltip>
                                    </CListGroupItem>

                                </CListGroup>
                            </CCollapse>
                        </CCard>
                    )}

                </CListGroup>
            </CCardBody>
        </CCard>
    );
}
