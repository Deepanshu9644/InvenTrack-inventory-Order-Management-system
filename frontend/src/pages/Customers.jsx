import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import { getCustomers, createCustomer, deleteCustomer } from '../api/customers'

const emptyForm = { full_name: '', email: '', phone_number: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers()
      setCustomers(res.data)
    } catch (err) {
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone_number && c.phone_number.toLowerCase().includes(q))
    )
  }, [customers, search])

  const openModal = () => {
    setForm(emptyForm)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(emptyForm)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validate = () => {
    if (!form.full_name.trim()) {
      toast.error('Customer name is required')
      return false
    }
    if (!form.email.trim()) {
      toast.error('Email is required')
      return false
    }
    if (!validateEmail(form.email.trim())) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim() || null,
    }

    try {
      await createCustomer(payload)
      toast.success('Customer added successfully')
      closeModal()
      fetchCustomers()
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || 'Failed to add customer'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete "${customer.full_name}"? This action cannot be undone.`)) return
    try {
      await deleteCustomer(customer.id)
      toast.success('Customer deleted')
      fetchCustomers()
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Customers</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your customer directory ({customers.length} total)
          </p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700/20 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              {search ? 'No customers match your search' : 'No customers yet'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'Add your first customer to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filtered.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={`transition-colors duration-150 hover:bg-gray-800/30 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/10'
                    }`}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-200">{customer.full_name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 text-gray-400">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      {customer.phone_number ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          {customer.phone_number}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleDelete(customer)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Add Customer">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="e.g. +1 555-0123"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Customer'
              )}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
