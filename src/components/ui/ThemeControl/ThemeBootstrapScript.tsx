'use client';

type Props = {
  html: string;
};

const SERVER_SCRIPT_TYPE = 'text/javascript';
const CLIENT_SCRIPT_TYPE = 'text/plain';
const SCRIPT_ID = 'theme-bootstrap';

/**
 * Runs theme initialization during HTML parsing, then remains inert when React
 * re-renders the localized layout during client-side navigation.
 */
export function ThemeBootstrapScript({ html }: Props) {
  return (
    <script
      id={SCRIPT_ID}
      type={typeof window === 'undefined' ? SERVER_SCRIPT_TYPE : CLIENT_SCRIPT_TYPE}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
