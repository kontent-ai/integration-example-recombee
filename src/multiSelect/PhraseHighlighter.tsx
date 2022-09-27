import { FC, memo } from 'react';

type Props = Readonly<{
  phrase: string;
  children: string;
}>;

export const PhraseHighlighter: FC<Props> = memo(props =>
  props.phrase
    ? (
      <>
        {props.children
          .toLowerCase()
          .split(props.phrase.toLowerCase())
          .reduce(({ currentPosition, result }, unmatchedPart) => {
            result.push(props.children.slice(currentPosition, currentPosition + unmatchedPart.length));
            if (currentPosition + unmatchedPart.length < props.children.length) {
              const matchStart = currentPosition + unmatchedPart.length;
              result.push(props.children.slice(matchStart, matchStart + props.phrase.length));
            }
            return {
              currentPosition: currentPosition + unmatchedPart.length + props.phrase.length,
              result,
            };
          }, { currentPosition: 0, result: [] as string[] })
          .result
          .map((part, i) => part.toLowerCase() === props.phrase.toLowerCase()
            ? <b key={i}>{part}</b>
            : <span key={i}>{part}</span>)}
      </>
    )
    : <span>{props.children}</span>,
);

PhraseHighlighter.displayName = 'PhraseHighlighter';
