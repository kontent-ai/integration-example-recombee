import { DeliveryClient, IContentType } from '@kontent-ai/delivery-sdk';
import { FC, useEffect, useState } from 'react';

import { PoweredByLogo } from './PoweredByLogo';
import { RegisteredTypes } from './RegisteredTypes';
import { RegisterTypeSection } from './RegisterTypeSection';
import { notNull } from './typeguards';

const functionUrl = '/.netlify/functions/recombee-init-function';

export const RecombeeTypesManager: FC = () => {
  const [registeredTypesIds, setRegisteredTypesIds] = useState<ReadonlyArray<string> | null>(null);
  const [allTypes, setAllTypes] = useState<ReadonlyMap<string, IContentType> | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [config, setConfig] = useState<RecombeeConfig | null>(null);

  const registerTypes = (typesToRegister: ReadonlyArray<IContentType>) => {
    const typesToRegisterWithoutDuplicates = typesToRegister
      .map(t => t.system.id)
      .filter(id => !registeredTypesIds?.includes(id));
    const newRegisteredTypeIds = [...registeredTypesIds ?? [], ...typesToRegisterWithoutDuplicates];

    const createBody = (t: IContentType) => JSON.stringify({ ...config, contentType: t.system.codename });
    Promise.all(typesToRegister.map(t => fetch(functionUrl, { method: 'POST', body: createBody(t) })))
      .then(() => {
        setRegisteredTypesIds(newRegisteredTypeIds);
        CustomElement.setValue(JSON.stringify(newRegisteredTypeIds));
      })
      .catch(e => {
        console.error('Failed to synchronize types: ', e);
      });
  };

  useEffect(() => {
    CustomElement.init((element, context) => {
      if (typeof element.config?.recombeeApiId !== 'string') {
        console.error('Missing or incorrect "recombeeApiId" in the custom element config.');
        return;
      }
      setConfig({
        projectId: context.projectId,
        language: context.variant.codename,
        recombeeApiId: element.config.recombeeApiId,
      });
      setRegisteredTypesIds(JSON.parse(element.value ?? '[]'));

      new DeliveryClient({ projectId: context.projectId })
        .types()
        .toPromise()
        .then(response => setAllTypes(new Map(response.data.items.map(t => [t.system.id, t]))));

      setIsDisabled(element.disabled);
      CustomElement.setHeight(350);
    });
  }, []);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  if (!registeredTypesIds || !allTypes || !config) {
    return null;
  }

  return (
    <div style={{ padding: 14 }}>
      <h1>Manage content recommendations</h1>
      <div className="divider" />
      <RegisteredTypes types={registeredTypesIds.map(id => allTypes.get(id) ?? null).filter(notNull)} />
      <div className="divider" />
      <RegisterTypeSection
        allTypes={[...allTypes.values()]}
        onRegisterTypes={registerTypes}
        isDisabled={isDisabled}
      />
      <div style={{ marginTop: 100 }}>
        <PoweredByLogo />
      </div>
    </div>
  );
};

RecombeeTypesManager.displayName = 'RecombeeTypesManager';

type RecombeeConfig = Readonly<{
  projectId: string;
  language: string;
  recombeeApiId: string;
}>;
