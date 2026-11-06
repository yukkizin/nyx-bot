import { supabase } from "../supabase/client.js";
import { AppError } from "../../shared/errors/app-error.js";

export const projectRepository = {
  async findById(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Erro ao buscar projeto: ${error.message}`,
        "DATABASE",
        "Não foi possível consultar o projeto.",
      );
    }

    return data;
  },

  async findAll() {
    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      throw new AppError(
        `Erro ao listar projetos: ${error.message}`,
        "DATABASE",
        "Não foi possível listar os projetos.",
      );
    }

    return data;
  },
};
