import type { Meta, StoryObj } from '@storybook/react-vite'

// 토큰 CSS가 Storybook에 제대로 적용되는지 확인하는 색 견본 1개.
// 색·간격·radius·글자는 전부 토큰(var(--…))만 사용합니다.
const meta = {
  title: 'Tokens/ColorSwatch',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BgPrimary: Story = {
  render: () => (
    <div
      data-testid="swatch"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-32)',
        borderRadius: 'var(--radius-12)',
        background: 'var(--bg-primary)',
        color: 'var(--text-on-primary)',
      }}
    >
      <span className="text-heading-md">bg/primary</span>
      <span className="text-body-sm">var(--bg-primary)</span>
      <span className="text-body-sm">→ var(--color-primary-600)</span>
    </div>
  ),
}
