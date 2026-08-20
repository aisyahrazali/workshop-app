/** Real food photos (stored in /public/menu) keyed by menu item name.
 *  Items without a photo (e.g. Milo Ais) fall back to their emoji, so a
 *  menu item never breaks just because a picture is missing. */
export const MENU_IMAGES: Record<string, string> = {
  "Nasi Lemak Ayam": "/menu/nasi-lemak.jpg",
  "Hainanese Chicken Rice": "/menu/chicken-rice.jpg",
  "Mee Goreng Mamak": "/menu/mee-goreng.jpg",
  "Curry Mee": "/menu/curry-mee.jpg",
  "Kaya Butter Toast": "/menu/kaya-toast.jpg",
  "Half-Boiled Eggs": "/menu/half-boiled-eggs.jpg",
  "Teh Tarik": "/menu/teh-tarik.jpg",
  "Kopi O": "/menu/kopi-o.jpg",
  "Kopi Peng": "/menu/kopi-peng.jpg",
  "Teh O Limau": "/menu/teh-o-limau.jpg",
  "Cendol": "/menu/cendol.jpg",
  "Ais Kacang": "/menu/ais-kacang.jpg",
  "Pisang Goreng": "/menu/pisang-goreng.jpg",
  "Kuih Lapis": "/menu/kuih-lapis.jpg",
};

export function menuImage(name: string): string | undefined {
  return MENU_IMAGES[name];
}
