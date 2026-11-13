import DashboardSideBar from "./DashboardSideBar";
import DashboardTopBar from "./DashboardTopBar";

export default function DashboardUILayout({children}: Readonly<{children: React.ReactNode;}>) {
   return (
    <>
      <DashboardTopBar />
      <DashboardSideBar />
      <main className="ml-13 mt-14 min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-6xl p-5 md:p-6">{children}</div>
      </main>
    </>
   )
}
