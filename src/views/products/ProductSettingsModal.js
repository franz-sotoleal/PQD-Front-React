import {CModal, CModalHeader, CModalTitle} from "@coreui/react";
import React from "react";
import CIcon from "@coreui/icons-react";

export const ProductSettingsModal = ({state, setState}) => {

    return (
        <CModal
            show={state}
            onClose={() => setState(!state)}
            color="warning"
        >
            <CModalHeader closeButton>
                <CModalTitle><CIcon name="cil-settings"/> Product Settings</CModalTitle>
            </CModalHeader>

        </CModal>
    )
};

export default ProductSettingsModal;
