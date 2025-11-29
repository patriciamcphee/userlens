import { CheckCircle } from "lucide-react";

export function SessionComplete() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8 mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Session Complete!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for participating in this user testing session. Your recording has been saved and uploaded successfully.
        </p>
        
        <p className="text-sm text-gray-500">
          You can now close this window or tab.
        </p>
      </div>
    </div>
  );
}
