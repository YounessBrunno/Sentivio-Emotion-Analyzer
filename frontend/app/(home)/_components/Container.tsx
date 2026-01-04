import { ReactNode } from "react"

type ContainerProps = {
  children: ReactNode
}
const Container = ({children }: ContainerProps) => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {children}
    </div>
  )
}

export default Container