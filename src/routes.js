import React from 'react';

const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'));

const Charts = React.lazy(() => import('./views/charts/Charts'));
const Products = React.lazy(() => import('./views/products/Products'));
const ProductList = React.lazy(() => import('./views/products/ProductList'));
const ProductDashboard = React.lazy(() => import('./views/products/Dashboard'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/products/all', exact: true, name: 'List view', component: ProductList },
  { path: '/products/:id', exact: true, name: 'Detail view', component: ProductDashboard },
  { path: '/products', name: 'Products', component: Products },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
  { path: '/charts', name: 'Charts', component: Charts },
];

export default routes;
