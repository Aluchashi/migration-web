import { DashboardNav } from "@/components/Page3-Dashboard/dashboard-nav";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
}
