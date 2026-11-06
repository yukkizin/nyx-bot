import { permissionRepository } from "../../database/repositories/permission.repository.js";

import type {
  EffectivePermission,
  PermissionEffect,
} from "../../shared/types/permissions.js";

export const permissionService = {
  async getEffectivePermissions(
    projectId: string,
    userId: string,
  ): Promise<EffectivePermission[]> {
    const data = await permissionRepository.getUserPermissionData(
      projectId,
      userId,
    );

    // Sem vínculo ativo, não existem permissões.
    if (!data || data.membership.status !== "active") {
      return [];
    }

    const permissionKeys = new Map(
      data.permissions.map((permission) => [
        permission.id,
        permission.permission_key,
      ]),
    );

    // Permissões herdadas dos cargos.
    const positionPermissionIds = new Set(
      data.positionPermissions.map((item) => item.permission_id),
    );

    // Agrupar permissões individuais por ID.
    const individualEffects = new Map<string, PermissionEffect[]>();

    for (const assignment of data.individualAssignments) {
      const effect = assignment.effect;

      if (effect !== "allow" && effect !== "deny") {
        continue;
      }

      const effects = individualEffects.get(assignment.permission_id) ?? [];

      effects.push(effect);
      individualEffects.set(assignment.permission_id, effects);
    }

    const results: EffectivePermission[] = [];

    for (const [permissionId, permissionKey] of permissionKeys) {
      const hasPositionPermission = positionPermissionIds.has(permissionId);

      const effects = individualEffects.get(permissionId) ?? [];

      const hasIndividualDeny = effects.includes("deny");
      const hasIndividualAllow = effects.includes("allow");

      let allowed = false;
      let source: EffectivePermission["source"] = "position";

      if (hasIndividualDeny) {
        allowed = false;
        source = "individual";
      } else if (hasIndividualAllow) {
        allowed = true;
        source = "individual";
      } else if (hasPositionPermission) {
        allowed = true;
        source = "position";
      }

      results.push({
        permissionKey,
        allowed,
        source,
      });
    }

    return results;
  },

  async hasPermission(
    projectId: string,
    userId: string,
    permissionKey: string,
  ): Promise<boolean> {
    const permissions = await this.getEffectivePermissions(projectId, userId);

    return permissions.some(
      (permission) =>
        permission.permissionKey === permissionKey && permission.allowed,
    );
  },
};
