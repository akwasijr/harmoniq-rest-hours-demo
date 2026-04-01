export function generateStaticParams() {
  return [{ company: "north-sea-shipping" }];
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
