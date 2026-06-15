export const metadata = { title: "Quant Agent", description: "On-chain AI trading agent dashboard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
