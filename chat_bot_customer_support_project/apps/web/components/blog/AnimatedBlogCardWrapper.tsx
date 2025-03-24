"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

interface AnimatedBlogCardWrapperProps {
  children: ReactNode;
  index: number;
  href: string;
}

export default function AnimatedBlogCardWrapper({
  children,
  index,
  href,
}: AnimatedBlogCardWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  if (!isMounted) {
    return (
      <Link href={href} className="block h-full">
        {children}
      </Link>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className="block h-full">
        {children}
      </Link>
    </motion.div>
  );
}
