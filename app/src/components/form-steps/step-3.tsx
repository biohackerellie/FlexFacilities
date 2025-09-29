"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, type Step3Data } from "@/lib/form-schemas"
import { useFormStore } from "@/lib/form-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

interface Step3Props {
  onSubmit: () => void
  onBack: () => void
}

export function Step3({ onSubmit, onBack }: Step3Props) {
  const { formData, updateFormData } = useFormStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      preferences: formData.preferences,
      newsletter: formData.newsletter,
    },
  })

  const newsletter = watch("newsletter")

  const handleFormSubmit = (data: Step3Data) => {
    updateFormData(data)
    onSubmit()
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferences">Your Preferences</Label>
          <Textarea
            id="preferences"
            placeholder="Tell us about your preferences..."
            rows={5}
            {...register("preferences")}
            className={errors.preferences ? "border-destructive" : ""}
          />
          {errors.preferences && <p className="text-sm text-destructive">{errors.preferences.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="newsletter"
            checked={newsletter}
            onCheckedChange={(checked) => setValue("newsletter", checked as boolean)}
          />
          <Label htmlFor="newsletter" className="cursor-pointer text-sm font-normal leading-relaxed">
            Subscribe to our newsletter for updates and exclusive offers
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="min-w-32">
          Submit
        </Button>
      </div>
    </motion.form>
  )
}
