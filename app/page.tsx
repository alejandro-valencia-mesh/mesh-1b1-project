"use client";

import { LinkWrapper, MainContextProvider } from "./src/components";
import { Main } from "./src/screens";

export default function Home() {
  return (
    <MainContextProvider>
      <LinkWrapper>
        <h1 className="text-2xl font-bold py-5 text-slate-300 bg-slate-700 border-b border-b-slate-500 w-full text-center shadow">
          Mesh 1B1 Project
        </h1>
        <div className="container m-auto h-full flex justify-start items-center flex-col">
          <Main />
        </div>
      </LinkWrapper>
    </MainContextProvider>
  );
}
