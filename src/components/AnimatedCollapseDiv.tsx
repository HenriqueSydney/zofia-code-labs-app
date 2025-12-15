
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface IAnimatedCollapseDiv {
    children: ReactNode
}

export function AnimatedCollapseDiv({ children }: IAnimatedCollapseDiv) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  )
}