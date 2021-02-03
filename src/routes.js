import React from 'react';

const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'));

const Charts = React.lazy(() => import('./views/charts/Charts'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
  { path: '/charts', name: 'Charts', component: Charts },
];

export default routes;
