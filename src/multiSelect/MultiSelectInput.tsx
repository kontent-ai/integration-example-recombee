import { forwardRef } from "react";
import { Options, useHotkeys } from "react-hotkeys-hook";

type Props = Readonly<{
  value: string;
  isDisabled: boolean;
  areShortcutsEnabled: boolean;
  onChange: (newValue: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemoveLast: () => void;
}>;

const createHotkeysOptions = (enabled: boolean): Options => ({
  enableOnFormTags: ["INPUT"],
  enabled,
});

export const MultiSelectInput = forwardRef<HTMLInputElement, Props>((props, forwardedRef) => {
  useHotkeys("enter", preventDefaultAnd(props.onSubmit), createHotkeysOptions(props.areShortcutsEnabled), [
    props.onSubmit,
  ]);
  useHotkeys("up", preventDefaultAnd(props.onMoveUp), createHotkeysOptions(props.areShortcutsEnabled), [
    props.onMoveUp,
  ]);
  useHotkeys("down", preventDefaultAnd(props.onMoveDown), createHotkeysOptions(props.areShortcutsEnabled), [
    props.onMoveDown,
  ]);
  useHotkeys(
    "backspace",
    e => !props.value && preventDefaultAnd(props.onRemoveLast)(e),
    createHotkeysOptions(props.areShortcutsEnabled),
    [props.onRemoveLast, props.value],
  );

  return (
    <input
      ref={forwardedRef}
      className="multi-select__input"
      disabled={props.isDisabled}
      type="text"
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
});

MultiSelectInput.displayName = "MultiSelectInput";

const preventDefaultAnd = (fnc: () => void) => (e: KeyboardEvent) => {
  e.preventDefault();
  fnc();
};
