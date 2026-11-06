import { supabase } from "./client.js";

async function testConnection() {
  const { error } = await supabase.from("projects").select("*").limit(1);

  if (error) {
    console.error("Erro ao conectar ao Supabase:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Conexão com Supabase estabelecida com sucesso!");
}

testConnection().catch((error) => {
  console.error("Erro inesperado:", error);
  process.exitCode = 1;
});
