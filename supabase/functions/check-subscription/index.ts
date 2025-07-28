import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { user_id } = await req.json();

  if (!user_id) {
    return new Response(JSON.stringify({ error: "Missing user_id" }), {
      status: 400,
    });
  }

  // Aqui você faria uma query no Supabase para buscar o plano do usuário
  // Exemplo básico com fetch:
  const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/subscriptions?user_id=eq.${user_id}`, {
    headers: {
      apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify({ subscription: data[0] }), {
    headers: { "Content-Type": "application/json" },
  });
});
