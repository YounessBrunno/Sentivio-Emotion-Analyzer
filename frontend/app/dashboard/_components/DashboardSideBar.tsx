import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import logo from "public/assets/sentivio-logo3.svg";

export default function DashboardSideBar() {
  return (
    <nav className="fixed top-0 left-0 flex flex-col items-center justify-between gap-2 w-13 h-screen border-r border-gray-200">
      <Image src={logo} alt="Sentivio Logo" width={33} height={33} />
      <SettingsIcon className="w-5 h-5 text-gray-500 font-semibold" />
    </nav>
  )
}
