import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import { getOrders, createOrder, deleteOrder } from '../api/orders'
import { getCustomers } from '../api/customers'
import { getProducts } from '../api/products'

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Order form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [currentProductId, setCurrentProductId] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState(1)

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts(),
      ])
      setOrders(ordersRes.data)
      setCustomers(customersRes.data)
      setProducts(productsRes.data)
    } catch (err) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter((o) => {
      const customer = customers.find((c) => c.id === o.customer_id)
      const customerName = customer?.full_name?.toLowerCase() || ''
      return (
        String(o.id).includes(q) ||
        customerName.includes(q) ||
        formatCurrency(o.total_amount).toLowerCase().includes(q)
      )
    })
  }, [orders, search, customers])

  const customerMap = useMemo(() => {
    const map = {}
    customers.forEach((c) => (map[c.id] = c))
    return map
  }, [customers])

  const productMap = useMemo(() => {
    const map = {}
    products.forEach((p) => (map[p.id] = p))
    return map
  }, [products])

  const runningTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const product = productMap[item.product_id]
      return sum + (product ? Number(product.price) * item.quantity : 0)
    }, 0)
  }, [orderItems, productMap])

  const openModal = () => {
    setSelectedCustomerId('')
    setOrderItems([])
    setCurrentProductId('')
    setCurrentQuantity(1)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const addItem = () => {
    if (!currentProductId) {
      toast.error('Please select a product')
      return
    }

    const prodId = parseInt(currentProductId, 10)
    const qty = parseInt(currentQuantity, 10)

    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    // Check if product already in items
    const existing = orderItems.find((item) => item.product_id === prodId)
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.product_id === prodId
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      )
    } else {
      setOrderItems([...orderItems, { product_id: prodId, quantity: qty }])
    }

    setCurrentProductId('')
    setCurrentQuantity(1)
  }

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter((item) => item.product_id !== productId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedCustomerId) {
      toast.error('Please select a customer')
      return
    }
    if (orderItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    // Client-side stock validation
    for (const item of orderItems) {
      const product = productMap[item.product_id]
      if (!product) {
        toast.error(`Product #${item.product_id} not found`)
        return
      }
      if (product.quantity_in_stock <= 0) {
        toast.error(`"${product.name}" is out of stock (Stock: 0)`)
        return
      }
      if (product.quantity_in_stock < item.quantity) {
        toast.error(
          `Insufficient stock for "${product.name}". Available: ${product.quantity_in_stock}, Requested: ${item.quantity}`
        )
        return
      }
    }

    setSubmitting(true)
    try {
      await createOrder({
        customer_id: parseInt(selectedCustomerId, 10),
        items: orderItems,
      })
      toast.success('Order placed successfully!')
      closeModal()
      fetchData()
    } catch (err) {
      const message =
        err?.message ||
        err?.response?.data?.detail ||
        'Failed to create order'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }


  const handleDelete = async (order) => {
    if (!window.confirm(`Delete Order #${order.id}? This action cannot be undone.`)) return
    try {
      await deleteOrder(order.id)
      toast.success('Order deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete order')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Orders</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage orders and track fulfillment ({orders.length} total)
          </p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" />
          Create Order
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by order #, customer, or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Orders table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700/20 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              {search ? 'No orders match your search' : 'No orders yet'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'Create your first order to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="table-header">Order #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filtered.map((order, index) => {
                  const customer = customerMap[order.customer_id]
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors duration-150 hover:bg-gray-800/30 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/10'
                      }`}
                    >
                      <td className="table-cell">
                        <span className="inline-flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10">
                            <ShoppingCartIcon className="w-4 h-4 text-indigo-400" />
                          </div>
                          <span className="font-mono font-semibold text-gray-200">
                            #{order.id}
                          </span>
                        </span>
                      </td>
                      <td className="table-cell">
                        {customer ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/20 flex-shrink-0">
                              {customer.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-200 font-medium">{customer.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800/80 text-gray-300 border border-gray-700/50">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="table-cell text-gray-400 text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => handleDelete(order)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Create New Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="input-field"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Add Items */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Items <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={currentProductId}
                onChange={(e) => setCurrentProductId(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)} (Stock: {p.quantity_in_stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="input-field w-20 text-center"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary px-3 flex-shrink-0"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          {orderItems.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700/30">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Order Items
                </p>
              </div>
              <div className="divide-y divide-gray-700/20">
                {orderItems.map((item) => {
                  const product = productMap[item.product_id]
                  return (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">
                          {product?.name || `Product #${item.product_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(product?.price || 0)} × {item.quantity} ={' '}
                          <span className="text-emerald-400 font-medium">
                            {formatCurrency((product?.price || 0) * item.quantity)}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-t border-gray-700/30 flex items-center justify-between bg-gray-800/20">
                <span className="text-sm font-medium text-gray-400">Estimated Total</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatCurrency(runningTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
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
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5" />
                  Place Order
                </>
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
