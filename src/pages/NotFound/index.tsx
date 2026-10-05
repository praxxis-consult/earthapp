import EmptyState from '../../components/ui/EmptyState'

export default function NotFound() {
  return (
    <div className="bg-[#f5f5f5] flex items-center justify-center py-[64px]">
      <EmptyState variant="not-found" />
    </div>
  )
}
