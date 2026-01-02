import { motion } from "framer-motion";

const containerVariants = {
    initial: direction => ({
        x: direction === "login" ? "100%" : "-100%",
        opacity: 0
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeInOut" }
    },
    exit: direction => ({
        x: direction === "login" ? "-100%" : "100%",
        opacity: 0,
        transition: { duration: 0.6, ease: "easeInOut" }
    })
};

const AuthLayout = ({ children, direction }) => {
    return (
        <motion.div
        className="auth-page"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        custom={direction}
        >
        {children}
        </motion.div>
    );
};

export default AuthLayout;
