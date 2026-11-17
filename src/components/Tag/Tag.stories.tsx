import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'
import type { TagColor, TagSize } from './Tag'

// props 이름·값은 Figma Tag 속성과 같습니다.
const colors: TagColor[] = ['neutral', 'primary', 'success', 'error', 'warning']
const sizes: TagSize[] = ['sm', 'md']

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  args: {
    color: 'neutral',
    size: 'md',
    label: 'Tag',
  },
  argTypes: {
    // 주의: Storybook은 이름이 color로 끝나는 prop에 색 선택기를 붙이므로, 선택 목록으로 고정합니다.
    color: { control: 'select', options: colors },
    size: { control: 'inline-radio', options: sizes },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

/** Controls 패널에서 모든 props를 바꿔볼 수 있습니다. */
export const Playground: Story = {}

/** color 5종 × size 2종 비교. label은 Controls로 바꿀 수 있습니다. */
export const Compare: Story = {
  parameters: { layout: 'padded' },
  render: ({ label }) => (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <td />
          {sizes.map((size) => (
            <th
              key={size}
              scope="col"
              className="text-label-md"
              style={{ padding: 'var(--spacing-12)', color: 'var(--text-subtle)', textAlign: 'left' }}
            >
              size: {size}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {colors.map((color) => (
          <tr key={color}>
            <th
              scope="row"
              className="text-label-md"
              style={{ padding: 'var(--spacing-12)', color: 'var(--text-subtle)', textAlign: 'left' }}
            >
              {color}
            </th>
            {sizes.map((size) => (
              <td key={size} style={{ padding: 'var(--spacing-12)' }}>
                <Tag color={color} size={size} label={label} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
