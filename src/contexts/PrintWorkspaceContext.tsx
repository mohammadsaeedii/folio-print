"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type PrintWorkspaceValue = {
  isUncontrolledDocument?: boolean;
  logo?: string | null;
  companyName?: string | null;
};

const DEFAULT_WORKSPACE: PrintWorkspaceValue = {
  isUncontrolledDocument: false,
  logo: undefined,
  companyName: undefined,
};

const PrintWorkspaceContext =
  createContext<PrintWorkspaceValue>(DEFAULT_WORKSPACE);

export type PrintWorkspaceProviderProps = {
  value?: PrintWorkspaceValue;
  children: ReactNode;
};

/**
 * Optional branding / document-control context for print chrome.
 * Without a provider, defaults are used (controlled document, no company/logo).
 */
export function PrintWorkspaceProvider({
  value,
  children,
}: PrintWorkspaceProviderProps) {
  const resolved = useMemo(
    () => ({
      isUncontrolledDocument: value?.isUncontrolledDocument ?? false,
      logo: value?.logo,
      companyName: value?.companyName,
    }),
    [value?.isUncontrolledDocument, value?.logo, value?.companyName],
  );

  return (
    <PrintWorkspaceContext.Provider value={resolved}>
      {children}
    </PrintWorkspaceContext.Provider>
  );
}

export function usePrintWorkspace(): PrintWorkspaceValue {
  return useContext(PrintWorkspaceContext);
}
