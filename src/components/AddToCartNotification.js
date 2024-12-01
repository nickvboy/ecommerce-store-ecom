import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

function AddToCartNotification({ show, onClose }) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-0 right-0 z-50 mb-4 mr-4 flex max-w-md items-center rounded-lg bg-bg-100 p-4 shadow-lg ring-1 ring-black ring-opacity-5">
        <CheckCircleIcon className="h-6 w-6 text-primary-100" />
        <p className="ml-3 text-sm font-medium text-text-100">
          Item added to cart
        </p>
        <button
          type="button"
          className="ml-4 inline-flex text-text-200 hover:text-text-100"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <span className="text-xl">&times;</span>
        </button>
      </div>
    </Transition>
  );
}

export default AddToCartNotification; 