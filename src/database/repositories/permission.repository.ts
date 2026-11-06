import { supabase } from "../supabase/client.js";
import { AppError } from "../../shared/errors/app-error.js";

export const permissionRepository = {
  async getUserPermissionData(projectId: string, userId: string) {
    // 1. Buscar o vínculo de staff
    const { data: membership, error: membershipError } = await supabase
      .from("staff_memberships")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .is("dismissed_at", null)
      .maybeSingle();

    if (membershipError) {
      throw new AppError(
        membershipError.message,
        "DATABASE",
        "Não foi possível consultar o vínculo de staff.",
      );
    }

    if (!membership) {
      return null;
    }

    // 2. Buscar os cargos atuais
    const { data: assignments, error: assignmentsError } = await supabase
      .from("staff_position_assignments")
      .select("position_id")
      .eq("project_id", projectId)
      .eq("staff_membership_id", membership.id)
      .is("ended_at", null);

    if (assignmentsError) {
      throw new AppError(
        assignmentsError.message,
        "DATABASE",
        "Não foi possível consultar os cargos do usuário.",
      );
    }

    const positionIds = [
      ...new Set(assignments.map((item) => item.position_id)),
    ];

    // 3. Buscar permissões herdadas dos cargos
    let positionPermissions: Array<{
      permission_id: string;
    }> = [];

    if (positionIds.length > 0) {
      const { data, error } = await supabase
        .from("staff_position_permissions")
        .select("permission_id")
        .eq("project_id", projectId)
        .in("position_id", positionIds);

      if (error) {
        throw new AppError(
          error.message,
          "DATABASE",
          "Não foi possível consultar as permissões dos cargos.",
        );
      }

      positionPermissions = data;
    }

    // 4. Buscar permissões individuais
    const now = new Date().toISOString();

    const { data: individualAssignments, error: individualError } =
      await supabase
        .from("staff_user_permission_assignments")
        .select("permission_id, effect, expires_at, revoked_at")
        .eq("project_id", projectId)
        .eq("staff_membership_id", membership.id)
        .is("revoked_at", null)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (individualError) {
      throw new AppError(
        individualError.message,
        "DATABASE",
        "Não foi possível consultar as permissões individuais.",
      );
    }

    // 5. Reunir todos os IDs de permissões
    const permissionIds = [
      ...new Set([
        ...positionPermissions.map((item) => item.permission_id),
        ...individualAssignments.map((item) => item.permission_id),
      ]),
    ];

    // 6. Buscar os dados das permissões
    let permissions: Array<{
      id: string;
      permission_key: string;
      name: string;
      is_active: boolean;
    }> = [];

    if (permissionIds.length > 0) {
      const { data, error } = await supabase
        .from("staff_permissions")
        .select("id, permission_key, name, is_active")
        .eq("project_id", projectId)
        .in("id", permissionIds)
        .eq("is_active", true);

      if (error) {
        throw new AppError(
          error.message,
          "DATABASE",
          "Não foi possível consultar o cadastro das permissões.",
        );
      }

      permissions = data;
    }

    return {
      membership,
      positionIds,
      positionPermissions,
      individualAssignments,
      permissions,
    };
  },
};
