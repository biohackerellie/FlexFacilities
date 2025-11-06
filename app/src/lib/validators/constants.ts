export type SideBarType = {
  title: string;
  href: string;
}[];

const userSideBar: SideBarType = [
  { title: 'Reservations', href: '/account' },
  { title: 'Details', href: '/account/details' },
];

const adminSideBar: SideBarType = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Reservations', href: '/admin/reservations' },
  { title: 'Requests', href: '/admin/requests' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Facilities', href: '/admin/facilities' },
];

export { adminSideBar, userSideBar };
