'use client'

import { useEffect } from 'react'
import { X, Heart, Coffee, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleDonation = (amount: number) => {
    // Dodo Payments product links per amount
    const urlByAmount: Record<number, string> = {
      5: 'https://checkout.dodopayments.com/buy/pdt_sShrMgwjXkk2Has1z8LFU?quantity=1&redirect_url=https://www.talkflo.pro%2Fprotected&showDiscounts=false',
      10: 'https://checkout.dodopayments.com/buy/pdt_ssoVhz9zhE5Tvo4NzqLb5?quantity=1&redirect_url=https://www.talkflo.pro%2Fprotected&showDiscounts=false',
      20: 'https://checkout.dodopayments.com/buy/pdt_7mH0KP04DhPXaVHSHJTNw?quantity=1&redirect_url=https://www.https%3A%2F%2Fwww.talkflo.pro%2Fprotected&showDiscounts=false',
    }

    const url = urlByAmount[amount] ?? urlByAmount[5]
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="light fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8 pt-12">
              {/* Header with heart icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-yellow-600 fill-current" />
                </div>
                
                {/* Emotional message */}
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  I&apos;m building Talkflo to help people express their ideas better — but running this app takes time and money. If you&apos;ve enjoyed using Talkflo, please consider buying me a coffee to keep it alive. Every bit counts 💛
                </p>
              </div>

              {/* Donation buttons */}
              <div className="space-y-3">
                {/* $5 Button */}
                <button
                  onClick={() => handleDonation(5)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coffee className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">$5</div>
                        <div className="text-sm text-gray-600">Keeps Talkflo running for a day</div>
                      </div>
                    </div>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Default
                    </div>
                  </div>
                </button>

                {/* $10 Button - Most Popular */}
                <button
                  onClick={() => handleDonation(10)}
                  className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md border-2 border-blue-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">$10</div>
                        <div className="text-sm text-gray-600">Helps me build new features</div>
                      </div>
                    </div>
                    <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      Most Popular
                    </div>
                  </div>
                </button>

                {/* $20 Button */}
                <button
                  onClick={() => handleDonation(20)}
                  className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-yellow-600 fill-current" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">$20</div>
                        <div className="text-sm text-gray-600">You&apos;re powering the future of Talkflo</div>
                      </div>
                    </div>
                    <div className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full">
                      Legend
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer note */}
              <p className="text-center text-xs text-gray-500 mt-6">
                Secure payment powered by your preferred payment provider
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
