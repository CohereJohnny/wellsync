export default function TransformerLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left column - 3/5 width */}
          <div className="md:col-span-3 space-y-6">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          {/* Right column - 2/5 width */}
          <div className="md:col-span-2">
            <div className="h-[600px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 