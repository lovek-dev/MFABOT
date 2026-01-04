import config from "../config.json" with { type: "json" };

export async function logAction(guild, embed) {
  const ch = guild.channels.cache.get(config.logChannelId);
  if (!ch) return;
  await ch.send({ embeds: [embed] }).catch(() => {});
}
