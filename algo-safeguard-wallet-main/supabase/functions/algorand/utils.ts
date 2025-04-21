
// HTTP response helpers
export const TATUM_API_KEY = Deno.env.get("TATUM_API_KEY");
export const TATUM_API_URL = "https://api.tatum.io/v3";

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Helper function to handle CORS preflight requests
export function handleCors(req: Request) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  return null;
}

// Standardized error response
export function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}

// Standardized success response
export function successResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}

// Safe JSON parse helper
export function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}
