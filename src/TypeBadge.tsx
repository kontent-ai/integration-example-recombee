import { FC } from "react";

type Props = Readonly<{
  name: string;
  onRemove?: () => void;
  isDisabled?: boolean;
}>;

export const TypeBadge: FC<Props> = props => (
  <div
    className={`multi-select__option multi-select__option--green ${
      props.isDisabled ? "multi-select__option--is-disabled" : ""
    }`}
  >
    <div className="multi-select__option-name">
      {props.name}
    </div>
    {!!props.onRemove && !props.isDisabled && (
      <div
        className="multi-select__option-remove-button"
        onClick={props.onRemove}
      >
        <i className="icon-times" />
      </div>
    )}
  </div>
);

TypeBadge.displayName = "TypeBadge";
