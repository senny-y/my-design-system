// 조립된 데모 화면은 나중에 따로 만들 예정입니다. 지금은 Storybook에서 컴포넌트를 확인합니다.
function App() {
  return (
    <main style={{ padding: 'var(--spacing-32)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <h1 className="text-heading-lg" style={{ margin: 0 }}>
        New Design System
      </h1>
      <p className="text-body-md" style={{ margin: 0, color: 'var(--text-subtle)' }}>
        Storybook에서 확인하세요. 터미널에서 <code>npm run storybook</code>을 입력하면 열립니다.
      </p>
    </main>
  )
}

export default App
