/**
 * app/[locale]/[...rest]/page.tsx — T16 (RF-5, RF-7)
 * Any unknown route under a valid locale → notFound(). Preserves the resolved
 * locale and never repeats the requested path on screen.
 */

import { notFound } from 'next/navigation';

export default async function RestPage() {
  notFound();
}
