const axios = require("axios");
const { readConfigFile } = require("./fs");
const { stagehandErr, stagehandLog } = require("./logger");
const { wrapExecCmd } = require("./wrapExecCmd");

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

async function deleteGithubSecrets() {
  wrapExecCmd("git config --get remote.origin.url").then(async (remote) => {
    const parts = remote.split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1].slice(0, -5);
    const config_obj = readConfigFile();
    const github_access_token = config_obj.github_access_token;

    let url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`;

    const obj = {
      headers: {
        Authorization: `token ${github_access_token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
    };

    // request is made to get public key
    let response = await axios.get(url, obj);
    stagehandLog("Public key retrieved.");
    const public_key = response.data.key;
    const key_id = response.data.key_id;

    // const remap = {
    //   BucketName: "AWS_S3_BUCKET",
    //   AccessKeyId: "AWS_ACCESS_KEY_ID",
    //   AccessKeySecret: "AWS_SECRET_ACCESS_KEY",
    //   Region: "AWS_REGION",
    //   DistributionId: "AWS_CF_DIST_ID",
    //   Domain: "AWS_CF_DOMAIN",
    // };

    const secrets = [
      "AWS_S3_BUCKET",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_REGION",
      "AWS_CF_DIST_ID",
      "AWS_CF_DOMAIN",
    ];

    // then each secret requires its own put request to update/create
    await secrets.each(secret_name => {
      // const secret_name = remap[key];
      // const secret_val = secrets[key];
      // const encrypted_secret_val = encrypt(public_key, secret_val);
      // stagehandLog(`The ${secret_name} secret has been encrypted.`);

      url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secret_name}`;
      // const data = {
      //   encrypted_value: encrypted_secret_val,
      //   key_id: key_id,
      // };

      await axios.delete(url, obj);
      stagehandLog(`The ${secret_name} secret has been deleted.`);
    });
  });
}

module.exports = { deleteGithubSecrets };
