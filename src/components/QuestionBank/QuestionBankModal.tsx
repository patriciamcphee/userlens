import React, { useState } from 'react';
import { TaskQuestion } from '../../types';

interface QuestionBankModalProps {
  onClose: () => void;
  onSelectQuestions: (questions: TaskQuestion[]) => void;
  existingQuestions: TaskQuestion[];
}

/**
 * Minimal Question Bank modal used by TaskItem.
 * This implementation intentionally keeps UI simple and dependency-free
 * so it compiles and can be extended later.
 */
export function QuestionBankModal({
  onClose,
  onSelectQuestions,
  existingQuestions
}: QuestionBankModalProps) {
  const sampleQuestions: TaskQuestion[] = [
    { id: 1000001, question: 'How easy was it to complete the task?', type: 'text', required: false },
    { id: 1000002, question: 'Did you find what you needed?', type: 'yes-no', required: true },
    { id: 1000003, question: 'Which features did you use?', type: 'checkbox', required: false, options: ['Search', 'Filters', 'Sort'] },
    { id: 1000004, question: 'Rate your overall satisfaction', type: 'multiple-choice', required: false, options: ['Very unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] }
  ];

  // Keep track of selected sample questions by id
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleAddSelected = () => {
    // Filter out any sample questions that collide with existing question ids
    const existingIds = new Set((existingQuestions || []).map(q => q.id));
    const toAdd = sampleQuestions
      .filter(q => selectedIds.includes(q.id))
      .map(q => ({ ...q, id: Date.now() + Math.floor(Math.random() * 10000) })); // ensure unique ids

    onSelectQuestions(toAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Question Bank</h3>
          <button onClick={onClose} aria-label="Close" className="text-sm text-gray-600">Close</button>
        </div>

        <div className="p-4 max-h-80 overflow-auto space-y-3">
          <p className="text-xs text-gray-500">Select one or more questions to add to the task.</p>
          {sampleQuestions.map(q => (
            <label key={q.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedIds.includes(q.id)}
                onChange={() => toggleSelect(q.id)}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-medium">{q.question}</div>
                <div className="text-xs text-gray-500 mt-1">Type: {q.type}</div>
                {q.options && <div className="text-xs text-gray-400 mt-1">Options: {q.options.join(', ')}</div>}
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedIds.length === 0}
            className={`px-3 py-1 text-sm rounded text-white ${selectedIds.length === 0 ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}