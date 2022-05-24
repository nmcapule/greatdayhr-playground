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

function datePlusDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * All codes below are tested only for app.greatdayhr.com <- PH Hexaware.
 */
export const ENDPOINT_LOGIN = "https://apigonbcv2c3.dataon.com/auth/login?";
export const ENDPOINT_LOGOUT = "https://apigonbcv2c3.dataon.com/auth/logout?";
export const ENDPOINT_SUPERVISOR =
  "https://apigonbcv2c3.dataon.com/homeFeed/getSupervisor?";
export const ENDPOINT_ATTENDANCE =
  "https://apigonbcv2c3.dataon.com/att/shared/attendance/getAttendanceList?";

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
    this.profile = {};
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

  get authorization() {
    return this.profile["id"];
  }

  get employeeId() {
    return this.profile["empId"];
  }

  async login(username, password) {
    console.debug("logging in...");
    const payload = loginPayload(username, password);
    const response = await fetch(ENDPOINT_LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: this._headers(payload),
    });
    this.profile = await response.json();
  }

  async logout() {
    console.debug("logging out...");
    await fetch(ENDPOINT_LOGOUT, {
      method: "POST",
      headers: this._headers(),
    });
    this.profile = {};
  }

  async req(endpoint, payload = null, method = "GET") {
    const response = await fetch(endpoint, {
      method: method,
      headers: this._headers(payload),
      body: payload ? JSON.stringify(payload) : null,
    });
    return await response.json();
  }

  async attendanceList(options = {}) {
    options.limit = options.limit || 20;
    options.skip = options.skip || 0;
    options.overridePayload = options.overridePayload || {};
    options.endDate =
      options.endDate ||
      datePlusDays(new Date(), -options.limit * options.skip).toISOString();
    options.startDate =
      options.startDate ||
      datePlusDays(new Date(options.endDate), -options.limit).toISOString();

    const payload = {
      empId: "",
      empIds: [this.employeeId],
      status: [],
      startDate: options.startDate,
      endDate: options.endDate,
      txtName: "",
      worklocationCodes: [],
      minRecogTreshold: 0,
      maxRecogTreshold: 100,
      noRecog: true,
      minLivenessTreshold: 0,
      maxLivenessTreshold: 100,
      noLiveness: true,
      noGps: true,
      noPicture: true,
      ...options.overridePayload,
    };

    return await this.req(
      `${ENDPOINT_ATTENDANCE}?limit=${options.limit}&skip=${options.skip}`,
      payload,
      "POST"
    );
  }
}
