// components/ProjectSetup/WizardSteps/MessagesStep.tsx
import React from 'react';
import { MessageCircle, Eye, CheckCircle, Info } from 'lucide-react';
import { TextareaField } from '../../UI/FormFields';

interface MessagesStepProps {
  data: {
    beforeMessage: string;
    duringScenario: string;
    afterMessage: string;
    mode: 'moderated' | 'unmoderated' | null;
  };
  updateData: (updates: any) => void;
}

export function MessagesStep({ data, updateData }: MessagesStepProps) {
  return (
    <div className="space-y-8">
      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Session Flow Messages</p>
            <p className="mb-2">
              Customize the messages participants see at different stages of the testing session.
            </p>
            <p>
              These messages help set expectations, provide context, and guide participants through the testing process.
            </p>
          </div>
        </div>
      </div>

      {/* Before Session Message */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Welcome Message</h3>
            <p className="text-sm text-gray-600">Shown when participants first start the session</p>
          </div>
        </div>

        <TextareaField
          label="Before Session Message"
          value={data.beforeMessage}
          onChange={(value) => updateData({ beforeMessage: value })}
          placeholder="Enter welcome message..."
          maxLength={1000}
          rows={6}
          required
          error={data.beforeMessage.trim() === '' ? 'Welcome message is required' : undefined}
          hint="Introduce the session, set expectations, and provide any necessary instructions"
        />

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
            {data.beforeMessage || 'Your welcome message will appear here...'}
          </div>
        </div>
      </div>

      {/* During Session Scenario */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Scenario</h3>
            <p className="text-sm text-gray-600">Context shown before the first task</p>
          </div>
        </div>

        <TextareaField
          label="Scenario Context"
          value={data.duringScenario}
          onChange={(value) => updateData({ duringScenario: value })}
          placeholder="e.g., Imagine you are shopping for a birthday gift..."
          maxLength={1000}
          rows={4}
          hint="Set the mental context - what should participants imagine or pretend while completing tasks?"
        />

        {/* Mode-specific suggestions */}
        {data.mode && (
          <div className={`mt-4 p-3 rounded-lg ${
            data.mode === 'moderated' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
          }`}>
            <h5 className={`font-medium text-sm mb-2 ${
              data.mode === 'moderated' ? 'text-blue-900' : 'text-purple-900'
            }`}>
              {data.mode === 'moderated' ? 'Moderated' : 'Unmoderated'} Testing Tips:
            </h5>
            <div className={`text-sm ${
              data.mode === 'moderated' ? 'text-blue-800' : 'text-purple-800'
            }`}>
              {data.mode === 'moderated' ? (
                <ul className="space-y-1">
                  <li>• Keep scenarios simple since you can provide real-time guidance</li>
                  <li>• Focus on the user's goals rather than specific steps</li>
                  <li>• You can clarify or adjust the scenario during the session</li>
                </ul>
              ) : (
                <ul className="space-y-1">
                  <li>• Be very clear and specific about the context</li>
                  <li>• Include relevant details about the user's situation</li>
                  <li>• Consider multiple scenarios if tasks are diverse</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
            {data.duringScenario || 'Your scenario context will appear here...'}
          </div>
        </div>
      </div>

      {/* After Session Message */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completion Message</h3>
            <p className="text-sm text-gray-600">Thank you message shown after session ends</p>
          </div>
        </div>

        <TextareaField
          label="After Session Message"
          value={data.afterMessage}
          onChange={(value) => updateData({ afterMessage: value })}
          placeholder="Enter thank you message..."
          maxLength={1000}
          rows={5}
          required
          error={data.afterMessage.trim() === '' ? 'Completion message is required' : undefined}
          hint="Thank participants and explain what happens next with their feedback"
        />

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
            {data.afterMessage || 'Your completion message will appear here...'}
          </div>
        </div>
      </div>

      {/* Message Flow Visualization */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Session Message Flow
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Welcome</div>
              <div className="text-sm text-gray-600">Participant sees the welcome message and any recording preferences</div>
            </div>
          </div>
          
          <div className="ml-4 border-l-2 border-gray-300 h-6"></div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Scenario</div>
              <div className="text-sm text-gray-600">Participant reads the scenario context before starting tasks</div>
            </div>
          </div>
          
          <div className="ml-4 border-l-2 border-gray-300 h-6"></div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              N
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Tasks</div>
              <div className="text-sm text-gray-600">Participant completes tasks and provides feedback</div>
            </div>
          </div>
          
          <div className="ml-4 border-l-2 border-gray-300 h-6"></div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Completion</div>
              <div className="text-sm text-gray-600">Participant sees the thank you message and session summary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">Message Best Practices</h4>
        <div className="text-sm text-amber-800 space-y-1">
          <p>• Keep messages conversational and friendly</p>
          <p>• Clearly explain what participants should expect</p>
          <p>• Mention estimated time requirements</p>
          <p>• Reassure participants there are no "wrong" answers</p>
          <p>• Include contact information for questions or technical issues</p>
        </div>
      </div>
    </div>
  );
}