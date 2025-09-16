// Admin functionality has been removed for this simplified app.
// Keeping this route minimal to avoid build-time import errors.
export default function AdminRemoved() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h1 className="text-lg font-semibold text-gray-900">Not available</h1>
        <p className="text-sm text-gray-600 mt-2">
          Admin features were removed in this simplified Topic Mastery app.
        </p>
      </div>
    </div>
  );
}
