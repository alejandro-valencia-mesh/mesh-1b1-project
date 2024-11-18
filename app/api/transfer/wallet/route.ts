import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MESH_CONNECT_API_KEY;
    const clientId = process.env.MESH_CONNECT_CLIENT_ID;
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get("uid");
    const amount = searchParams.get("amount");
    const network = searchParams.get("network");
    const symbol = searchParams.get("symbol");
    const type = searchParams.get("type");

    const authToken = request.headers.get("X-Auth-Token");

    const networkId =
      network === "ethereum"
        ? "e3c7fdd8-b1fc-4e51-85ae-bb276e075611"
        : network === "base"
        ? "aa883b03-120d-477c-a588-37c2afd3ca71"
        : null;

    if (
      !apiKey ||
      !clientId ||
      !uid ||
      !amount ||
      !networkId ||
      !authToken ||
      !type ||
      !symbol
    )
      return NextResponse.json(
        { message: "Missing information" },
        { status: 401 }
      );

    console.log(
      "NOT PASSED",
      JSON.stringify({
        type,
        symbol,
        addressType: "ethAddress",
        networkId,
      })
    );

    const walletAddress = await fetch(
      "https://integration-api.meshconnect.com/api/v1/transfers/managed/address/get",
      {
        method: "POST",
        headers: {
          "X-Client-Secret": apiKey,
          "X-Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authToken,
          type,
          symbol,
          addressType: "ethAddress",
          networkId,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => response)
      .catch(() => null);

    return NextResponse.json(walletAddress, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
