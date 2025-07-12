import React from "react";

import {
  AnimatePresence,
  HTMLMotionProps,
  Variants as _Variants,
  motion,
} from "motion/react";

import { cn } from "@/lib/utils";

import {
  TRANSITION_EASINGS,
  Variants,
  WithTransitionConfig,
  withDelay,
} from "./collapse-transition-utils";

const defaultTransitions = {
  exit: {
    height: { duration: 0.2, ease: TRANSITION_EASINGS.ease },
    opacity: { duration: 0.3, ease: TRANSITION_EASINGS.ease },
  },
  enter: {
    height: { duration: 0.3, ease: TRANSITION_EASINGS.ease },
    opacity: { duration: 0.4, ease: TRANSITION_EASINGS.ease },
  },
};

const variants: Variants<CollapseOptions> = {
  exit: ({ animateOpacity, transition, transitionEnd, delay }) => ({
    ...(animateOpacity && { opacity: 0 }),
    height: 0,
    transitionEnd: transitionEnd?.exit,
    transition:
      transition?.exit ?? withDelay.exit(defaultTransitions.exit, delay),
  }),
  enter: ({
    animateOpacity,
    endingHeight,
    transition,
    transitionEnd,
    delay,
  }) => ({
    ...(animateOpacity && { opacity: 1 }),
    height: endingHeight,
    transitionEnd: transitionEnd?.enter,
    transition:
      transition?.enter ?? withDelay.enter(defaultTransitions.enter, delay),
  }),
};

interface CollapseOptions {
  /**
   * If `true`, the opacity of the content will be animated
   * @default true
   */
  animateOpacity?: boolean;
  /**
   * The height you want the content in its collapsed state.
   * @default 0
   */
  endingHeight?: number | string;
}

interface Props
  extends WithTransitionConfig<HTMLMotionProps<"div">>,
    CollapseOptions {}

export default React.forwardRef<HTMLDivElement, Props>(function Collapse(
  {
    in: isOpen,
    unmountOnExit,
    animateOpacity = true,
    endingHeight = "auto",
    style,
    className,
    transition,
    transitionEnd,
    children,
    ...rest
  },
  ref
) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    });
    return () => clearTimeout(timeout);
  }, []);

  const custom = {
    endingHeight,
    animateOpacity,
    transition: !mounted ? { enter: { duration: 0 } } : transition,
    transitionEnd: {
      enter: transitionEnd?.enter,
      exit: unmountOnExit
        ? transitionEnd?.exit
        : { ...transitionEnd?.exit, display: "none" },
    },
  };

  const show = unmountOnExit ? isOpen : true;
  const animate = isOpen || unmountOnExit ? "enter" : "exit";

  return (
    <AnimatePresence initial={false} custom={custom}>
      {show && (
        <motion.div
          ref={ref}
          {...rest}
          className={cn("", className)}
          style={{
            overflow: "hidden",
            display: "block",
            ...style,
          }}
          custom={custom}
          variants={variants as _Variants}
          initial={unmountOnExit ? "exit" : false}
          animate={animate}
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
