import { useState } from 'react';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactInfo = {
    address: {
      street: '123 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States'
    },
    phone: '+1 (415) 555-0123',
    fax: '+1 (415) 555-0124',
    email: 'contact@gridgegear.com',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM PST'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          Contact Us
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          Have questions? We're here to help and would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-text-100 mb-8">Get in Touch</h2>
          
          <div className="space-y-6">
            {/* Address */}
            <div className="flex items-start space-x-4">
              <MapPinIcon className="w-6 h-6 text-primary-100 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-text-100 mb-2">Visit Us</h3>
                <p className="text-text-200">
                  {contactInfo.address.street}<br />
                  {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zip}<br />
                  {contactInfo.address.country}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <PhoneIcon className="w-6 h-6 text-primary-100 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-text-100 mb-2">Call Us</h3>
                <p className="text-text-200">{contactInfo.phone}</p>
              </div>
            </div>

            {/* Fax */}
            <div className="flex items-start space-x-4">
              <PrinterIcon className="w-6 h-6 text-primary-100 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-text-100 mb-2">Fax</h3>
                <p className="text-text-200">{contactInfo.fax}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <EnvelopeIcon className="w-6 h-6 text-primary-100 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-text-100 mb-2">Email Us</h3>
                <p className="text-text-200">{contactInfo.email}</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-8 p-6 bg-bg-200 rounded-lg">
              <h3 className="font-medium text-text-100 mb-2">Business Hours</h3>
              <p className="text-text-200">{contactInfo.hours}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-text-100 mb-8">Send Us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-200 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-bg-300 bg-bg-200 text-text-100
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-200 mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-bg-300 bg-bg-200 text-text-100
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-text-200 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-bg-300 bg-bg-200 text-text-100
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-200 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-bg-300 bg-bg-200 text-text-100
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-100 text-white font-semibold rounded-lg
                hover:bg-primary-200 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-16">
        <div className="bg-bg-200 rounded-lg p-4 h-[400px] flex items-center justify-center">
          <p className="text-text-200">Map integration would go here</p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs; 