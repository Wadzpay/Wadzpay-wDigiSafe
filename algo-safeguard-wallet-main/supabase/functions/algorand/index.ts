
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, errorResponse, successResponse } from "./utils.ts";
import { createAlgorandWallet, getAlgorandWalletBalance } from "./wallet.ts";
import { sendAlgorandTransaction, getTransactionsByAccount } from "./transactions.ts";

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    // Check for simulation mode
    const simulationMode = !Deno.env.get("TATUM_API_KEY");
    if (simulationMode) {
      console.log("Running in simulation mode (no TATUM_API_KEY provided)");
    }

    const action = requestData.action;
    if (!action) {
      return errorResponse("Action is required", 400);
    }

    // Route request to appropriate handler based on action
    switch (action) {
      case "wallet":
        console.log("Creating wallet");
        try {
          const wallet = await createAlgorandWallet();
          return successResponse(wallet);
        } catch (error) {
          console.error("Error creating wallet:", error);
          return errorResponse(`Failed to create wallet: ${error.message}`, 500);
        }

      case "balance":
        const { address } = requestData;
        if (!address) {
          return errorResponse("Address is required", 400);
        }
        
        try {
          console.log(`Getting balance for address: ${address}`);
          const balance = await getAlgorandWalletBalance(address);
          return successResponse(balance);
        } catch (error) {
          console.error("Error getting balance:", error);
          
          // In simulation mode, return mock balance on error
          if (simulationMode) {
            console.log("Simulation mode: Returning mock balance due to error");
            return successResponse({
              balance: Math.random() * 10,
              address,
            });
          }
          
          return errorResponse(`Error fetching balance: ${error.message}`, 500);
        }

      case "transaction":
        const { from, to, amount, privateKey, note } = requestData;
        if (!from || !to || !amount || !privateKey) {
          return errorResponse("From, to, amount, and privateKey are required", 400);
        }
        
        try {
          console.log(`Sending ${amount} ALGO from ${from} to ${to}`);
          const tx = await sendAlgorandTransaction(from, to, amount, privateKey, note);
          return successResponse(tx);
        } catch (error) {
          console.error("Error sending transaction:", error);
          return errorResponse(`Error sending transaction: ${error.message}`, 500);
        }

      case "transactions":
        const txAddress = requestData.address;
        if (!txAddress) {
          return errorResponse("Address is required", 400);
        }
        
        try {
          console.log(`Getting transactions for address: ${txAddress} with options:`, { 
            limit: requestData.limit || 50, 
            next: requestData.next 
          });
          
          // Extract transaction fetch options
          const options = {
            limit: requestData.limit || 50,
            next: requestData.next
          };
          
          const transactionsResult = await getTransactionsByAccount(txAddress, options);
          return successResponse(transactionsResult);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          
          // In simulation mode, return mock transactions on error
          if (simulationMode) {
            console.log("Simulation mode: Returning mock transactions due to error");
            return successResponse({
              transactions: [],
              next: null
            });
          }
          
          return errorResponse(`Error fetching transactions: ${error.message}`, 500);
        }

      default:
        return errorResponse("Invalid action", 400);
    }
  } catch (error) {
    console.error("Unhandled error in Edge Function:", error);
    return errorResponse(`Unhandled server error: ${error.message}`, 500);
  }
});
