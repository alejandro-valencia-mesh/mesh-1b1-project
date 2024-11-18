"use client";

import React from "react";
import { Wallet } from "..";

export default function Main() {
  return (
    <div className="container mt-5">
      <div className="flex flex-row justify-center items-start gap-4 container m-auto">
        <Wallet name="Coinbase" />
        <Wallet name="Binance" />
      </div>
    </div>
  );
}
