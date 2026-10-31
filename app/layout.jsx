import './globals.css'
import { ThemeProvider } from './lib/ThemeContext'

export const metadata = {
  title: 'Radio News',
  description: '경희대 주간 라디오 뉴스 플레이어',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
