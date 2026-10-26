import React from 'react';
import { Toaster } from 'react-hot-toast'; // toast notifications
import { useTheme } from './context/ThemeContext'; // Dark/Light Mode
import AuthProvider from './context/auth-provider'; // Manages login and user status
import { DashboardProvider } from './context/DashboardContext';
import { SidebarProvider } from './context/SidebarContext'; // Manages the open/close status of the sidebar
import { ThemeProvider } from './context/ThemeContext';
import HomePage from "./pages/HomePage";
import Vet from './pages/vet/Vet'
import Nutritions from './pages/Nutritions'
import CleaningPage from './pages/employee/CleaningPage'
import SystemPage from './pages/admin/SystemPage'
import PreventionPage from './pages/vet/PreventionPage'
import FuelPage from './pages/FuelPage'
import ResourcePage from './pages/ResourcePage'
import FoodPage from './pages/FoodPage'
import ActivityPage from './pages/ActivityPage'
// Signin + Signup
import SignupPage from './pages/SignupPage'
import SigninPage from './pages/SigninPage'


import PricingPage from './pages/PricingPage'
import FuelReportsPage from './pages/FuelReportsPage';
import MedicalReportsPage from './pages/MedicalReportsPage';
import HealthSafetyReportsPage from './pages/HealthSafetyReportsPage';
import ProductivityReportsPage from './pages/manager/ProductivityReportsPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "tailwindcss";
import Employee from './pages/admin/Employee';
import SanitationReportsPage from './pages/SanitationReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import RoleBasedHome from './pages/RoleBasedHome';
import DashboardFormPage from './pages/DashboardFormPage';
import FeedingPlansPage from './pages/vet/FeedingPlansPage';
import PackingOperationsPage from './pages/PackingOperationsPage'
import PackingReportsPage from './pages/PackingReportsPage'
import FoodCunsumptionPage from './pages/FoodCunsumptionPage'
import FoodConsumptionReportsPage from './pages/food_supplier/FoodConsumptionReportsPage'
import FuelConsumptionPage from './pages/fuel_supplier/FuelConsumptionPage';
import FuelConsumptionReportsPage from './pages/fuel_supplier/FuelConsumptionReportsPage'
import MedicalRequestPage from './pages/MedicalRequestPage';
import FoodSupplierProfilePage from './pages/food_supplier/FoodSupplierProfilePage';
import FuelSupplierSettingsPage from './pages/fuel_supplier/FuelSupplierSettingsPage';
import FuelSuppliersAvailabilityPage from './pages/FuelSuppliersAvailabilityPage';
import FuelInvoicesPage from './pages/fuel_supplier/FuelInvoicesPage';
import FuelSupplier from './pages/fuel_supplier/FuelSupplier';
import PriceHistoryPage from './pages/food_supplier/PriceHistoryPage';
import AttendancePage from './pages/AttendancePage';
import EmployeeCheckInGate from './components/EmployeeCheckInGate';
import MortalityPage from './pages/vet/MortalityPage';
import TodoPage from './pages/employee/TodoPage'
import Chatbot from './components/Chatbot';
const AppToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-left"
      reverseOrder={false}
      toastOptions={{
        duration: 4000, // 4s
        style: {
          background: isDark ? '#1f2937' : '#fff',
          color:      isDark ? '#f1f5f9' : '#374151',
          border:     isDark ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        success: { icon: '🐔', style: { border: '1px solid #10b981' } },
        error:   { icon: '🐓', style: { border: '1px solid #ef4444' } },
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider> 
      <AppToaster />
      {/* AuthProvider before BrowserRouter: ProtectedRoute and EmployeeCheckInGate need authentication status */}
      <AuthProvider>
        <DashboardProvider>
        <SidebarProvider>
        <BrowserRouter>
          <EmployeeCheckInGate>
          <Routes>
          {/* Public pages - available to everyone */}
          <Route path="/" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/sign-in" element={<GuestRoute><SigninPage /></GuestRoute>} />

          {/* Home page by role - very important */}
          <Route path="/home" element={<RoleBasedHome />} />
    
          {/* Protected pages - require specific permissions */}
          <Route 
            path="/dashbourd" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
                <HomePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/employee" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Employee />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/activity-logs" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <ActivityPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/health-checks" 
            element={
              <ProtectedRoute allowedRoles={['vet']}>
                <Vet />
              </ProtectedRoute>
            } 
          />



<Route 
            path="/mortality-reports" 
            element={
              <ProtectedRoute allowedRoles={['vet']}>
                <MortalityPage />
              </ProtectedRoute>
            } 
          />



          <Route 
            path="/medication-requests" 
            element={
              <ProtectedRoute allowedRoles={['vet', 'manager']}>
                <MedicalRequestPage />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/packing-operations" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager']}>
                <PackingOperationsPage />
              </ProtectedRoute>
            } 
          />



          <Route 
            path="/todo-tasks" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <TodoPage />
              </ProtectedRoute>
            } 
          />






          <Route 
            path="/packing-reports" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager']}>
                <PackingReportsPage />
              </ProtectedRoute>
            } 
          />



          <Route
            path="/health-reports" 
            element={
              <ProtectedRoute allowedRoles={['vet', 'employee', 'manager']}>
                <MedicalReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/daily-feeding" 
            element={
              <ProtectedRoute allowedRoles={['food_supplier', 'manager']}>
                <Nutritions />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/food-supplier-profile"
            element={
              <ProtectedRoute allowedRoles={['food_supplier']}>
                <FoodSupplierProfilePage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/fuel-reports" 
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier', 'employee', 'manager']}>
                <FuelReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/hygiene-reports" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <CleaningPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/hygiene-docs" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager']}>
                <SanitationReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/prevention-plans" 
            element={
              <ProtectedRoute allowedRoles={['vet']}>
                <PreventionPage />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/feeding-plans" 
            element={
              <ProtectedRoute allowedRoles={['vet']}>
                <FeedingPlansPage />
              </ProtectedRoute>
            } 
          />


          <Route
            path="/general-feeding"
            element={
              <ProtectedRoute allowedRoles={['food_supplier', 'manager']}>
                <FoodCunsumptionPage />
              </ProtectedRoute>
            }
          />
            

           {/* <Route
            path="/food-supplier-profile"
            element={
              <ProtectedRoute allowedRoles={['food_supplier']}>
                <FoodSupplierPage/>
              </ProtectedRoute>
            }
          /> */}





          <Route
            path="/food-consumption"
            element={
              <ProtectedRoute allowedRoles={['manager', 'employee', 'admin']}>
                <FoodCunsumptionPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/general-feeding-reports" 
            element={
              <ProtectedRoute allowedRoles={['food_supplier']}>
                <FoodConsumptionReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/prevention-reports" 
            element={
              <ProtectedRoute allowedRoles={['vet', 'employee', 'manager']}>
                <HealthSafetyReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/resource-planning" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'employee']}>
                <ResourcePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/daily-data" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager']}>
                  <DashboardFormPage />
               
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/productivity-reports" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ProductivityReportsPage />
               
              </ProtectedRoute>
            } 
          />


          <Route
            path="/fuel"
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier', 'manager']}>
                <FuelPage />
              </ProtectedRoute>
            }
          />
            
 
<Route
            path="/fuel-supplier-profile"
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier']}>
                <FuelSupplier />
              </ProtectedRoute>
            }
          />



          <Route
            path="/fuel-supplier-settings"
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier']}>
                <FuelSupplierSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fuel-suppliers-availability"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <FuelSuppliersAvailabilityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fuel-invoices"
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier']}>
                <FuelInvoicesPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/fuel-consumption" 
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier']}>
                <FuelConsumptionPage />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/fuel-consumption-reports" 
            element={
              <ProtectedRoute allowedRoles={['fuel_supplier']}>
                <FuelConsumptionReportsPage />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/food" 
            element={
              <ProtectedRoute allowedRoles={['food_supplier', 'manager']}>
                <FoodPage />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/pricing"
            element={
              <ProtectedRoute allowedRoles={['employee', 'food_supplier']}>
                <PricingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/price-history"
            element={
              <ProtectedRoute allowedRoles={['food_supplier']}>
                <PriceHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance-history"
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          </Routes>
          </EmployeeCheckInGate>
           <Chatbot/>
        </BrowserRouter>
        </SidebarProvider>
        </DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
