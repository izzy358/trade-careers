import { redirect } from 'next/navigation';

export default function CreateProfileRedirectPage() {
  redirect('/installers/register');
}
