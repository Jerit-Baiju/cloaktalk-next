'use client';

import { AccessControlProvider } from "@/contexts/AccessControlContext";
import { useAuth } from "@/contexts/AuthContext";

// Component to provide access control context with auth data
export function AccessControlWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tokenData } = useAuth();
  
  return (
    <AccessControlProvider isAuthenticated={isAuthenticated} tokenData={tokenData}>
      {children}
    </AccessControlProvider>
  );
}
