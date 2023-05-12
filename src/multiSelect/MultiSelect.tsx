import {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react'

import { MultiSelectDropdown } from './MultiSelectDropdown';
import { MultiSelectInput } from './MultiSelectInput';

type Props<Option> = Readonly<{
  isDisabled: boolean;
  selectedOptions: ReadonlyArray<Option>;
  allOptions: ReadonlyArray<Option>;
  getOptionId: (option: Option) => string;
  getOptionName: (option: Option) => string;
  onToggleOptionSelection: (option: Option) => void;
  renderSelectedOption: (option: Option) => ReactNode;
}>;

export const MultiSelect = <Option extends unknown>(props: Props<Option>) => {
  const { getOptionId, getOptionName, onToggleOptionSelection } = props;
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [manuallyFocusedOptionId, setManuallyFocusedOptionId] = useState<string | null>(null);

  const searchResult = useMemo(() => searchValue
    ? props.allOptions.filter(option => getOptionName(option).toLowerCase().includes(searchValue.toLowerCase()))
    : props.allOptions, [searchValue, props.allOptions, getOptionName]);

  const getOptionIdOrNull = useCallback((o: Option | null | undefined) => o === null || o === undefined ? null
    : getOptionId(o), [getOptionId]);

  const focusedOptionId = getOptionIdOrNull(searchResult.find(o => props.getOptionId(o) === manuallyFocusedOptionId)) ?? getOptionIdOrNull(searchResult[0]);

  const moveFocus = useCallback((moveBy: number) => {
    const newFocusedOptionId = moveFocusedOption(searchResult, getOptionIdOrNull, focusedOptionId ?? '', moveBy);
    document.getElementById(newFocusedOptionId ?? '')?.scrollIntoView({ block: 'nearest' });
    setManuallyFocusedOptionId(newFocusedOptionId);
  }, [focusedOptionId, searchResult, getOptionIdOrNull]);

  const moveFocusDown = useCallback(() => moveFocus(1), [moveFocus]);
  const moveFocusUp = useCallback(() => moveFocus(-1), [moveFocus]);

  const toggleFocusedOption = useCallback(() => {
    setSearchValue('');
    const optionToToggle = props.allOptions.find(o => getOptionId(o) === focusedOptionId);
    if (!optionToToggle) {
      return;
    }
    onToggleOptionSelection(optionToToggle);
  }, [props.allOptions, focusedOptionId, onToggleOptionSelection, getOptionId]);

  const removeLastSelected = useCallback(() => {
    const lastSelected = props.selectedOptions[props.selectedOptions.length - 1];
    if (!lastSelected) {
      return;
    }
    return onToggleOptionSelection(lastSelected);
  }, [props.selectedOptions, onToggleOptionSelection]);

  const isDropdownVisible = isFocused && !props.isDisabled;

  return (
    <div
      className={`multi-select multi-select--with-dropdown ${isFocused ? 'multi-select--has-focus' : ''}`}
      onClick={() => !props.isDisabled && inputRef.current?.focus()}
    >
      <div className="multi-select__option-area">
        {props.selectedOptions.map(props.renderSelectedOption)}
        <div className="multi-select__search-field">
          <MultiSelectInput
            ref={inputRef}
            value={searchValue}
            areShortcutsEnabled={!!isFocused && !props.isDisabled}
            isDisabled={props.isDisabled}
            onChange={setSearchValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmit={toggleFocusedOption}
            onMoveDown={moveFocusDown}
            onMoveUp={moveFocusUp}
            onRemoveLast={removeLastSelected}
          />
        </div>
      </div>
      <div className="multi-select__drop-down-actions">
        <div className="multi-select__drop-down-expand">
          <i className={`multi-select__drop-down-expand-icon icon-chevron-${isDropdownVisible ? 'up' : 'down'}`} />
        </div>
      </div>
      {!!isDropdownVisible && (
        <div
          style={{ position: 'absolute', top: '105%', left: 0 }}
          onMouseDown={e => e.preventDefault()}
        >
          <MultiSelectDropdown
            options={searchResult}
            selectedOptions={props.selectedOptions}
            searchPhrase={searchValue}
            focusedOptionId={focusedOptionId ?? ''}
            onClick={onToggleOptionSelection}
            onMouseEnter={o => setManuallyFocusedOptionId(props.getOptionId(o))}
            getOptionId={props.getOptionId}
            getOptionName={props.getOptionName}
          />
        </div>
      )}
    </div>
  );
};

MultiSelect.displayName = 'MultiSelect';

const moveFocusedOption = <Option extends unknown>(allOptions: ReadonlyArray<Option>, getOptionId: (o: Option | null | undefined) => string | null, focusedOptionId: string, moveBy: number): string | null => {
  const focusedIndex = allOptions.findIndex(o => getOptionId(o) === focusedOptionId);
  if (focusedIndex < 0) {
    return getOptionId(allOptions[0]);
  }

  const moved = focusedIndex + moveBy;

  return getOptionId(allOptions[(allOptions.length + moved) % allOptions.length]);
};
