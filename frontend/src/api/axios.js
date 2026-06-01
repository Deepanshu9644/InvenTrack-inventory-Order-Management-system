import axios from 'axios'

const api = axios.create({
  baseURL: 'https://inventrack-inventory-order-management-system-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred'

    if (error.response && error.response.data) {
      const detail = error.response.data.detail
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        // FastAPI validation errors come as array
        message = detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ')
      } else if (detail) {
        message = JSON.stringify(detail)
      }
    } else if (error.message) {
      message = error.message
    }

    return Promise.reject(new Error(message))
  }
)

export default api
