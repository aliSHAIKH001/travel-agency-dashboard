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
        plugins: [tailwindcss(), tsconfigPaths(), reactRouter(), sentryReactRouter(sentryConfig, config)],
        sentryConfig,
        // ← this auto-injects your instrument.server.mjs
        autoInjectServerSentry: 'top-level-import',
        ssr: {
            noExternal: [/@syncfusion/]
        }
    };
});

