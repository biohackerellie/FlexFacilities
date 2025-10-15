import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OccurrenceType, RecurrencePatternType } from './form-schemas';

export interface FormData {
  // Step 1
  userID: string;
  facilityID: string;

  // Step 2
  eventName: string;
  details: string;
  categoryID: string;
  name: string;
  phone: string;

  // Step 3
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  pattern?: RecurrencePatternType;
  occurrences?: OccurrenceType[];

  // Step 4
  techSupport: boolean;
  techDetails?: string;
  doorAccess: boolean;
  doorDetails?: string;
}

interface FormStore {
  currentStep: number;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

const initialFormData: FormData = {
  userID: '',
  facilityID: '',
  eventName: '',
  details: '',
  categoryID: '',
  name: '',
  phone: '',
  techSupport: false,
  techDetails: '',
  doorAccess: false,
  doorDetails: '',
};

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
      name: 'multi-step-form-storage',
    },
  ),
);
