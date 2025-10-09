// components/ProjectSetup/MessagesForm.tsx
import React from 'react';

interface MessagesFormProps {
  beforeMessage: string;
  duringScenario: string;
  afterMessage: string;
  onBeforeMessageChange: (value: string) => void;
  onDuringScenarioChange: (value: string) => void;
  onAfterMessageChange: (value: string) => void;
}

export function MessagesForm({
  beforeMessage,
  duringScenario,
  afterMessage,
  onBeforeMessageChange,
  onDuringScenarioChange,
  onAfterMessageChange
}: MessagesFormProps) {
  return (
    <>
      {/* Before Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-xl font-bold text-gray-900">Before Session Message</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This message will be the first thing participants see before the session starts.
        </p>
        <textarea
          value={beforeMessage}
          onChange={(e) => onBeforeMessageChange(e.target.value)}
          placeholder="Enter welcome message..."
          maxLength={1000}
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {beforeMessage.length}/1000 characters
        </p>
      </div>

      {/* During Scenario */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-xl font-bold text-gray-900">During Session Scenario</h2>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Context</label>
        <p className="text-sm text-gray-600 mb-3">
          Tell participants what their frame of mind should be before starting their first task.
        </p>
        <textarea
          value={duringScenario}
          onChange={(e) => onDuringScenarioChange(e.target.value)}
          placeholder="e.g., Imagine you are shopping for a birthday gift..."
          maxLength={1000}
          className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {duringScenario.length}/1000 characters
        </p>
      </div>

      {/* After Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-xl font-bold text-gray-900">After Session Message</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is the message participants will see upon completion of the session.
        </p>
        <textarea
          value={afterMessage}
          onChange={(e) => onAfterMessageChange(e.target.value)}
          placeholder="Enter thank you message..."
          maxLength={1000}
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {afterMessage.length}/1000 characters
        </p>
      </div>
    </>
  );
}