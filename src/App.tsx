import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/clients/Clients';
import ClientDetail from './pages/clients/ClientDetail';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import Budgets from './pages/budgets/Budgets';
import BudgetDetail from './pages/budgets/BudgetDetail';
import BudgetEditor from './pages/budgets/BudgetEditor';
import Invoices from './pages/invoices/Invoices';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import Calendar from './pages/calendar/Calendar';
import Materials from './pages/materials/Materials';
import Suppliers from './pages/suppliers/Suppliers';
import Tasks from './pages/tasks/Tasks';
import Settings from './pages/settings/Settings';
import Login from './pages/auth/Login';
import AuthRoute from './components/auth/AuthRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthRoute>
        <MainLayout />
      </AuthRoute>
    ),
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/clients',
        element: <Clients />,
      },
      {
        path: '/clients/:id',
        element: <ClientDetail />,
      },
      {
        path: '/projects',
        element: <Projects />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetail />,
      },
      {
        path: '/budgets',
        element: <Budgets />,
      },
      {
        path: '/budgets/:id',
        element: <BudgetDetail />,
      },
      {
        path: '/budgets/:id/edit',
        element: <BudgetEditor />,
      },
      {
        path: '/invoices',
        element: <Invoices />,
      },
      {
        path: '/invoices/:id',
        element: <InvoiceDetail />,
      },
      {
        path: '/calendar',
        element: <Calendar />,
      },
      {
        path: '/materials',
        element: <Materials />,
      },
      {
        path: '/suppliers',
        element: <Suppliers />,
      },
      {
        path: '/tasks',
        element: <Tasks />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;