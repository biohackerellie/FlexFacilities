'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactModal from 'react-modal';

import { Button } from '../ui/buttons';

interface IFormInput {
  department: string;
  reservationID: number;
  user: string;
  summary: string;
  description?: string;
}

export default function JiraModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { register, handleSubmit } = useForm<IFormInput>();
  const hideModal = () => setIsVisible(false);
  const showModal = () => setIsVisible(true);

  const onSubmit = async (data: IFormInput) => {
    setIsSubmitting(true);

    const formData = JSON.stringify(data);
    try {
      const res = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData,
      });
      alert('Ticket Submitted');
      hideModal();
    } catch (error) {
      alert('An error occurred while submitting your ticket. Lol');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={showModal}>
        Submit a Work Order
      </Button>

      <ReactModal
        className="relative inset-0 inset-y-20 z-50 flex animate-overlay-show flex-col items-center justify-center text-black transition-all duration-1000 ease-in-out dark:text-black"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 modal-overlay"
        isOpen={!!isVisible}
      >
        <div className="align-center sm:min-w-34 flex max-w-sm flex-col flex-wrap justify-center self-center rounded-lg bg-white p-4 sm:max-w-3xl">
          <h1 className="text-center text-2xl font-bold">
            Submit a Work Order
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col">
              <label htmlFor="department">Department</label>
              <select {...register('department', { required: true })}>
                <option value="Select">Select</option>
                <option value="IT">IT</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="summary">Summary</label>
              <input
                type="text"
                id="summary"
                {...register('summary', { required: true })}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Provide additional details, if any."
              />
            </div>
            <div className="mt-2 flex justify-between">
              <div>
                <Button type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
              </div>
              <div>
                <Button onClick={hideModal}>Cancel</Button>
              </div>
            </div>
          </form>
        </div>
      </ReactModal>
    </>
  );
}
