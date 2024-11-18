"use client";

import React, { useContext, useMemo } from "react";
import { Wallet } from "..";
import { MainContext } from "../../components";
import { IconX } from "@tabler/icons-react";

export default function Main() {
  const { alert, setAlert } = useContext(MainContext);

  const divExtraClassNames = useMemo(() => {
    if (alert?.type === "error") return "bg-red-800 border-red-500";
    if (alert?.type === "success") return "bg-indigo-800 border-indigo-500";
  }, [alert]);

  const btnExtraClassNames = useMemo(() => {
    if (alert?.type === "error") return "bg-red-600 hover:border-red-700";
    if (alert?.type === "success")
      return "bg-indigo-600 hover:border-indigo-700";
  }, [alert]);

  return (
    <div className="container mt-5">
      <div className="flex justify-center items-start gap-4 container m-auto flex-col">
        {alert && (
          <div
            className={`w-full p-4 rounded shadow border flex justify-center items-center relative ${divExtraClassNames}`}
          >
            <h4>{alert.message}</h4>
            <button
              className={`absolute right-[60px] shadow rounded px-4 py-2 ${btnExtraClassNames}`}
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
            <button
              className="absolute right-2 bg-transparent p-2 hover:opacity-50"
              onClick={() => {
                setAlert(null);
              }}
            >
              <IconX />
            </button>
          </div>
        )}
        <div className="flex flex-row justify-center items-start gap-4 container m-auto">
          <Wallet name="Coinbase" />
          <Wallet name="Binance" />
        </div>
      </div>
    </div>
  );
}
