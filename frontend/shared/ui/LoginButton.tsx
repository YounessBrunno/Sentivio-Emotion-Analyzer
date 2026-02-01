import * as React from "react"
import { Button } from "./button"
import Link from "next/link"
import { FingerprintIcon } from "lucide-react"
import { cn } from "shared/lib/utils"

type IconComponent = React.ComponentType<{ className?: string }>

interface LoginButtonProps {
  className?: string
  icon?: IconComponent
  iconClassName?: string
}

const defaultButtonClassName = "py-1 px-1.5 border-2 rounded-full"
const defaultIconClassName = "w-4 h-4"

export function LoginButton({className, icon: Icon = FingerprintIcon, iconClassName = defaultIconClassName} : LoginButtonProps) {
  return (
    <Button className={cn(defaultButtonClassName, className)}>
      <Link href="/sign-in" className="flex items-center gap-2">
        Sign In <Icon className={iconClassName} />
      </Link>
    </Button>
  )
}

