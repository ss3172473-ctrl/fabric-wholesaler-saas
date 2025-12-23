import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, createTheme, rem } from '@mantine/core';

// Premium Theme Configuration
const theme = createTheme({
    primaryColor: 'navy',
    colors: {
        // Deep Navy for trust and professionalism
        navy: [
            '#E7E9ED', '#C1C6D1', '#9AA3B5', '#748099', '#4D5D7D',
            '#3B4B69', '#2C3A55', '#1D2841', '#0E172D', '#040919'
        ],
        // Gold for premium accents
        gold: [
            '#FBF9E6', '#F4ECC1', '#EDDF9C', '#E6D277', '#DFC552',
            '#D8B82D', '#AD9324', '#826E1B', '#574912', '#2B2409'
        ],
    },
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
    defaultRadius: 'md',
    components: {
        Button: {
            defaultProps: { size: 'md' },
        },
        Paper: {
            defaultProps: { shadow: 'xl' },
        },
        Card: {
            defaultProps: { shadow: 'sm', withBorder: true },
        }
    }
});

export const metadata = {
    title: '영진상사 파트너스',
    description: 'B2B 원단 주문 및 재고 관리 시스템',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
                <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css" />
            </head>
            <body>
                <MantineProvider theme={theme}>{children}</MantineProvider>
            </body>
        </html>
    );
}
