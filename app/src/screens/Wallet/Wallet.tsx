import { LinkContext, MainContext } from "@/app/src/components";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { AssetsResponse } from "@/app/api/assets/route";

const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const isPositiveNumber = (value: string | number) => {
  return !isNaN(parseFloat(`${value}`)) && parseFloat(`${value}`) > 0;
};

export default function Wallet({ name }: any) {
  const { wallets, setWallet, uid, setAlert } = useContext(MainContext);
  const { authenticate, openLink } = useContext(LinkContext);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<any>({});
  const [askMFA, setAskMFA] = useState<any>(false);
  const [MFA, setMFA] = useState<string>("");

  const walletConnected = useMemo(() => wallets[name], [wallets, name]);

  useEffect(() => {
    const stored = localStorage.getItem(`accessToken-${name}`);
    if (stored) {
      setWallet(name, JSON.parse(stored));
    } else {
      setWallet(name, false);
    }
  }, []);

  useEffect(() => {
    if (wallets[name] && typeof wallets[name].assets === "undefined") {
      const getAssets = async () => {
        const token = wallets[name].accountTokens[0].accessToken;
        const type = wallets[name].brokerType;
        const response: AssetsResponse = await fetch(
          `/api/assets?type=${type}`,
          {
            method: "GET",
            headers: {
              "X-Auth-Token": token,
            },
          }
        ).then((res) => res.json());
        if (!response.assets) {
          setWallet(name, { assets: [] });
          return;
        }
        setWallet(name, { assets: response.assets });
      };

      getAssets();
    }
  }, [wallets[name]]);

  const alternativeWalletAddress = useMemo(() => {
    if (Object.keys(wallets).length <= 1) return null;

    const walletsFiltered = Object.keys(wallets).filter((w: any) => w !== name);
    if (walletsFiltered.length !== 1) return null;

    const alternativeWallet = wallets[walletsFiltered[0]];
    return alternativeWallet;
  }, [wallets]);

  const sendWithLink = async (asset: any) => {
    setLoading(true);
    const walletResponse = await fetch(
      `/api/transfer/wallet?uid=${uid}&amount=${
        amount[asset.symbol]
      }&network=ethereum&symbol=${asset.symbol}&type=${
        alternativeWalletAddress.brokerType
      }`,
      {
        method: "GET",
        headers: {
          "X-Auth-Token": alternativeWalletAddress.accountTokens[0].accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res);

    const targetWallet = walletResponse?.content?.address;
    if (!targetWallet) return;

    const transactionResponse = await fetch(
      `/api/transfer?uid=${uid}&amount=${
        amount[asset.symbol]
      }&network=ethereum&symbol=${
        asset.symbol
      }&address=${targetWallet}&integrationName=${name}`,
      {
        method: "GET",
        headers: {
          "X-Auth-Token": walletConnected.accountTokens[0].accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res);

    if (!transactionResponse?.content?.linkToken) return;

    openLink(transactionResponse?.content?.linkToken, name);
    setLoading(false);
  };

  const send = async (asset: any, mfa?: any) => {
    setLoading(true);
    const walletResponse = await fetch(
      `/api/transfer/wallet?uid=${uid}&amount=${
        amount[asset.symbol]
      }&network=ethereum&symbol=${asset.symbol}&type=${
        alternativeWalletAddress.brokerType
      }`,
      {
        method: "GET",
        headers: {
          "X-Auth-Token": alternativeWalletAddress.accountTokens[0].accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res);

    const targetWallet = walletResponse?.content?.address;
    if (!targetWallet) return;

    const mfaObject: any = {};
    if (mfa) {
      mfaObject["mfa"] = mfa;
    }

    const params: any = {
      fromType: walletConnected.brokerType,
      toType: alternativeWalletAddress.brokerType,
      toAddress: targetWallet,
      network: "ethereum",
      symbol: asset.symbol,
      amountInFiat: amount[asset.symbol],
      ...mfaObject,
    };

    const formattedParams = Object.keys(params)
      .map((key: string) => `${key}=${params[key]}`)
      .join("&");

    const transactionResponse = await fetch(
      `/api/transfer/manually/configure?${formattedParams}`,
      {
        method: "GET",
        headers: {
          "X-Auth-Token": walletConnected.accountTokens[0].accessToken,
          "X-To-Auth-Token":
            alternativeWalletAddress.accountTokens[0].accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res);

    if (transactionResponse?.errorType === "mfaRequired") {
      setAskMFA(asset);
    } else if (transactionResponse?.errorType?.length > 0) {
      setAlert({
        type: "error",
        message: transactionResponse.displayMessage,
      });
    }

    if (transactionResponse?.content?.executeTransferResult) {
      const message = `Transfer finished: ${transactionResponse?.content?.executeTransferResult.amountInFiat} USD worth of ${transactionResponse?.content?.executeTransferResult.symbol}, it might take a while to reflect in your account`;

      setAlert({
        type: "success",
        message,
      });
    }

    console.log("TEST MANUAL", transactionResponse);

    setLoading(false);
  };

  const renderAssets = () => {
    if (walletConnected && !walletConnected.assets)
      return (
        <div className="w-full flex justify-center items-center min-h-[100px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    if (!walletConnected || !walletConnected.assets) return null;

    return (
      <div className="w-full p-4 pb-0">
        {(walletConnected.assets as AssetsResponse["assets"]).map((asset) => (
          <div
            className="w-full border border-slate-500 rounded mb-4 shadow bg-slate-600 flex flex-row items-center justify-center"
            key={asset.symbol}
          >
            <div className="flex-1">
              <div className="flex flex-row justify-between p-4">
                <div className="font-bold">{asset.symbol}</div>
                <div>{asset.amount}</div>
              </div>
              <div className="flex flex-row justify-between text-slate-400 p-4 pt-0">
                {asset.lastPrice && (
                  <div>{formatUSD(parseFloat(`${asset.lastPrice}`))}</div>
                )}
                {asset.marketValue && (
                  <div>{formatUSD(parseFloat(`${asset.marketValue}`))}</div>
                )}
              </div>
              <div className="flex flex-row justify-between text-slate-400 p-2 border-t border-t-slate-500">
                <input
                  placeholder="Amount in USD"
                  type="number"
                  className="flex-1 text-white px-4 h-auto rounded bg-slate-700 focus:outline-none focus:bg-slate-800"
                  value={amount[asset.symbol] || ""}
                  onChange={(e) =>
                    setAmount({ ...amount, [asset.symbol]: e.target.value })
                  }
                  disabled={loading}
                />
                <button
                  disabled={!isPositiveNumber(amount[asset.symbol])}
                  className="ml-4 px-4 p-2 bg-slate-500 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-slate-400 cursor-pointer rounded shadow text-white"
                  onClick={() => sendWithLink(asset)}
                >
                  Send with Link
                </button>
                <button
                  disabled={!isPositiveNumber(amount[asset.symbol])}
                  className="ml-4 px-4 p-2 bg-slate-500 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-slate-400 cursor-pointer rounded shadow text-white"
                  onClick={() => send(asset)}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {askMFA && (
        <div className="fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-[400px] p-4 rounded bg-slate-700 shadow">
            <p className="text-white w-full text-center font-bold mb-4">
              Please enter your MFA code
            </p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-slate-800 mb-4"
              value={MFA}
              onChange={(e) => setMFA(e.target.value)}
              placeholder="XXXXXXX"
            />
            <button
              onClick={async () => {
                await send(askMFA, MFA);
                setAskMFA(false);
              }}
              className="w-full shadow bg-slate-800 py-2 px-4 rounded hover:bg-slate-900"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <div className="w-1/2 bg-slate-700 border border-slate-500 rounded shadow">
        <h1 className="w-full p-4 text-center border-b border-b-slate-500 relative text-xl font-bold">
          {name}
          {walletConnected === false && (
            <button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await authenticate(name);
                setLoading(false);
              }}
              className="absolute shadow right-2 top-2 bg-slate-900 py-2 px-4 rounded hover:bg-slate-950 disabled:bg-slate-800 disabled:text-slate-500"
            >
              Connect
            </button>
          )}
        </h1>
        {renderAssets()}
        {walletConnected === false && (
          <div className="w-full p-4 text-center text-slate-400 text-sm">
            First you need to connect your wallet
          </div>
        )}
      </div>
    </>
  );
}
