import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Notification({ show, onClose, message, type = 'success' }) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-500 transition"
      enterFrom="translate-y-[-1rem] opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-400"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-0 right-0 z-50 mt-4 mr-4 flex max-w-md items-center rounded-lg bg-bg-100 p-4 shadow-lg ring-1 ring-black ring-opacity-5 animate-bounce-gentle">
        {type === 'success' && <CheckCircleIcon className="h-6 w-6 text-primary-100" />}
        {type === 'error' && <XMarkIcon className="h-6 w-6 text-red-500" />}
        <p className="ml-3 text-sm font-medium text-text-100">
          {message}
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

export default Notification; 