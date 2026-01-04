export default {
  name: "ready",
  run(client) {
    console.log(`✅ ${client.user.tag} ready`);
  }
};
