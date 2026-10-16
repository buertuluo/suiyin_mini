import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    host: "0.0.0.0", // 允许用局域网 IP 访问，如 http://192.168.x.x:5173
    port: 5173,
    strictPort: false,
  },
});
