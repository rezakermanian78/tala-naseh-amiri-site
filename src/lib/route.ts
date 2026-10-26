/** /admin and anything under it is the admin panel; everything else is the public site. */
export const isAdminRoute = /^\/admin(\/|$)/.test(window.location.pathname)
