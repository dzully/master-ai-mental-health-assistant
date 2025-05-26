import { useState, useEffect } from "react";

export const useHydrationSafeDate = (initialDate?: Date) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    () => initialDate || new Date("2024-01-01T00:00:00.000Z"),
  );

  useEffect(() => {
    setIsHydrated(true);
    setCurrentDate(new Date());
  }, []);

  const createNewDate = () => {
    if (!isHydrated) {
      return new Date("2024-01-01T00:00:00.000Z");
    }
    return new Date();
  };

  return {
    isHydrated,
    currentDate,
    createNewDate,
  };
};
