import { getBranding } from '@/lib/actions/utility';
import { auth } from '@/lib/auth';
import NavMenu from './Menu';

const NavbarWrapper = async () => {
  const sessionPromise = auth();
  const session = await sessionPromise;
  const brandingPromise = getBranding();
  const branding = await brandingPromise;
  const url = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const logo = {
    url: branding?.organizationUrl ?? url,
    src: branding?.organizationLogoPath ?? '/logo.png',
    alt: branding?.organizationName ?? 'Logo',
    title: branding?.organizationName ?? 'FlexFacilities',
  };

  return <NavMenu logo={logo} session={session} />;
};

export default NavbarWrapper;
