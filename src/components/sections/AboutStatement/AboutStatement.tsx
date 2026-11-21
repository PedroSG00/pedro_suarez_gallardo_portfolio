import type { CSSProperties } from 'react';
import styles from './AboutStatement.module.css';

type AboutStatementProps = {
  text: string;
};

export default function AboutStatement({ text }: AboutStatementProps) {
  if (!text) {
    return null;
  }

  const visualParts = text.split(/(\s+)/);
  const wordCount = visualParts.filter((part) => !/^\s+$/.test(part)).length;
  let wordIndex = 0;

  return (
    <p
      role="group"
      aria-label={text}
      className={`${styles.statement} text-title font-emphasis`}
      data-about-statement
    >
      <span className={styles.content} data-about-statement-content aria-hidden="true">
        {visualParts.map((part, index) =>
          /^\s+$/.test(part) ? (
            part
          ) : (
            <span
              key={index}
              className={styles.word}
              data-about-statement-word
              style={
                {
                  '--about-statement-boundary': `${((++wordIndex / wordCount) * 100).toFixed(6)}%`,
                } as CSSProperties
              }
            >
              {part}
            </span>
          ),
        )}
      </span>
    </p>
  );
}
