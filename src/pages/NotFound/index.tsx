import EmptyState from '../../components/ui/EmptyState'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <EmptyState variant="not-found" />
    </div>
  )
}
