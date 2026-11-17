import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Toast } from './Toast'
import type { ToastType } from './Toast'

// props 이름·값은 Figma Toast 속성과 같습니다. (onClose는 Figma에 없는 동작 연결용)
const types: ToastType[] = ['success', 'error', 'info']

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    type: 'success',
    title: 'Title',
    description: 'Description',
    closable: true,
    onClose: fn(),
  },
  argTypes: {
    type: { control: 'inline-radio', options: types },
    title: { control: 'text' },
    description: { control: 'text' },
    closable: { control: 'boolean' },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

/** Controls 패널에서 모든 props를 바꿔볼 수 있습니다. */
export const Playground: Story = {}

const columns = [
  { title: 'closable: true', closable: true },
  { title: 'closable: false', closable: false },
]

/** type 3종 × closable(true/false) 비교. title과 description은 Controls로 바꿀 수 있습니다. */
export const Compare: Story = {
  parameters: { layout: 'padded' },
  render: ({ title, description }) => (
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
        {types.map((type) => (
          <tr key={type}>
            <th
              scope="row"
              className="text-label-md"
              style={{ padding: 'var(--spacing-12)', color: 'var(--text-subtle)', textAlign: 'left' }}
            >
              {type}
            </th>
            {columns.map((column) => (
              <td key={column.title} style={{ padding: 'var(--spacing-12)' }}>
                <Toast type={type} title={title} description={description} closable={column.closable} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/** 닫기 버튼을 누르면 onClose가 실행됩니다. */
export const CloseCallsOnClose: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}

/** closable=false이면 닫기 버튼이 없습니다. */
export const NotClosable: Story = {
  args: { closable: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** 오류는 바로 읽어주는 alert, 성공·안내는 status로 알려집니다. */
export const ErrorIsAlert: Story = {
  args: { type: 'error' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
  },
}

export const SuccessIsStatus: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toBeInTheDocument()
  },
}
