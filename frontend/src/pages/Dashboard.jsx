import { useState, useEffect } from 'react'
import {
  CubeTransparentIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import StatsCard from '../components/StatsCard'
import { getDashboardStats } from '../api/stats'
import { getLowStockProducts } from '../api/products'

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-gray-700/50 rounded" />
          <div className="h-10 w-20 bg-gray-700/50 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-700/50 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-gray-800/50">
        <div className="h-6 w-40 bg-gray-700/50 rounded" />
      </div>
      <div className="p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-700/30 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Out of Stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      {stock} left
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          getDashboardStats(),
          getLowStockProducts(5),
        ])
        setStats(statsRes.data)
        setLowStock(lowStockRes.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1.5 text-sm">Welcome back. Here's your inventory overview.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Products"
              value={stats?.total_products ?? 0}
              icon={CubeTransparentIcon}
              gradient="indigo"
            />
            <StatsCard
              title="Total Customers"
              value={stats?.total_customers ?? 0}
              icon={UsersIcon}
              gradient="emerald"
            />
            <StatsCard
              title="Total Orders"
              value={stats?.total_orders ?? 0}
              icon={ClipboardDocumentListIcon}
              gradient="amber"
            />
          </>
        )}
      </div>

      {/* Low stock alerts */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800/50">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Low Stock Alerts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Products with fewer than 5 units in stock</p>
            </div>
            {lowStock.length > 0 && (
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {lowStock.length} alert{lowStock.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {lowStock.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 mb-4">
                <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-gray-300 font-medium">All stock levels are healthy!</p>
              <p className="text-gray-500 text-sm mt-1">No products are running low on inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="table-header">Product</th>
                    <th className="table-header">SKU</th>
                    <th className="table-header">Price</th>
                    <th className="table-header">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {lowStock.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`transition-colors duration-150 hover:bg-gray-800/30 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/10'
                      }`}
                    >
                      <td className="table-cell font-medium text-gray-200">{product.name}</td>
                      <td className="table-cell">
                        <code className="px-2 py-0.5 rounded bg-gray-800/80 text-gray-400 text-xs font-mono">
                          {product.sku}
                        </code>
                      </td>
                      <td className="table-cell">${Number(product.price).toFixed(2)}</td>
                      <td className="table-cell">
                        <StockBadge stock={product.quantity_in_stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
