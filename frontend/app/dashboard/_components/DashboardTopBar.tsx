import { LoginButton } from "shared/ui/LoginButton";
import { Separator } from "shared/ui/separator";
import { BellIcon } from "lucide-react";

export default function DashboardTopBar() {
  return (
    <header className="fixed top-0 right-0 left-13 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-gray-100/90 px-4 backdrop-blur-sm">
       <p className="font-serif text-sm font-semibold text-gray-800">Dashboard</p>
       <div className="flex items-center gap-2">
        <BellIcon className="w-5 h-5 text-gray-500 font-semibold" />
        <Separator orientation="vertical" className="h-5! w-0.5!" />
        <LoginButton className="py-1 px-1.5 border-2 border-gray-300 rounded-lg" />
       </div>
    </header>
  )
}

