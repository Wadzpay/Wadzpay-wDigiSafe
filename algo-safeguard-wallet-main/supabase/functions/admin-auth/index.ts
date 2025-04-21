
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables for Supabase connection");
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body ONLY ONCE and store it
    const requestData = await req.json();
    const { action } = requestData;

    if (action === "login") {
      const { username, password } = requestData;
      
      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Call the database function to authenticate admin
      const { data, error } = await supabase.rpc(
        "authenticate_admin",
        {
          admin_username: username,
          admin_password: password,
        }
      );

      if (error) {
        console.error("Admin authentication error:", error);
        throw new Error("Error authenticating administrator");
      }

      // Return authentication result
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "verify") {
      // Verify an admin session token
      const { adminId } = requestData;
      
      if (!adminId) {
        throw new Error("Admin ID is required for verification");
      }
      
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, username")
        .eq("id", adminId)
        .single();
        
      if (error || !data) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Invalid admin session" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          admin: { id: data.id, username: data.username } 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Invalid action" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error in admin-auth function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred in the admin authentication process",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
