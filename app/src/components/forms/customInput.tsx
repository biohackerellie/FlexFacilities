'use client';

import { useFormContext } from 'react-hook-form';

export default function CustomInput({ name, rules, ...rest }: any) {
  const { register } = useFormContext();
  return (
    <input
      {...register(name, rules)}
      {...rest}
      className="border-3 form-input rounded-md border-primary bg-gray-300 text-black drop-shadow-xs dark:bg-slate-600 dark:text-white"
    />
  );
}
