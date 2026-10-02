import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
