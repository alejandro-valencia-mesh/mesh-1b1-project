import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MESH_CONNECT_API_KEY;
    const clientId = process.env.MESH_CONNECT_CLIENT_ID;
    const searchParams = request.nextUrl.searchParams;

    const authToken = request.headers.get("X-Auth-Token");
    const toAuthToken = request.headers.get("X-To-Auth-Token");

    const fromType = searchParams.get("fromType");
    const toType = searchParams.get("toType");
    const symbol = searchParams.get("symbol");
    const toAddress = searchParams.get("toAddress");
    const network = searchParams.get("network");
    const amountInFiat = searchParams.get("amountInFiat");
    const mfa = searchParams.get("mfa");

    const networkId =
      network === "ethereum"
        ? "e3c7fdd8-b1fc-4e51-85ae-bb276e075611"
        : network === "base"
        ? "aa883b03-120d-477c-a588-37c2afd3ca71"
        : null;

    if (
      !apiKey ||
      !clientId ||
      !networkId ||
      !authToken ||
      !symbol ||
      !toAddress ||
      !amountInFiat ||
      !fromType ||
      !toType ||
      !toAuthToken
    )
      return NextResponse.json(
        { message: "Missing information" },
        { status: 401 }
      );

    // const responseConfig = await fetch(
    //   "https://integration-api.meshconnect.com/api/v1/transfers/managed/configure",
    //   {
    //     method: "POST",
    //     headers: {
    //       "X-Client-Secret": apiKey,
    //       "X-Client-Id": clientId,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       fromAuthToken: authToken,
    //       fromType: fromType,
    //       toAddresses: [
    //         {
    //           address: toAddress,
    //           networkId: networkId,
    //           symbol: symbol,
    //         },
    //       ],
    //       symbol: symbol,
    //       amountInFiat: amountInFiat,
    //       networkId: networkId,
    //     }),
    //   }
    // )
    //   .then((response) => response.json())
    //   .then((response) => response)
    //   .catch(() => null);

    const mfaCode: any = {};

    if (typeof mfa === "string" && mfa.length > 0) {
      mfaCode["mfaCode"] = mfa;
    }

    console.log("MFA CODE", mfaCode);

    const previewResponse = await fetch(
      "https://integration-api.meshconnect.com/api/v1/transfers/managed/preview",
      {
        method: "POST",
        headers: {
          "X-Client-Secret": apiKey,
          "X-Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAuthToken: authToken,
          fromType: fromType,
          toAddress: toAddress,
          symbol: symbol,
          amountInFiat: amountInFiat,
          networkId: networkId,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => response)
      .catch(() => null);

    if (previewResponse.errorType.length > 0) {
      return NextResponse.json(previewResponse, { status: 200 });
    }

    const previewId = previewResponse.content.previewResult.previewId;

    const executeResponse = await fetch(
      "https://integration-api.meshconnect.com/api/v1/transfers/managed/execute",
      {
        method: "POST",
        headers: {
          "X-Client-Secret": apiKey,
          "X-Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAuthToken: authToken,
          fromType: fromType,
          previewId: previewId,
          ...mfaCode,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => response)
      .catch(() => null);

    if (executeResponse?.content?.status === "mfaRequired") {
      return NextResponse.json(
        {
          displayMessage: "MFA required",
          errorType: "mfaRequired",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(executeResponse, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
