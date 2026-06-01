import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products'

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' }

function StockBadge({ quantity }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {quantity}
      </span>
    )
  }
  if (quantity < 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {quantity}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {quantity}
    </span>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await getProducts()
      setProducts(res.data)
    } catch (err) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }, [products, search])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return false
    }
    if (!form.sku.trim()) {
      toast.error('SKU is required')
      return false
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Valid price is required')
      return false
    }
    if (form.quantity_in_stock === '' || isNaN(Number(form.quantity_in_stock)) || Number(form.quantity_in_stock) < 0) {
      toast.error('Valid stock quantity is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || 'Something went wrong'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return
    try {
      await deleteProduct(product.id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Products</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your product inventory ({products.length} total)
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, SKU, or description..."
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
            <CubeTransparentIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="table-header">Name</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filtered.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`transition-colors duration-150 hover:bg-gray-800/30 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/10'
                    }`}
                  >
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-200">{product.name}</p>

                      </div>
                    </td>
                    <td className="table-cell">
                      <code className="px-2 py-0.5 rounded bg-gray-800/80 text-gray-400 text-xs font-mono">
                        {product.sku}
                      </code>
                    </td>
                    <td className="table-cell font-medium text-gray-200">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="table-cell">
                      <StockBadge quantity={product.quantity_in_stock} />
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 transition-all duration-200"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Mouse"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SKU <span className="text-red-400">*</span>
            </label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="e.g. WM-001"
              className="input-field font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock <span className="text-red-400">*</span>
              </label>
              <input
                name="quantity_in_stock"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
              />
            </div>
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
                  Saving...
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
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
