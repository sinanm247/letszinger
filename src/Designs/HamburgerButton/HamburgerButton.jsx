import React, { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import "./HamburgerButton.scss";

const HamburgerButton = ({ onClick }) => {
  const [active, setActive] = useState(false);
  const MotionButton = motion.button;
  const MotionSpan = motion.span;

  const handleClick = () => {
    setActive((prev) => !prev);
    if (onClick) onClick(); // Optional callback for parent component
  };

  return (
    <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
      <MotionButton
        initial={false}
        animate={active ? "open" : "closed"}
        onClick={handleClick}
        className="hamburger-btn"
      >
        <MotionSpan variants={VARIANTS.top} className="bar top" />
        <MotionSpan variants={VARIANTS.middle} className="bar middle" />
        <MotionSpan variants={VARIANTS.bottom} className={`bar bottom ${active ? "hide" : ""}`} />
      </MotionButton>
    </MotionConfig>
  );
};

export default HamburgerButton;

const VARIANTS = {
  top: {
    open: { rotate: ["0deg", "0deg", "45deg"], top: ["35%", "50%", "50%"] },
    closed: { rotate: ["45deg", "0deg", "0deg"], top: ["50%", "50%", "35%"] },
  },
  middle: {
    open: { rotate: ["0deg", "0deg", "-45deg"] },
    closed: { rotate: ["-45deg", "0deg", "0deg"] },
  },
  bottom: {
    open: { rotate: ["0deg", "0deg", "45deg"], bottom: ["35%", "50%", "50%"], left: "50%" },
    closed: { rotate: ["45deg", "0deg", "0deg"], bottom: ["50%", "50%", "35%"], left: "calc(50% + 10px)" },
  },
};
