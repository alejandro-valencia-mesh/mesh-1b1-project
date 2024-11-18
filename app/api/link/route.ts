import { NextRequest, NextResponse } from "next/server";

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
    const integrationName = searchParams.get("integrationName");
    const uid = searchParams.get("uid");

    if (!apiKey || !clientId || !integrationName || !uid)
      return NextResponse.json(
        { message: "Missing information" },
        { status: 500 }
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

    const linkResponse = await fetch(
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
          integrationId: integration.id,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => response)
      .catch(() => null);

    return NextResponse.json(linkResponse, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
