// loadtest.ts
import autocannon, { Instance, Result } from "autocannon";
import fs from "fs";

interface LoadTestConfig {
  url: string;
  connections: number;
  duration: number;
  pipelining: number;
}

const config: LoadTestConfig = {
  url: "http://localhost:8080", // URL server cần test
  connections: 5000, // nếu máy chịu nổi
  duration: 10, // test 1 phút
  pipelining: 10,
};

console.log(`🚀 Bắt đầu load test: ${config.url}`);
console.log(
  `👥 ${config.connections} kết nối | ⏳ ${config.duration}s | 🔗 pipelining=${config.pipelining}`
);

const instance: Instance = autocannon(
  config,
  (err: Error | null, result: Result) => {
    if (err) {
      console.error("❌ Lỗi khi chạy load test:", err);
      return;
    }

    fs.writeFileSync("result.json", JSON.stringify(result, null, 2), "utf-8");
    console.log("✅ Test xong! Kết quả đã lưu vào result.json");
  }
);

autocannon.track(instance, { renderProgressBar: true });
