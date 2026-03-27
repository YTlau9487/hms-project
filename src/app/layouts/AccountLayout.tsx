import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export const AccountLayout = () => {
  const { user } = useAuth();

  // Route guard: redirect to login if not authenticated or not a customer
  if (!user || user.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};