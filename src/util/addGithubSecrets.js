const axios = require("axios");
const { readConfigFile } = require("./fs");
const { stagehandErr, stagehandLog } = require("./logger");

const encrypt = (public_key, secret_val) => {
  const sodium = require("tweetsodium");
  const key = public_key;
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secret_val);
  const keyBytes = Buffer.from(key, "base64");
  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);
  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString("base64");
  return encrypted;
};

async function addGithubSecrets(secrets) {
  const config_obj = readConfigFile();

  const owner = config_obj.owner;
  const repo = config_obj.repo;
  const github_access_token = config_obj.github_access_token;

  let url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`;

  const obj = {
    headers: {
      Authorization: github_access_token,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
  };

  // request is made to get public key
  let response = await axios.get(url, obj);
  stagehandLog("Public key retrieved.");
  const public_key = response.data.key;
  const key_id = response.data.key_id;

  // then each secret requires its own put request to update/create
  await Object.keys(secrets).map(async (key) => {
    const secret_name = key;
    const secret_val = secrets[key];
    const encrypted_secret_val = encrypt(public_key, secret_val);
    stagehandLog(`The ${secret_name} secret has been encrypted.`);

    url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secret_name}`;
    const data = {
      encrypted_value: encrypted_secret_val,
      key_id: key_id,
    };

    await axios.put(url, data, obj);
    stagehandLog(`The ${secret_name} secret has been created/upated.`);
  });
}

module.exports = { addGithubSecrets };
