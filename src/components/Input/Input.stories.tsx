import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Input } from './Input'

// props 이름·값은 Figma Input 속성과 같습니다. state(default·focus)는 props가 아니라
// 입력칸을 클릭하거나 Tab 키로 포커스해서 확인합니다.
const meta = {
  title: 'Components/Input',
  component: Input,
  // 접근성 예외(disabled 대비 등)는 Figma 컴포넌트 설명에 적고, 문서 페이지에는 npm run guide가 자동으로 표시합니다.
  parameters: { layout: 'centered' },
  args: {
    size: 'md',
    error: false,
    disabled: false,
    label: 'Label',
    helperText: 'Helper text',
    placeholder: 'Placeholder text',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** Controls 패널에서 모든 props를 바꿔볼 수 있습니다. */
export const Playground: Story = {}

const columns = [
  { title: '기본', props: {} },
  { title: 'focus', props: {} }, // 아래 play 함수가 이 입력칸에 포커스를 줍니다
  { title: 'error', props: { error: true } },
  { title: 'disabled', props: { disabled: true } },
]

/** 기본 / focus / error / disabled 비교. 두 번째 입력칸은 포커스된 상태로 열립니다. */
export const Compare: Story = {
  parameters: { layout: 'padded' },
  render: ({ label, helperText, placeholder }) => (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
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
        <tr>
          {columns.map((column) => (
            <td key={column.title} style={{ padding: 'var(--spacing-12)', verticalAlign: 'top' }}>
              <Input label={label} helperText={helperText} placeholder={placeholder} {...column.props} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  ),
  play: async ({ canvas }) => {
    canvas.getAllByRole('textbox')[1].focus()
  },
}

/** error일 때 도움말이 입력칸의 설명으로 연결되고 aria-invalid가 붙어서, 스크린리더가 오류 메시지로 읽습니다. */
export const ErrorIsAnnounced: Story = {
  args: { error: true, helperText: '이메일 형식이 올바르지 않아요' },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Label')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription('이메일 형식이 올바르지 않아요')
  },
}

/** label을 누르면 입력칸에 포커스가 갑니다. */
export const LabelFocusesInput: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Label'))
    await expect(canvas.getByLabelText('Label')).toHaveFocus()
  },
}

/** disabled는 실제 disabled 속성이 붙어서 입력도 키보드 포커스도 받지 않습니다. */
export const DisabledIsReallyDisabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Label')).toBeDisabled()
  },
}
