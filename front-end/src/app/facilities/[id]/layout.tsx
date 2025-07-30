export default function facilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <div className="flex h-full flex-col items-center justify-between p-3">
        {children}
      </div>
    </section>
  );
}
