import React from 'react';
import DynamicForm from './DynamicForm';

interface QuotationFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
}

const QuotationForm: React.FC<QuotationFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Quotation"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Quotation' : 'Edit Quotation'}
    />
  );
};

export default QuotationForm;