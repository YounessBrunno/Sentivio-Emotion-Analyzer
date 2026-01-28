import DashboardUILayout from "./_components/DashboardUILayout";

export default function DashboardLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
      <html lang="en">
        <body>
          <DashboardUILayout>
             {children}
          </DashboardUILayout>
        </body>
      </html>
    );
}
