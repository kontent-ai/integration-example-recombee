import { IContentType } from '@kontent-ai/delivery-sdk';
import { FC, useCallback, useState } from 'react';

import { Modal } from './Modal';
import { MultiSelect } from './multiSelect/MultiSelect';
import { TypeBadge } from './TypeBadge';

type Props = Readonly<{
  allTypes: ReadonlyArray<IContentType>;
  onRegisterTypes: (types: ReadonlyArray<IContentType>) => void;
  isDisabled: boolean;
}>

export const RegisterTypeSection: FC<Props> = props => {
  const [selectedTypes, setSelectedTypes] = useState<ReadonlyArray<IContentType>>([]);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  const submitSelectedTypes = () => {
    props.onRegisterTypes(selectedTypes);
    setSelectedTypes([]);
  };

  const closeConfirmation = () => setIsConfirmDialogVisible(false);
  const submitConfirmation = () => {
    closeConfirmation();
    submitSelectedTypes();
  };

  const toggleTypeSelection = useCallback((toToggle: IContentType) => setSelectedTypes(prevSelected => {
    if (prevSelected.includes(toToggle)) {
      return prevSelected.filter(t => t !== toToggle);
    }
    return [...prevSelected, toToggle];
  }), []);

  return (
    <div style={{ paddingTop: 10, paddingRight: 30 }}>
      <b>Add new types/refresh existing: </b>
      <div className="register-types-input-wrapper">
        <MultiSelect
          isDisabled={props.isDisabled}
          selectedOptions={selectedTypes}
          allOptions={props.allTypes}
          getOptionId={getTypeId}
          getOptionName={getTypeName}
          onToggleOptionSelection={toggleTypeSelection}
          renderSelectedOption={type => (
            <TypeBadge
              key={type.system.id}
              name={type.system.name}
              isDisabled={props.isDisabled}
              onRemove={() => setSelectedTypes(prev => prev.filter(t => t !== type))}
            />
          )}
        />
        <button
          className="btn btn--primary register-types-input__button"
          disabled={!selectedTypes.length || props.isDisabled}
          onClick={() => setIsConfirmDialogVisible(true)}
          type="button"
        >
          Submit
        </button>
      </div>
      <Modal
        isOpen={isConfirmDialogVisible}
        onClose={closeConfirmation}
        title="Confirm"
      >
        <p className="modal-body">
          Are you sure you wish to synchronize the selected content types with Recombee?
        </p>
        <footer className="modal-footer">
          <div className="btn-wrapper">
            <button
              className="btn btn--secondary"
              onClick={closeConfirmation}
            >
              Cancel
            </button>
          </div>
          <div className="btn-wrapper">
            <button
              autoFocus={isConfirmDialogVisible}
              className="btn btn--primary"
              onClick={submitConfirmation}
            >
              Synchronize
            </button>
          </div>
        </footer>
      </Modal>
    </div>
  );
};

RegisterTypeSection.displayName = 'RegisterTypeSection';

const getTypeId = (t: IContentType) => t.system.id;
const getTypeName = (t: IContentType) => t.system.name;
