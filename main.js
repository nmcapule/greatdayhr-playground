import fetch from "node-fetch";

const hasher = new (class {
  getEncode(m) {
    let M = m.replace(/[\u0080-\u07ff]/g, (x) => {
      const d = x.charCodeAt(0);
      return String.fromCharCode(192 | (d >> 6), 128 | (63 & d));
    });
    return (
      (M = M.replace(/[\u0800-\uffff]/g, (x) => {
        const d = x.charCodeAt(0);
        return String.fromCharCode(
          224 | (d >> 12),
          128 | ((d >> 6) & 63),
          128 | (63 & d)
        );
      })),
      M
    );
  }
  getDecode(m) {
    let M = m.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, (x) => {
      const d =
        ((15 & x.charCodeAt(0)) << 12) |
        ((63 & x.charCodeAt(1)) << 6) |
        (63 & x.charCodeAt(2));
      return String.fromCharCode(d);
    });
    return (
      (M = M.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, (x) => {
        const d = ((31 & x.charCodeAt(0)) << 6) | (63 & x.charCodeAt(1));
        return String.fromCharCode(d);
      })),
      M
    );
  }
  getF(m, M, x, d) {
    switch (m) {
      case 0:
        return (M & x) ^ (~M & d);
      case 1:
        return M ^ x ^ d;
      case 2:
        return (M & x) ^ (M & d) ^ (x & d);
      case 3:
        return M ^ x ^ d;
    }
  }
  getROTL(m, M) {
    return (m << M) | (m >>> (32 - M));
  }
  getToHexStr(m) {
    let x,
      M = "";
    for (let d = 7; d >= 0; d--)
      (x = (m >>> (4 * d)) & 15), (M += x.toString(16));
    return M;
  }
  setHash(m, M, x) {
    const d = this;
    null == x && (x = 2), (M = void 0 === M || M) && (m = d.getEncode(m));
    const a = [1518500249, 1859775393, 2400959708, 3395469782];
    m += String.fromCharCode(128);
    const _ = Math.ceil((m.length / 4 + 2) / 16),
      b = new Array(_);
    for (let J = 0; J < _; J++) {
      b[J] = new Array(16);
      for (let C = 0; C < 16; C++)
        b[J][C] =
          (m.charCodeAt(64 * J + 4 * C) << 24) |
          (m.charCodeAt(64 * J + 4 * C + 1) << 16) |
          (m.charCodeAt(64 * J + 4 * C + 2) << 8) |
          m.charCodeAt(64 * J + 4 * C + 3);
    }
    (b[_ - 1][14] = (8 * (m.length - 1)) / Math.pow(2, 32)),
      (b[_ - 1][14] = Math.floor(b[_ - 1][14])),
      (b[_ - 1][15] = (8 * (m.length - 1)) & 4294967295);
    let y = 1732584193,
      g = 4023233417,
      E = 2562383102,
      S = 271733878,
      P = 3285377520;
    const D = new Array(80);
    let O, V, K, $, W;
    for (let J = 0; J < _; J++) {
      for (let C = 0; C < 16; C++) D[C] = b[J][C];
      for (let C = 16; C < 80; C++)
        D[C] = d.getROTL(D[C - 3] ^ D[C - 8] ^ D[C - 14] ^ D[C - 16], 1);
      (O = y), (V = g), (K = E), ($ = S), (W = P);
      for (let C = 0; C < 80; C++) {
        const R = Math.floor(C / 20),
          H =
            (d.getROTL(O, 5) + d.getF(R, V, K, $) + W + a[R] + D[C]) &
            4294967295;
        (W = $), ($ = K), (K = d.getROTL(V, 30)), (V = O), (O = H);
      }
      (y = (y + O) & 4294967295),
        (g = (g + V) & 4294967295),
        (E = (E + K) & 4294967295),
        (S = (S + $) & 4294967295),
        (P = (P + W) & 4294967295);
    }
    let N =
      d.getToHexStr(y) +
      d.getToHexStr(g) +
      d.getToHexStr(E) +
      d.getToHexStr(S) +
      d.getToHexStr(P);
    return (
      1 === x ? (N = N.toLowerCase()) : 2 === x && (N = N.toUpperCase()), N
    );
  }
  getHash(m, M, x) {
    const d = this;
    let a = "";
    if (0 === x) {
      a = d.setHash(m, !0, null);
      const c = [
        a.substr(0, 4),
        a.substr(4, a.length - 8),
        a.substr(a.length - 4, 4),
      ];
      a =
        c[0].split("").reverse().join("") +
        c[1].split("").reverse().join("") +
        c[2].split("").reverse().join("");
    } else {
      (M = M.split("").reverse().join("")), (a = d.setHash(m + M, !0, null));
      for (let c = 1; c < x; c++) a = d.setHash(a + M, !0, null);
    }
    return a;
  }
})();

function encritpPass(C) {
  return (0, e.mG)(this, void 0, void 0, function* () {
    const R = C.ist.trim().split("-");
    if (
      (isNaN(parseInt(R[0], 10)) || (R[0] = "sfgo" + R[0]),
      (C.ist = 1 === R.length ? R[0] : R.join("-")),
      C.email.toLowerCase().includes("|"))
    ) {
      const G = C.email;
      (C.shareAccount = G.split("|")[1]), (C.email = G.split("|")[0]);
    } else C.shareAccount || (C.shareAccount = void 0), (C.email = C.email.trim());
    C.password = C.password ? C.password.trim() : C.password;
    const H = "5unf15h" + C.email + "D4740N";
    return {
      pwdHash: C.password ? M.q.getHash(C.password, H, 7).toUpperCase() : "",
      npwd: C.password ? M.q.getHash(C.password, H, 0).toUpperCase() : "",
      data: C,
    };
  });
}

function Zr(Pe, ie = !1) {
  if (!Pe || "object" != typeof Pe) return Pe;
  if (Array.isArray(Pe)) {
    const _e = Pe.map((qe) => Zr(qe, ie));
    return ie && _e.sort(), _e;
  }
  const te = {};
  return (
    Object.keys(Pe)
      .sort()
      .forEach((_e) => {
        te[_e] = Zr(Pe[_e], ie);
      }),
    te
  );
}

const email = "PH0520";
const password = "";

const H = "5unf15h" + email + "D4740N";
const auth = "https://apigonbcv2c3.dataon.com/auth/login?";

const payload = {
  username: email,
  password: hasher.getHash(password, H, 7),
  npwd: hasher.getHash(password, H, 0),

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

(async () => {
  const Kt = "5unf15hD4740N";
  const Nt = JSON.parse(JSON.stringify(payload));
  const Rn = hasher.getHash(JSON.stringify(Zr(Nt)).trim(), Kt, 7).toUpperCase();

  const headers = {
    "X-GD-Params": Rn,
    "Content-Type": "application/json",
  };

  console.log(Zr(Nt));
  console.log(headers);

  const response = await fetch(auth, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers,
  });
  console.log(await response.json());
})();
