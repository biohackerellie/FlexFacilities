"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFormStore } from "@/lib/form-store"

interface StepCompleteProps {
  onReset: () => void
}

export function StepComplete({ onReset }: StepCompleteProps) {
  const { formData } = useFormStore()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="rounded-full bg-accent/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-accent" />
        </div>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-balance">Form Submitted Successfully!</h2>
        <p className="text-muted-foreground text-balance">
          Thank you for completing the form. We&apos;ve received your information.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-left">
        <h3 className="mb-4 font-semibold">Submitted Information:</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name:</dt>
            <dd className="font-medium">
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email:</dt>
            <dd className="font-medium">{formData.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Age:</dt>
            <dd className="font-medium">{formData.age}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phone:</dt>
            <dd className="font-medium">{formData.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Newsletter:</dt>
            <dd className="font-medium">{formData.newsletter ? "Subscribed" : "Not subscribed"}</dd>
          </div>
        </dl>
      </div>

      <Button onClick={onReset} size="lg" variant="outline">
        Start Over
      </Button>
    </motion.div>
  )
}
