import { NextRequest, NextResponse } from "next/server";

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

    const result = await fetch(
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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
