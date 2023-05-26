import { PhraseHighlighter } from "./PhraseHighlighter";

type Props<Option> = Readonly<{
  options: ReadonlyArray<Option>;
  selectedOptions: ReadonlyArray<Option>;
  searchPhrase: string;
  focusedOptionId: string;
  onClick: (type: Option) => void;
  onMouseEnter: (type: Option) => void;
  getOptionId: (o: Option) => string;
  getOptionName: (o: Option) => string;
}>;

export const MultiSelectDropdown = <Option extends unknown>(props: Props<Option>) => (
  <div className="multi-select__dropdown">
    <div className="multi-select__dropdown-options">
      {props.options.map(o => (
        <div
          key={props.getOptionId(o)}
          id={props.getOptionId(o)}
          onClick={() => props.onClick(o)}
          onMouseEnter={() => props.onMouseEnter(o)}
          className={`
          multi-select__dropdown-option 
          ${props.getOptionId(o) === props.focusedOptionId ? "multi-select__dropdown-option--is-highlighted" : ""} 
          ${
            props.selectedOptions.find(s => props.getOptionId(s) === props.getOptionId(o))
              ? "multi-select__dropdown-option--is-selected"
              : ""
          }
          `}
        >
          <div
            className="multi-select__dropdown-option-name"
            title={props.getOptionName(o)}
          >
            <PhraseHighlighter phrase={props.searchPhrase}>
              {props.getOptionName(o)}
            </PhraseHighlighter>
          </div>
        </div>
      ))}
    </div>
  </div>
);

MultiSelectDropdown.displayName = "MultiSelectDropdown";
