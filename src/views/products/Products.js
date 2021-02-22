import React from 'react'
import {Redirect, Route, Switch} from "react-router-dom";
import Dashboard from "./Dashboard";
import ProductList from "./ProductList";

const Products = () => {

    const renderProducts = () => {
        return (
            <>
                <Switch>
                    <Route exact path="/products/all" component={ProductList} />
                    <Route path="/products/:id" component={Dashboard} />
                    <Redirect from="/products" to="/products/all" />
                    <Redirect from="/products/" to="/products/all" />
                </Switch>
            </>
        )
    }

    return renderProducts();

}

export default Products
