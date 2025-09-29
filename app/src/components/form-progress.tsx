"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormProgressProps {
  currentStep: number
  totalSteps: number
  steps: { title: string; description: string }[]
}

export function FormProgress({ currentStep, totalSteps, steps }: FormProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full space-y-8">
      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-3">
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                    isCompleted && "border-accent bg-accent text-accent-foreground",
                    isCurrent && "border-accent bg-background text-accent shadow-lg",
                    isUpcoming && "border-border bg-background text-muted-foreground",
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                      <Check className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </motion.div>
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
