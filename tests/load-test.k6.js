import http from "k6/http";
import { check } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    sustained: { executor: "constant-vus", vus: 20, duration: "30s" },
    rampUp: { executor: "ramping-vus", startVUs: 0, stages: [{ duration: "30s", target: 50 }, { duration: "30s", target: 100 }, { duration: "15s", target: 0 }] },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  for (const path of ["/", "/api/cards"]) {
    const response = http.get(`${baseUrl}${path}`);
    check(response, { [`${path} responde 2xx`]: (res) => res.status >= 200 && res.status < 300 });
  }
}
