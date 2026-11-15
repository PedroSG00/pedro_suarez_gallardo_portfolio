/**
 * Inline theme bootstrap script — T12 (RF-6)
 *
 * This is the single boot-time reader of the stored theme and the only script
 * that sets the initial theme class on <html>. It must run synchronously in
 * <head> before the body is painted to avoid a flash of the wrong theme.
 *
 * Shared by the locale root layout and the global not-found document so both
 * apply the effective theme the same way.
 */
export const THEME_BOOT_SCRIPT = `(function(){
  try{
    var t=localStorage.getItem('theme');
    if(t==='light'||t==='dark'||t==='system'){
      document.documentElement.classList.remove('theme-light','theme-dark','theme-system');
      document.documentElement.classList.add('theme-'+t);
    }
  }catch(e){}
})();`;
