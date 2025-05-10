import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {sentryReactRouter, type SentryReactRouterBuildOptions} from "@sentry/react-router";


const sentryConfig: SentryReactRouterBuildOptions = {
  org: "ali-shaikh-cr",
  project: "travel-agency",

  // An auth token is required for uploading source maps.
  authToken: "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"
  // ...
};

export default defineConfig(config => {
    return {
          plugins: [tailwindcss(), tsconfigPaths(),  reactRouter(), sentryReactRouter(sentryConfig, config)],
        sentryConfig,
      ssr: {
        noExternal: [/@syncfusion/]
      }
  };
});
