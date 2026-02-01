import { Button } from "./button"
import Link from "next/link"
import { FingerprintIcon } from "lucide-react"

export function LoginButton() {
  return (
    <Button className="py-1 px-1.5 border-2 rounded-full">
        <Link href="/sign-in" className="flex items-center gap-2">
            Sign In <FingerprintIcon className="w-4 h-4" />
        </Link>
    </Button>
  )
}

