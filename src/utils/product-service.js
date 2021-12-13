import {httpGet, httpPost, httpPut, httpRequestWithBasicAuth} from "./http-request";
import config from "../config/config.json";

export const getProducts = (jwt) => {
    return fetchProducts(jwt)
        .then(products => {
            const productWithReleaseInfoList = [];
            return Promise.all(products.map(async (product) => {
                const productWithReleaseInfo = product;
                await fetchReleaseInfo(product.id, jwt)
                    .then(releaseInfo => {
                        productWithReleaseInfo.id = product.id;
                        releaseInfo.sort((a, b) => a.id - b.id);
                        productWithReleaseInfo.releaseInfo = releaseInfo;
                        productWithReleaseInfoList.push(productWithReleaseInfo);
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })).then(() => {
                productWithReleaseInfoList.sort((a, b) => a.id - b.id);
                return productWithReleaseInfoList;
            })
        })
}

export const saveProduct = (jwt, body) => {
    return httpPost(`${config.pqdApiBaseUrl}/product/save`, body, jwt)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK", body: res.json()};
            } else {
                return {status: "Error", body: res.json()};
            }
        })
        .then(data => {
            if (data.status === "OK") {
                return data.body;
            } else {
                throw new Error("Saving product failed");
            }
        });
}

export const updateProduct = (jwt, body, id) => {
    return httpPut(`${config.pqdApiBaseUrl}/product/${id}/update`, body, jwt)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK", body: res.json()};
            } else {
                return {status: "Error", body: res.json()};
            }
        })
        .then(data => {
            if (data.status === "OK") {
                return data.body;
            } else {
                throw new Error("Saving product failed");
            }
        });
}

export const triggerReleaseInfoCollection = (url, token) => {
    return httpRequestWithBasicAuth("POST", url, {}, token)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK"};
            } else {
                return {status: "Error"};
            }
        });
}

export const testJenkinsApiConnection = (jwt, body) => {
    return testConnection("jenkins", body, jwt);
}

export const testSonarqubeApiConnection = (jwt, body) => {
    return testConnection("sonarqube", body, jwt);
}

export const testJiraApiConnection = (jwt, body) => {
    return testConnection("jira", body, jwt);
}

const testConnection = (toolName, body, jwt) => {
    return httpPost(`${config.pqdApiBaseUrl}/product/test/${toolName}/connection`, body, jwt)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK", body: res.json()};
            } else {
                return {status: "Error", body: res.json()};
            }
        }).then(data => {
            
                return data.body;
       
        })
}

const fetchProducts = (jwt) => {
    return httpGet(`${config.pqdApiBaseUrl}/product/get/all`, jwt)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK", body: res.json()};
            } else {
                return {status: "Error", body: res.json()};
            }
        })
        .then(data => {
            if (data.status === "OK") {
                return data.body;
            } else {
                throw new Error("Fetching products failed");
            }
        })
}

const fetchReleaseInfo = async (productId, jwt) => {
    return httpGet(`${config.pqdApiBaseUrl}/product/${productId}/releaseInfo`, jwt)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK", body: res.json()};
            } else {
                return {status: "Error", body: res.json()};
            }
        })
        .then(data => {
            if (data.status === "OK") {
                return data.body;
            } else {
                throw new Error(`Fetching release info for product with id ${productId} failed`)
            }
        })
}
