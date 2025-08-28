import React from 'react';
import DynamicForm from './DynamicForm';

interface PaymentEntryFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
}

const PaymentEntryForm: React.FC<PaymentEntryFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Payment Entry"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Payment Entry' : mode === 'edit' ? 'Edit Payment Entry' : 'View Payment Entry'}
    />
  );
};

export default PaymentEntryForm;