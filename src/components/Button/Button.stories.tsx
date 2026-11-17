import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from './Button'
import type { ButtonVariant } from './Button'

// props 이름·값은 Figma Button 속성과 같습니다. state(default·hover·focus)는 props가 아니라
// 마우스를 올리거나 Tab 키로 포커스해서 확인합니다.
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Controls 패널에서 모든 props를 바꿔볼 수 있습니다. */
export const Playground: Story = {}

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost']
const columns = [
  { title: '기본', props: {} },
  { title: 'disabled', props: { disabled: true } },
  { title: 'loading', props: { loading: true } },
  { title: 'disabled + loading', props: { disabled: true, loading: true } },
]

/** variant 3종 × (기본 / disabled / loading / disabled+loading) 비교. size와 label은 Controls로 바꿀 수 있습니다. */
export const Compare: Story = {
  parameters: { layout: 'padded' },
  render: ({ size, label }) => (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <td />
          {columns.map((column) => (
            <th
              key={column.title}
              scope="col"
              className="text-label-md"
              style={{ padding: 'var(--spacing-12)', color: 'var(--text-subtle)', textAlign: 'left' }}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {variants.map((variant) => (
          <tr key={variant}>
            <th
              scope="row"
              className="text-label-md"
              style={{ padding: 'var(--spacing-12)', color: 'var(--text-subtle)', textAlign: 'left' }}
            >
              {variant}
            </th>
            {columns.map((column) => (
              <td key={column.title} style={{ padding: 'var(--spacing-12)' }}>
                <Button variant={variant} size={size} label={label} {...column.props} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/** loading 중에는 클릭해도 onClick이 실행되지 않고, 스크린리더에는 aria-busy로 알려집니다. */
export const LoadingBlocksClick: Story = {
  args: { loading: true },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button')
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}

/** disabled는 실제 disabled 속성이 붙어서 키보드 포커스도 받지 않습니다. */
export const DisabledIsReallyDisabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button')
    await userEvent.click(button)
    await expect(button).toBeDisabled()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}
