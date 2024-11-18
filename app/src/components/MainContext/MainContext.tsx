"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const MainContext = React.createContext({
  uid: null as string | null,
  wallets: {} as any,
  setWallet: (walletName: string, walletData: any) => {},
});

export default function MainContextProvider({ children }: any) {
  const [wallets, setWallets] = React.useState({});
  const [uid, setUid] = useState<string | null>(null);

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

  return (
    <MainContext.Provider
      value={{
        uid,
        wallets,
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
