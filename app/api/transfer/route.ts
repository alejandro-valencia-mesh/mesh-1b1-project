import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const getIntegrations = async (apiKey: string, clientId: string) => {
  return fetch("https://integration-api.meshconnect.com/api/v1/integrations", {
    method: "GET",
    headers: { "X-Client-Secret": apiKey, "X-Client-Id": clientId },
  })
    .then((response) => response.json())
    .then((response) => response)
    .catch(() => null);
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MESH_CONNECT_API_KEY;
    const clientId = process.env.MESH_CONNECT_CLIENT_ID;
    const searchParams = request.nextUrl.searchParams;

    const authToken = request.headers.get("X-Auth-Token");

    const symbol = searchParams.get("symbol");
    const address = searchParams.get("address");
    const network = searchParams.get("network");
    const uid = searchParams.get("uid");
    const amount = searchParams.get("amount");
    const integrationName = searchParams.get("integrationName");
    const networkId =
      network === "ethereum"
        ? "e3c7fdd8-b1fc-4e51-85ae-bb276e075611"
        : network === "base"
        ? "aa883b03-120d-477c-a588-37c2afd3ca71"
        : null;

    if (!apiKey || !clientId || !uid || !networkId || !authToken || !symbol)
      return NextResponse.json(
        { message: "Missing information" },
        { status: 401 }
      );

    let integrations = await getIntegrations(apiKey, clientId);
    integrations = integrations.content.items;

    const integration = integrations.find(
      (i: any) => i.name === integrationName
    );

    if (!integration)
      return NextResponse.json(
        { message: "Integration not found" },
        { status: 500 }
      );

    const transactionId = uuidv4();

    const walletAddress = await fetch(
      "https://integration-api.meshconnect.com/api/v1/linktoken",
      {
        method: "POST",
        headers: {
          "X-Client-Secret": apiKey,
          "X-Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uid,
          transferOptions: {
            toAddresses: [
              {
                networkId,
                symbol,
                address,
              },
            ],
            amountInFiat: amount,
            transactionId,
            transferType: "deposit",
          },
          integrationId: integration.id,
          networkId,
          symbol,
          address,
          authToken,
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
