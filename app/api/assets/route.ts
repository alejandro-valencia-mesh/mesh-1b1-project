import { NextRequest, NextResponse } from "next/server";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  marketValue?: number;
  lastPrice?: number;
}

export interface AssetsResponse {
  assets: Asset[];
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MESH_CONNECT_API_KEY;
    const clientId = process.env.MESH_CONNECT_CLIENT_ID;

    const authToken = request.headers.get("X-Auth-Token");

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (!apiKey || !clientId || !authToken || !type)
      return NextResponse.json(
        { message: "Missing information" },
        { status: 500 }
      );

    let result: AssetsResponse;

    if (type === "deFiWallet") {
      const configResponse = await fetch(
        "https://integration-api.meshconnect.com/api/v1/transfers/managed/configure",
        {
          method: "POST",
          headers: {
            "X-Client-Secret": apiKey,
            "X-Client-Id": clientId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAuthToken: authToken,
            fromType: "deFiWallet",
            // Hard coded address for testing purposes
            toAddresses: [
              {
                networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
                symbol: "USDC",
                address: "0x22594797Ecb3974b18459c5A4200755eCdaD4a91",
              },
            ],
          }),
        }
      )
        .then((response) => response.json())
        .catch(() => null);

      result = {
        assets: (configResponse?.content?.holdings || []).map((asset: any) => ({
          symbol: asset.symbol,
          name: asset.symbol,
          amount: asset.availableBalance,
        })),
      };
    } else {
      const holdingsResponse = await fetch(
        "https://integration-api.meshconnect.com/api/v1/holdings/get",
        {
          method: "POST",
          headers: {
            "X-Client-Secret": apiKey,
            "X-Client-Id": clientId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            authToken,
            includeMarketValue: true,
          }),
        }
      )
        .then((response) => response.json())
        .catch(() => null);

      result = {
        assets: (holdingsResponse?.content?.cryptocurrencyPositions || []).map(
          (asset: any) => ({
            symbol: asset.symbol,
            name: asset.symbol,
            amount: asset.amount,
            marketValue: asset.marketValue || null,
            lastPrice: asset.lastPrice || null,
          })
        ),
      };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
