import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Payments from "./pages/Payments/Payments";
import Users from "./pages/Users/Users";
import Customers from "./pages/Customers/Customers";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports/Reports";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Invoice from "./pages/Invoice/Invoice";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
             <Route path="/login" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/customers"element={<Customers />}/>
                <Route path="/customers/:customerName" element={<CustomerDetails />}/>
                <Route path="/orders/:id/invoice" element={<Invoice />} />
            </Route>
        </Routes>
    );
}

export default App;