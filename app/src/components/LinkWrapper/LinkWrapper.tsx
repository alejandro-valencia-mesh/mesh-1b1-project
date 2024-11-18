import React, { createContext, useContext, useEffect, useRef } from "react";
import {
  Link,
  LinkPayload,
  TransferFinishedPayload,
  createLink,
} from "@meshconnect/web-link-sdk";
import { MainContext } from "../MainContext/MainContext";

export const LinkContext = createContext({
  authenticate: (payload: any) => {},
});

export default function LinkWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const meshLinkRef = useRef<any>(null);
  const { uid, setWallet } = useContext(MainContext);

  useEffect(() => {
    if (!uid) return;

    meshLinkRef.current = createLink({
      clientId: uid,
      onIntegrationConnected: (payload) => {
        const accessToken = payload?.accessToken;
        if (!accessToken) return;

        // This would be in the cookies rather than localstorage
        localStorage.setItem(
          `accessToken-${accessToken?.brokerName}`,
          JSON.stringify(accessToken)
        );

        setWallet(accessToken?.brokerName, accessToken);
      },
      onTransferFinished: (transferData) => {
        console.log("PAYLOAD ON TRANSFER", transferData);
      },
    });
  }, [uid]);

  return (
    <LinkContext.Provider
      value={{
        authenticate: async (type: "Coinbase" | "Rainbow") => {
          const response = await fetch(
            `/api/link?integrationName=${type}&uid=${uid}`
          ).then((res) => res.json());
          if (response?.content?.linkToken)
            meshLinkRef.current.openLink(response?.content?.linkToken);
          else console.error("Error fetching link token");
        },
      }}
    >
      {children}
    </LinkContext.Provider>
  );
}
