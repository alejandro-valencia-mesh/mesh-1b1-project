import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.MESH_CONNECT_API_KEY;
    const clientId = process.env.MESH_CONNECT_CLIENT_ID;

    if (!apiKey || !clientId)
      return NextResponse.json(
        { message: "API Keys not found" },
        { status: 500 }
      );

    const response = await fetch(
      "https://integration-api.meshconnect.com/api/v1/transfers/managed/networks",
      {
        method: "GET",
        headers: { "X-Client-Secret": apiKey, "X-Client-Id": clientId },
      }
    )
      .then((response) => response.json())
      .then((response) => response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
