export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
