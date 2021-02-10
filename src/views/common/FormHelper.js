import {CFormText} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import React from "react";

export const renderInputHelper = (message) => {
    return <CFormText className="alert-danger">
            <div style={{
                paddingLeft: "10px",
                paddingBottom: "5px",
                paddingTop: "5px"
            }}>
                <CIcon name="cil-warning"/> {message}
            </div>
        </CFormText>
}
