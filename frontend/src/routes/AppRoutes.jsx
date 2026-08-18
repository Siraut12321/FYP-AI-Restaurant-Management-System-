import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import PageLayout from '../layout/PageLayout';
import AdminLayout from '../admin/components/AdminLayout/AdminLayout';
import Spinner from '../components/Loading/Spinner';
import ProtectedRoute from './ProtectedRoute';

/* ── Customer pages ── */
const Home           = lazy(() => import('../pages/Home/Home'));
const Menu           = lazy(() => import('../pages/Menu/Menu'));
const About          = lazy(() => import('../pages/About/About'));
const Login          = lazy(() => import('../pages/Login/Login'));
const Register       = lazy(() => import('../pages/Register/Register'));
const Cart           = lazy(() => import('../pages/Cart/Cart'));
const Profile        = lazy(() => import('../pages/Profile/Profile'));
const OrderHistory   = lazy(() => import('../pages/OrderHistory/OrderHistory'));
const OrderDetails   = lazy(() => import('../pages/OrderDetails/OrderDetails'));
const Favorites      = lazy(() => import('../pages/Favorites/Favorites'));

/* ── Admin pages ── */
const Dashboard      = lazy(() => import('../pages/Dashboard/Dashboard'));
const Orders         = lazy(() => import('../pages/Orders/Orders'));
const Customers      = lazy(() => import('../pages/Customers/Customers'));
const MenuManagement = lazy(() => import('../pages/AdminMenu/MenuManagement'));
const Settings       = lazy(() => import('../pages/Settings/Settings'));
const Reviews        = lazy(() => import('../pages/Reviews/Reviews'));
const Analytics      = lazy(() => import('../pages/Analytics/Analytics'));
const AiOrders       = lazy(() => import('../pages/AiOrders/AiOrders'));

function AppRoutes() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* ── Customer routes — wrapped in PageLayout (Navbar + Footer) ── */}
          <Route element={<PageLayout />}>
            <Route path='/'         element={<Home />} />
            <Route path='/menu'     element={<Menu />} />
            {/* /deals route removed (dummy placeholder) */}
            <Route path='/about'    element={<About />} />
            <Route path='/cart'     element={<Cart />} />
            <Route path='/login'    element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/orders' element={<OrderHistory />} />
              <Route path='/orders/:id' element={<OrderDetails />} />
              <Route path='/favorites' element={<Favorites />} />
            </Route>
          </Route>

          {/* ── Admin routes — protected, only admin/staff ── */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route element={<AdminLayout />}>
              <Route path='/admin/dashboard' element={<Dashboard />} />
              <Route path='/admin/orders'    element={<Orders />} />
              <Route path='/admin/customers' element={<Customers />} />
              <Route path='/admin/menu'      element={<MenuManagement />} />
              <Route path='/admin/settings'  element={<Settings />} />
              <Route path='/admin/reviews'   element={<Reviews />} />
              <Route path='/admin/analytics' element={<Analytics />} />
              <Route path='/admin/ai-orders' element={<AiOrders />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default AppRoutes;
