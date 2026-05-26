import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Clock, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="pt-16 pb-16 min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-wood-900 text-cream py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Corporate Gifting</h1>
          <p className="text-wood-300 text-lg">
            Custom laser-engraved gifts filled with our freshly roasted treats. Tell us
            about your list and we'll handle the rest.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-wood-900 mb-6">
              Let's Talk Gifting
            </h2>
            <p className="text-wood-500 mb-8">
              Whether you need 10 engraved boxes or a few hundred, our family team will
              help you create a gift your clients and staff actually remember. Reach out
              and we'll get back to you within one business day.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'hello@simplynutsandmore.com' },
                { icon: Phone, label: 'Phone', value: '1-888-449-6887' },
                { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-5pm CST' },
                { icon: MapPin, label: 'Roastery', value: 'Chanhassen, Minnesota' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-burn/10 flex items-center justify-center text-burn flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-wood-900 text-sm">{item.label}</p>
                    <p className="text-wood-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-wood-100 rounded-xl">
              <h3 className="font-display font-semibold text-wood-900 mb-2">
                How Corporate Gifting Works
              </h3>
              <ol className="text-sm text-wood-600 space-y-1 list-decimal pl-4">
                <li>Pick a container and add your logo</li>
                <li>Choose the nuts, mixes &amp; chocolates inside</li>
                <li>Send your recipient list — we engrave, pack &amp; ship</li>
              </ol>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-sm border border-wood-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <img src="/brand/chippy.png" alt="" aria-hidden="true" className="w-16 h-auto mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-wood-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-wood-500">
                  Thanks for reaching out — we'll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display text-xl font-bold text-wood-900 mb-2">
                  Request a Quote
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-wood-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-wood-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-wood-700 mb-1">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-wood-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-wood-700 mb-1">
                    Estimated Quantity
                  </label>
                  <select
                    id="quantity"
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm bg-white"
                  >
                    <option>10-49 gifts</option>
                    <option>50-99 gifts</option>
                    <option>100-499 gifts</option>
                    <option>500+ gifts</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-wood-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm resize-none"
                    placeholder="Tell us about your gifting needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer"
                >
                  <Send size={18} /> Send Request
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
