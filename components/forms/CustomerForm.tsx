import React from 'react';
import DynamicForm from './DynamicForm';

interface CustomerFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Customer"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Customer' : mode === 'edit' ? 'Edit Customer' : 'View Customer'}
    />
  );
};

export default CustomerForm;