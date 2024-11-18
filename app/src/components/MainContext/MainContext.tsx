"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Alert {
  message: string;
  type: "success" | "error";
}

export const MainContext = React.createContext({
  uid: null as string | null,
  wallets: {} as any,
  alert: null as Alert | null,
  setWallet: (walletName: string, walletData: any) => {},
  setAlert: (value: Alert | null) => {},
});

export default function MainContextProvider({ children }: any) {
  const [wallets, setWallets] = React.useState({});
  const [uid, setUid] = useState<string | null>(null);
  const [alert, _setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const storedAlert = localStorage.getItem("alert");
    if (typeof storedAlert === "string") {
      setAlert(JSON.parse(storedAlert));
    }
  }, []);

  useEffect(() => {
    const storedUid = localStorage.getItem("uid");
    if (typeof storedUid === "string") {
      setUid(storedUid);
    } else {
      const newUid = uuidv4();
      localStorage.setItem("uid", newUid);
      setUid(newUid);
    }
  }, []);

  const setAlert = (value: Alert | null) => {
    if (value) {
      localStorage.setItem("alert", JSON.stringify(value));
    } else {
      localStorage.removeItem("alert");
    }

    _setAlert(value);
  };

  return (
    <MainContext.Provider
      value={{
        uid,
        wallets,
        alert,
        setAlert,
        setWallet: (walletName: string, walletData: any) => {
          setWallets((wallets: any) => {
            const val = wallets[walletName]
              ? { ...wallets[walletName], ...walletData }
              : walletData;
            return {
              ...wallets,
              [walletName]: val,
            };
          });
        },
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
