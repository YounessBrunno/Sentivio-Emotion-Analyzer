import { ReactNode } from "react"

type ContainerProps = {
  children: ReactNode;
  size?: "default" | "wide" | "narrow"
}
const sizes = {
  default: "max-w-7xl",
  wide: "max-w-screen-xl",
  narrow: "max-w-3xl",
}
const Container = ({children, size = "default" }: ContainerProps) => {
  return (
    <div className={`mx-auto ${sizes[size]} px-4 sm:px-6 lg:px-8`}>
    {children}
    </div>
  )
}

export default Container