import React from 'react';
import DynamicForm from './DynamicForm';

interface SalesOrderFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Sales Order"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Sales Order' : 'Edit Sales Order'}
    />
  );
};

export default SalesOrderForm;