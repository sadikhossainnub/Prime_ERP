import React from 'react';
import DynamicForm from './DynamicForm';

interface ItemFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
}

const ItemForm: React.FC<ItemFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Item"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Item' : 'Edit Item'}
    />
  );
};

export default ItemForm;