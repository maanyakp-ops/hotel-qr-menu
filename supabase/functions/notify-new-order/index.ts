import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const payload = await req.json()
  const order = payload.record

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: hotel } = await supabase
    .from("hotels")
    .select("fcm_token")
    .eq("id", order.hotel_id)
    .single()

  if (!hotel?.fcm_token) return new Response("No token", { status: 200 })

  const { data: items } = await supabase
    .from("order_items")
    .select("quantity, menu_items(name)")
    .eq("order_id", order.id)

  const itemList = items?.map(i => `${i.menu_items?.name} x${i.quantity}`).join(", ") || ""

  await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `key=${Deno.env.get("FCM_SERVER_KEY")}`
    },
    body: JSON.stringify({
      to: hotel.fcm_token,
      notification: {
        title: `🔔 New Order — Room ${order.room_id}`,
        body: itemList,
      }
    })
  })

  return new Response("OK", { status: 200 })
})