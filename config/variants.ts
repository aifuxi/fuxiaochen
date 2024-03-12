import { type Variants } from 'framer-motion';

export const LIST_CONTAINER_VARIANTS: Variants = {
  visible: {
    transition: {
      delayChildren: 0.8,
      staggerChildren: 0.1,
    },
  },
};

export const LIST_ITEM_VARIANTS: Variants = {
  hidden: {
    y: -15,
    opacity: 0,
    transition: {
      type: 'ease',
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'ease',
    },
  },
};

export const HERO_SECTION_CONTAINER_VARIANTS: Variants = {
  visible: {
    transition: {
      delayChildren: 0.8,
      staggerChildren: 0.15,
    },
  },
};

export const HERO_SECTION_ITEM_VARIANTS: Variants = {
  hidden: {
    y: -15,
    opacity: 0,
    transition: {
      type: 'ease',
      duration: 0.75,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'ease',
    },
  },
};
