import { ReactNode } from "react"

type EmailStrongTag = {
    children: ReactNode
}

export function EmailStrongTag({ children }: EmailStrongTag) {
  return (
    <strong className="text-[hsl(270,85%,65%)]">{children}</strong>
  )

}