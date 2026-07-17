// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="space-y-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-600">Loading dashboard...</p>
            </div>
        </div>
    );
}