import fetch from "node-fetch";
import { hasher } from "./auth.js";

function sortKeys(Pe, ie = !1) {
  if (!Pe || "object" != typeof Pe) return Pe;
  if (Array.isArray(Pe)) {
    const _e = Pe.map((qe) => sortKeys(qe, ie));
    return ie && _e.sort(), _e;
  }
  const te = {};
  return (
    Object.keys(Pe)
      .sort()
      .forEach((_e) => {
        te[_e] = sortKeys(Pe[_e], ie);
      }),
    te
  );
}

/**
 * All codes below are tested only for app.greatdayhr.com <- PH Hexaware.
 */
export const ENDPOINT_LOGIN = "https://apigonbcv2c3.dataon.com/auth/login?";
export const ENDPOINT_LOGOUT = "https://apigonbcv2c3.dataon.com/auth/logout?";
export const ENDPOINT_SUPERVISOR =
  "https://apigonbcv2c3.dataon.com/homeFeed/getSupervisor?";

function loginPayload(username, password) {
  const salt = "5unf15h" + username + "D4740N";

  return {
    username: username,
    password: hasher.getHash(password, salt, 7),
    npwd: hasher.getHash(password, salt, 0),

    ist: "hexaware",
    preLoginData: {
      SFPATH: "http://172.17.200.215:8082/sf6/index.cfm",
      SF7PATH: "https://sf7.dataon.com",
      MODE: [],
      ACCOUNT: "hexaware",
      IST: "hexaware",
      CUSTOM: [],
      ACCOUNTNAME: "Hexaware Technologies LTD - Phil Branch Office",
      GOPATH: "https://apigonbc.dataon.com",
      GOPATHNEW: "https://apigonbcv2c3.dataon.com",
      PAYROLLPATH: "https://payroll.greatdayhr.com",
    },
    deviceInfo: {
      versionNumber: "Development",
      versionCode: "",
      Model: "Chrome",
      Platform: "Browser",
      Version: "101.0.4951.64",
      DeviceID: null,
      IMEI: null,
    },
    keep: true,
    versionApps: { code: "", number: "Development" },
  };
}

export class Greatday {
  constructor() {
    this.authorization = "";
  }

  _payloadHash(payload) {
    const salt = "5unf15hD4740N";
    return hasher
      .getHash(JSON.stringify(sortKeys(payload)).trim(), salt, 7)
      .toUpperCase();
  }

  _headers(payload = "") {
    return {
      Authorization: this.authorization,
      "X-GD-Params": this._payloadHash(payload),
      "Content-Type": "application/json",
    };
  }

  async login(username, password) {
    console.debug("logging in...");
    const payload = loginPayload(username, password);
    const response = await fetch(ENDPOINT_LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: this._headers(payload),
    });
    const auth = await response.json();
    this.authorization = auth["id"];
  }

  async logout() {
    console.debug("logging out...");
    await fetch(ENDPOINT_LOGOUT, {
      method: "POST",
      headers: this._headers(),
    });
    this.authorization = "";
  }

  async req(endpoint, payload = null, method = "GET") {
    const response = await fetch(endpoint, {
      method: method,
      headers: this._headers(payload),
      body: payload ? JSON.stringify(payload) : null,
    });
    return await response.json();
  }
}
