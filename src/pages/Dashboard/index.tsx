import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const stats = [
  { label: 'Total Users', value: '0' },
  { label: 'Revenue', value: '$0' },
  { label: 'Orders', value: '0' },
  { label: 'Growth', value: '0%' },
]

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-gray-500 text-sm">Dashboard content goes here.</p>
      </Card>
    </div>
  )
}
