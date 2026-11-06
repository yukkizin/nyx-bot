import { supabase } from "../supabase/client.js";
import { AppError } from "../../shared/errors/app-error.js";

export const discordIdentityRepository = {
  async findActiveIdentity(guildId: string, discordUserId: string) {
    // 1. Identificar o projeto pelo servidor Discord.
    const { data: guild, error: guildError } = await supabase
      .from("project_discord_guilds")
      .select("project_id")
      .eq("discord_guild_id", guildId)
      .eq("status", "active")
      .maybeSingle();

    if (guildError) {
      throw new AppError(
        guildError.message,
        "DATABASE",
        "Não foi possível identificar o projeto deste servidor.",
      );
    }

    if (!guild) {
      return null;
    }

    // 2. Encontrar a conta Discord vinculada ao projeto.
    const { data: account, error: accountError } = await supabase
      .from("user_discord_accounts")
      .select("user_id")
      .eq("project_id", guild.project_id)
      .eq("discord_user_id", discordUserId)
      .eq("status", "active")
      .is("unlinked_at", null)
      .maybeSingle();

    if (accountError) {
      throw new AppError(
        accountError.message,
        "DATABASE",
        "Não foi possível identificar sua conta.",
      );
    }

    if (!account) {
      return null;
    }

    // 3. Confirmar que o usuário continua ativo no projeto.
    const { data: user, error: userError } = await supabase
      .from("project_users")
      .select("id")
      .eq("project_id", guild.project_id)
      .eq("id", account.user_id)
      .eq("status", "active")
      .maybeSingle();

    if (userError) {
      throw new AppError(
        userError.message,
        "DATABASE",
        "Não foi possível consultar seu cadastro.",
      );
    }

    if (!user) {
      return null;
    }

    return {
      projectId: guild.project_id,
      userId: user.id,
    };
  },
};
