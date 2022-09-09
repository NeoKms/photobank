interface EnvConfig {
  API_URL: string;
  PRODUCTION: boolean;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const envConfig = window.envConfig as EnvConfig;
