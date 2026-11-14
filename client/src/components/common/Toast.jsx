import { AnimatePresence,motion } from 'framer-motion';
export default function Toast({message}){return <AnimatePresence>{message&&<motion.div className="toast" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:15}}>{message}</motion.div>}</AnimatePresence>}
