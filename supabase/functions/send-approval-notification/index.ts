import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  adProofId: string;
  approverName: string;
  decision: "approved" | "revision";
  comment: string;
  campaignName: string;
  clientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { approverName, decision, comment, campaignName, clientName }: NotificationRequest = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Ad Proofs <onboarding@resend.dev>",
        to: ["your-agency-email@example.com"], // Update this with your agency email
        subject: `${decision === "approved" ? "✅ Approval" : "📝 Revision Request"} - ${clientName} / ${campaignName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New ${decision === "approved" ? "Approval" : "Revision Request"}</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Campaign:</strong> ${campaignName}</p>
              <p><strong>Submitted by:</strong> ${approverName}</p>
              <p><strong>Status:</strong> ${decision === "approved" ? "Approved ✅" : "Revision Requested 📝"}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #666;">Comment:</h3>
              <p style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px;">
                ${comment}
              </p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated notification from your Ad Proof system.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
