import { FC, ReactNode, useEffect, useRef } from 'react';

type Props = Readonly<{
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}>;

export const Modal: FC<Props> = props => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (props.isOpen) {
      dialog?.showModal();
    }

    return () => dialog?.close();
  }, [props.isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={props.onClose}
      onCancel={props.onClose}
    >
      <header className="modal-header">
        <h2 style={{ margin: 0 }}>{props.title}</h2>
        <button
          className="btn btn--quinary btn--square btn--square btn--square-quinary"
          onClick={() => dialogRef.current?.close()}
        >
          <i className="icon-times" />
        </button>
      </header>
      {props.children}
    </dialog>
  );
};

Modal.displayName = 'Modal';
