import { LoginButton } from "shared/ui/LoginButton";
import { Separator } from "shared/ui/separator";
import { BellIcon } from "lucide-react";

export default function DashboardTopBar() {
  return (
    <header className="fixed top-0 right-0 left-13 px-3 flex items-center justify-end border-b border-gray-200 h-14">
       <div className="flex items-center gap-2">
        <BellIcon className="w-5 h-5 text-gray-500 font-semibold" />
        <Separator orientation="vertical" className="h-5! w-0.5!" />
        <LoginButton className="py-1 px-1.5 border-2 border-gray-300 rounded-lg" />
       </div>
    </header>
  )
}

