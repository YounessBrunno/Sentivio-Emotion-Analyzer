import DashboardSideBar from "./DashboardSideBar";
import DashboardTopBar from "./DashboardTopBar";

export default function DashboardUILayout({children}: Readonly<{children: React.ReactNode;}>) {
   return (
    <>
      <DashboardTopBar />
      <DashboardSideBar />
      <main className="flex items-center justify-center h-screen">
        {children}
      </main>
    </>
   )
}