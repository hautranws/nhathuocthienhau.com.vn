import { supabase } from "./lib/supabaseClient";

async function testQuery() {
  console.log("--- TESTING HOMEPAGE PRODUCTS QUERY ---");
  const { data, error } = await supabase
    .from("products")
    .select("id, title, is_homepage_visible")
    .eq("is_homepage_visible", true);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Products with is_homepage_visible = true:", data?.length);
    console.log("Details:", data);
  }

  console.log("\n--- TESTING ALL PRODUCTS COUNT ---");
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log("Total products in DB:", count);
}

testQuery();
