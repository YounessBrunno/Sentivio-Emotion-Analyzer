import DashboardSideBar from "./DashboardSideBar";
import DashboardTopBar from "./DashboardTopBar";

export default function DashboardUILayout({children}: Readonly<{children: React.ReactNode;}>) {
   return (
    <div className="flex">
      <DashboardTopBar />
      <DashboardSideBar />
      <main className="">
        {children}
      </main>
    </div>
   )
}