import DashboardUILayout from "./_components/DashboardUILayout";

export default function DashboardLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <DashboardUILayout>
             {children}
        </DashboardUILayout>
    );
}
