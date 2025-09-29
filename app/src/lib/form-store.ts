import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface FormData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  email: string
  age: string

  // Step 2: Additional fields (placeholder for expansion)
  phone: string
  address: string

  // Step 3: Preferences (placeholder for expansion)
  preferences: string
  newsletter: boolean
}

interface FormStore {
  currentStep: number
  formData: FormData
  setCurrentStep: (step: number) => void
  updateFormData: (data: Partial<FormData>) => void
  resetForm: () => void
  nextStep: () => void
  previousStep: () => void
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  phone: "",
  address: "",
  preferences: "",
  newsletter: false,
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      formData: initialFormData,
      setCurrentStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetForm: () =>
        set({
          currentStep: 0,
          formData: initialFormData,
        }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        })),
      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),
    }),
    {
      name: "multi-step-form-storage",
    },
  ),
)
