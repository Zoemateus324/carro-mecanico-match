// functions/create-subscription/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { userId, email } = await req.json();

  // Atualizar o perfil do usuário em vez de criar um subscriber
  const { error } = await supabase
    .from("profiles")
    .update({ 
      plano_id: "gratuito", // ou o ID do plano correspondente
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});