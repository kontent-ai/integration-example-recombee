import { FC } from 'react';
import { IContentType } from '@kontent-ai/delivery-sdk';
import { TypeBadge } from './TypeBadge';

type Props = Readonly<{
  types: ReadonlyArray<IContentType>;
}>;

export const RegisteredTypes: FC<Props> = props => (
  <div style={{ padding: '10px 0' }}>
    <b>Registered types: </b>
    <div className="multi-select__option-area" style={{ display: 'inline-flex', width: 'auto' }}>
      {!props.types.length && 'No registered types'}
      {props.types.map(type => (
        <TypeBadge key={type.system.id} name={type.system.name} />
      ))}
    </div>
  </div>
);

RegisteredTypes.displayName = 'RegisteredTypes';
