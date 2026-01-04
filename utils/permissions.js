import config from "../config.json" with { type: "json" };
import fs from "fs";

export function hasBotAccess(member) {
  if (member.id === config.ownerId) return true;
  return member.roles.cache.has(config.allowedRoleId);
}

export function updateAllowedRole(roleId) {
  config.allowedRoleId = roleId;
  fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
}
