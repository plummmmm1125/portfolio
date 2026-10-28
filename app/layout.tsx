import type { Metadata } from 'next';
export const metadata: Metadata = {title:'李欣玉 · 内容与设计',description:'从景观设计到新媒体运营，李欣玉的内容与设计作品集。'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>;}
