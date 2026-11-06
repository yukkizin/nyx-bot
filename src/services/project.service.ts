import { projectRepository } from "../database/repositories/project.repository.js";
import { AppError } from "../shared/errors/app-error.js";

export const projectService = {
  async getProjectById(id: string) {
    if (!id.trim()) {
      throw new AppError(
        "O ID do projeto é obrigatório.",
        "VALIDATION",
        "Informe um ID de projeto válido.",
      );
    }

    const project = await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        `Projeto não encontrado: ${id}`,
        "NOT_FOUND",
        "O projeto solicitado não foi encontrado.",
      );
    }

    return project;
  },

  async getAllProjects() {
    return projectRepository.findAll();
  },
};
