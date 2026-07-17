// app/(dashboard)/loading.tsx
export default function DashboardLayoutLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
    );
}