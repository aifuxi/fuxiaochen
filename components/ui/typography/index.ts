export { Title, titleVariants } from "./title";
export type { TitleProps } from "./title";

export { Text, textVariants } from "./text";
export type { TextProps } from "./text";

export { Paragraph, paragraphVariants } from "./paragraph";
export type { ParagraphProps } from "./paragraph";

export { Link, linkVariants } from "./link";
export type { LinkProps } from "./link";

import { Link } from "./link";
import { Paragraph } from "./paragraph";
import { Text } from "./text";
import { Title } from "./title";

export const Typography = {
  Title,
  Text,
  Paragraph,
  Link,
};
