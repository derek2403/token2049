/**
 * Contacts Hook
 * Provides access to user contacts
 */

import { useState, useEffect } from 'react';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load contacts from JSON file
    fetch('/data/contacts.json')
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading contacts:', error);
        setLoading(false);
      });
  }, []);

  /**
   * Search contacts by name
   */
  const searchContacts = (query) => {
    if (!query) return contacts;
    
    const lowerQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.phone.includes(query) ||
      contact.wallet.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Get contact by name (exact or partial match)
   */
  const getContactByName = (name) => {
    const lowerName = name.toLowerCase();
    return contacts.find(contact => 
      contact.name.toLowerCase() === lowerName
    ) || contacts.find(contact =>
      contact.name.toLowerCase().includes(lowerName)
    );
  };

  return {
    contacts,
    loading,
    searchContacts,
    getContactByName,
  };
}

