export interface MenuItem {
  sub: string;
  sticker: string;
  title: string;
  count?: string;
  bg?: string;
  children?: MenuItem[];
}