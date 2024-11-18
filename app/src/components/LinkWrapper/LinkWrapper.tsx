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
  openLink: (linkToken: string, auth: string) => {},
});

export default function LinkWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const meshLinkRef = useRef<any>(null);
  const { uid, setWallet, setAlert } = useContext(MainContext);

  const onTransferFinished = (transferData: TransferFinishedPayload) => {
    const message = `Transfer finished: ${transferData.amount} USD worth of ${transferData.symbol}, it might take a while to reflect in your account`;
    setAlert({
      message,
      type: "success",
    });
  };

  const onIntegrationConnected = (payload: LinkPayload) => {
    const accessToken = payload?.accessToken;
    if (!accessToken) return;

    // This would be in the cookies rather than localstorage
    localStorage.setItem(
      `accessToken-${accessToken?.brokerName}`,
      JSON.stringify(accessToken)
    );

    setWallet(accessToken?.brokerName, accessToken);
  };

  useEffect(() => {
    if (!uid) return;

    meshLinkRef.current = createLink({
      clientId: uid,
      onIntegrationConnected,
      onTransferFinished,
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
        openLink: async (linkToken: string, auth: string) => {
          if (!uid) return;

          const stored = localStorage.getItem(`accessToken-${auth}`);
          if (!stored) return;

          const authStored = JSON.parse(stored);

          meshLinkRef.current = createLink({
            clientId: uid,
            onIntegrationConnected,
            onTransferFinished,
            accessTokens: [
              {
                accountId: authStored.accountTokens[0].account.accountId,
                accountName: authStored.accountTokens[0].account.accountName,
                accessToken: authStored.accountTokens[0].accessToken,
                brokerName: authStored.brokerName,
                brokerType: authStored.brokerType as any,
              },
            ],
          });

          meshLinkRef.current.openLink(linkToken);
        },
      }}
    >
      {children}
    </LinkContext.Provider>
  );
}
