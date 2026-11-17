import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  // public 폴더를 그대로 제공: Storybook이 여기의 favicon.svg를 탭 아이콘으로 씁니다 (앱과 같은 파일)
  "staticDirs": ["../public"],
  "framework": "@storybook/react-vite"
};
export default config;