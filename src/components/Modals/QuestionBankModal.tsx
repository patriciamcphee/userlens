// components/QuestionBank/QuestionBankModal.tsx
import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Info, Tag } from 'lucide-react';
import { TaskQuestion } from '../../types';
import { QUESTION_BANK, QuestionBankItem, getCategories } from '../../constants/questionBank';

interface QuestionBankModalProps {
  onClose: () => void;
  onSelectQuestions: (questions: TaskQuestion[]) => void;
  existingQuestions: TaskQuestion[];
}

export function QuestionBankModal({ onClose, onSelectQuestions, existingQuestions }: QuestionBankModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionBankItem['category'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankItem[]>([]);


  // Filter questions based on category and search
  const filteredQuestions = QUESTION_BANK.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleToggleQuestion = (question: QuestionBankItem) => {
    const isSelected = selectedQuestions.some(q => q.question === question.question);
    
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q.question !== question.question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleAddQuestions = () => {
    // Convert QuestionBankItems to TaskQuestions with unique IDs
    const taskQuestions: TaskQuestion[] = selectedQuestions.map(q => ({
      id: Date.now() + Math.random(), // Unique ID
      question: q.question,
      type: q.type,
      options: q.options,
      required: q.required
    }));
    
    onSelectQuestions(taskQuestions);
    onClose();
  };

  // Quick actions for adding complete question sets
  const handleAddAllSUS = () => {
    const susQuestions = QUESTION_BANK.filter(q => q.category === 'SUS');
    setSelectedQuestions(susQuestions);
  };

  const isQuestionSelected = (question: QuestionBankItem) => {
    return selectedQuestions.some(q => q.question === question.question);
  };

  const getCategoryColor = (category: QuestionBankItem['category']) => {
    const colors = {
      'SUS': 'bg-purple-100 text-purple-700 border-purple-300',
      'Post-Task': 'bg-blue-100 text-blue-700 border-blue-300',
      'Pre-Test': 'bg-green-100 text-green-700 border-green-300',
      'Feature-Specific': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Follow-Up': 'bg-orange-100 text-orange-700 border-orange-300',
      'Demographics': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category];
  };

  const getCategoryCount = (category: QuestionBankItem['category'] | 'all') => {
    if (category === 'all') return QUESTION_BANK.length;
    return QUESTION_BANK.filter(q => q.category === category).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select from research-validated questions • Total: {QUESTION_BANK.length} • Showing: {filteredQuestions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="border-b border-gray-200 px-6 py-4 space-y-4 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                console.log('🔍 Search changed to:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search questions, tags, or descriptions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                console.log('📁 Category changed to: all');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getCategoryCount('all')})
            </button>
            {getCategories().map(category => (
              <button
                key={category}
                onClick={() => {
                  console.log('📁 Category changed to:', category);
                  setSelectedCategory(category);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({getCategoryCount(category)})
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Quick Add:</span>
            <button
              onClick={handleAddAllSUS}
              className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors border border-purple-200"
            >
              + All SUS Questions (10)
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            📊 Rendering {filteredQuestions.length} questions below:
          </div>
          
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No questions found matching your criteria</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => {
                const isSelected = isQuestionSelected(question);
                
                return (
                  <div
                    key={`${question.category}-${index}`}
                    onClick={() => handleToggleQuestion(question)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600'
                          : 'border-2 border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="font-medium text-gray-900">
                            #{index + 1}: {question.question}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getCategoryColor(question.category)}`}>
                            {question.category}
                          </span>
                        </div>

                        {question.description && (
                          <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">
                            Type: <span className="font-medium text-gray-700">{question.type}</span>
                          </span>
                          
                          {question.options && question.options.length > 0 && (
                            <span className="text-gray-500">
                              Options: <span className="font-medium text-gray-700">{question.options.length}</span>
                            </span>
                          )}
                          
                          {question.required && (
                            <span className="text-red-600 font-medium">Required</span>
                          )}
                        </div>

                        {question.tags && question.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {question.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedQuestions.length > 0 ? (
              <span className="font-medium">
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>Select questions to add to your task</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                selectedQuestions.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Selected Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}