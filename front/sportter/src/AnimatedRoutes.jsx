import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [routeChanged, setRouteChanged] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setRouteChanged(true);
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setDisplayLocation(location);
        setRouteChanged(false);
      }, 1500);
        
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && routeChanged ? (
          <motion.div
            key="darken"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 9998,
            }}
          />
        ) : null}

        {isLoading && routeChanged ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key={displayLocation.pathname}
            initial={{ opacity: 1, filter: "brightness(0.7)" }}
            animate={{ opacity: 1, filter: "brightness(1)" }}
            exit={{ opacity: 1, filter: "brightness(0.7)" }}
            transition={{ 
              duration: 0,
            }}
            style={{ height: "100%", width: "100%" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimatedRoutes;