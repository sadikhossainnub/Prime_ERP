import React from 'react';
import DynamicForm from './DynamicForm';

interface DeliveryNoteFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
}

const DeliveryNoteForm: React.FC<DeliveryNoteFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  return (
    <DynamicForm
      doctype="Delivery Note"
      initialData={initialData}
      mode={mode}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={mode === 'create' ? 'Create Delivery Note' : mode === 'edit' ? 'Edit Delivery Note' : 'View Delivery Note'}
    />
  );
};

export default DeliveryNoteForm;