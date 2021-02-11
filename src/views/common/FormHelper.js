import {CFormText} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import React from "react";

export const renderInputHelper = (message, type) => {
    let cName = "alert-danger"
    let cIcon = "cil-warning"

    if (type === "success") {
        cName = "alert-success"
        cIcon = "cil-check-circle"
    }

    return <CFormText className={cName}>
            <div style={{
                paddingLeft: "10px",
                paddingBottom: "5px",
                paddingTop: "5px"
            }}>
                <CIcon name={cIcon}/> {message}
            </div>
        </CFormText>;
}
