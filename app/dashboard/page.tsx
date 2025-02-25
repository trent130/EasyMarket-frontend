import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1>Dashboard</h1>
        {/* Add dashboard-specific components here */}
      </DashboardLayout>
    </ProtectedRoute>

  );
};

export default DashboardPage;
