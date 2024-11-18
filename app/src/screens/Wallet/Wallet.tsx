import { LinkContext, MainContext } from "@/app/src/components";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IconSend } from "@tabler/icons-react";

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
  const { wallets, setWallet, uid } = useContext(MainContext);
  const { authenticate } = useContext(LinkContext);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<any>({});

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
        const response = await fetch(`/api/assets?type=${type}`, {
          method: "GET",
          headers: {
            "X-Auth-Token": token,
          },
        }).then((res) => res.json());
        const assets = response.content.cryptocurrencyPositions;
        setWallet(name, { assets });
      };

      getAssets();
    }
  }, [wallets[name]]);

  const alternativeWalletAddress = useMemo(() => {
    if (Object.keys(wallets).length <= 1) return null;

    const walletsFiltered = Object.keys(wallets).filter((w: any) => w !== name);
    if (walletsFiltered.length !== 1) return null;

    const alternativeWallet = wallets[walletsFiltered[0]];
    console.log("ALTERNATIVE", alternativeWallet);
    return alternativeWallet;
  }, [wallets]);

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
        {walletConnected.assets.map((asset: any) => (
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
                <div>{formatUSD(parseFloat(asset.lastPrice))}</div>
                <div>{formatUSD(parseFloat(asset.marketValue))}</div>
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
                />
                <button
                  disabled={!isPositiveNumber(amount[asset.symbol])}
                  className="ml-4 p-2 bg-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed hover:bg-slate-950 cursor-pointer rounded-full shadow"
                  onClick={async () => {
                    const response = await fetch(
                      `/api/transfer?uid=${uid}&amount=${
                        amount[asset.symbol]
                      }&address=${""}`
                    );
                  }}
                >
                  <IconSend />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
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
  );
}
