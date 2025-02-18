import React, { useState } from 'react';
import { KeywordsList } from './KeywordsList';

export const KeywordsManager: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editingKeyword, setEditingKeyword] = useState<{ index: number; value: string } | null>(null);

  const handleEdit = (index: number, value: string) => {
    setEditingKeyword({ index, value });
  };

  const handleSave = () => {
    if (editingKeyword) {
      const newKeywords = [...keywords];
      newKeywords[editingKeyword.index] = editingKeyword.value;
      setKeywords(newKeywords);
      setEditingKeyword(null);
    }
  };

  const handleCancel = () => {
    setEditingKeyword(null);
  };

  const handleDelete = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleEditingChange = (index: number, value: string) => {
    setEditingKeyword({ index, value });
  };

  const handleAddToNonKeywords = (keyword: string) => {
    // Implement logic to add keyword to non-keywords list
  };

  return (
    <KeywordsList
      keywords={keywords}
      editingKeyword={editingKeyword}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onEditingChange={handleEditingChange}
      onAddToNonKeywords={handleAddToNonKeywords}
    />
  );
};
