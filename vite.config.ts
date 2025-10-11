import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/resgister/resgister.html"),
        home: resolve(__dirname, "src/pages/store/home/home.html"),
        productDetail: resolve(
          __dirname,
          "src/pages/store/productDetail/productDetail.html"
        ),
        userOrders: resolve(__dirname, "src/pages/client/orders/orders.html"),
        userProfile: resolve(
          __dirname,
          "src/pages/client/profile/profile.html"
        ),
        categories: resolve(
          __dirname,
          "src/pages/admin/categories/categories.html"
        ),
        orders: resolve(__dirname, "src/pages/admin/orders/orders.html"),
        products: resolve(__dirname, "src/pages/admin/products/products.html"),
        adminHome: resolve(
          __dirname,
          "src/pages/admin/adminHome/adminHome.html"
        ),
      },
    },
  },
  base: "./",
});
