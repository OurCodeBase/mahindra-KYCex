import { Clock } from "lucide-react";

export default function App() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-xs max-w-xs">
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-6 rounded-full animate-pulse">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Waiting for Reload
        </h2>
        <p className="text-gray-500 mb-8">
          Goto robin and reload invoice section...
        </p>
      </div>
    </div>
  )
}
