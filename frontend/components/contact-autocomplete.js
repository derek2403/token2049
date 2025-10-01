/**
 * Contact Autocomplete Component
 * Shows dropdown of contacts when user types @
 */

import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet } from 'lucide-react';
import { Card } from './ui/card';

export function ContactAutocomplete({ contacts, onSelect, position }) {
  if (!contacts || contacts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50"
        style={{
          bottom: position?.bottom || '100%',
          left: position?.left || 0,
          marginBottom: '8px',
        }}
      >
        <Card className="bg-neutral-900 border-neutral-700 max-h-64 overflow-y-auto w-80">
          <div className="p-2">
            <div className="text-xs text-neutral-500 px-2 py-1 mb-1">
              Select Contact
            </div>
            {contacts.map((contact, index) => (
              <button
                key={index}
                onClick={() => onSelect(contact)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-100 font-medium">
                    {contact.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono truncate">
                    {contact.wallet.substring(0, 10)}...{contact.wallet.substring(38)}
                  </div>
                </div>
                <div className="text-xs text-neutral-600">
                  <Wallet className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

